import type {
  Adapter,
  ClientUploadsConfig,
  PluginOptions as CloudStoragePluginOptions,
  CollectionOptions,
  GeneratedAdapter,
} from '@payloadcms/plugin-cloud-storage/types'
import { initClientUploads } from '@payloadcms/plugin-cloud-storage/utilities'
import type { Config, Field, Plugin, UploadCollectionSlug } from 'payload'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { ConfigOptions as CloudinaryConfigOptions } from 'cloudinary'
import { getGenerateUrl } from './generateURL.js'
import { getClientUploadRoute } from './getClientUploadRoute.js'
import { getHandleDelete } from './handleDelete.js'
import { getHandleUpload } from './handleUpload.js'
import { getStaticHandler } from './staticHandler.js'
import { getAdminThumbnail } from './getAdminThumbnail.js'
import { CloudinaryClientUploadHandlerExtra } from './client/CloudinaryClientUploadHandler.js'

export type CloudinaryStorageOptions = {
  /**
   * Do uploads directly on the client, to bypass limits on Vercel.
   */
  clientUploads?: ClientUploadsConfig

  /**
   * Collections to apply the Cloudinary storage adapter to
   */
  collections: Partial<Record<UploadCollectionSlug, Omit<CollectionOptions, 'adapter'> | true>>

  /**
   * Whether or not to enable the plugin
   *
   * Default: true
   */
  enabled?: boolean

  /**
   * Cloudinary client configuration.
   *
   * @see https://github.com/cloudinary/cloudinary_npm
   */
  config: CloudinaryConfigOptions

  /**
   * Folder name to upload files.
   */
  folder?: string
}

const defaultUploadOptions: Partial<CloudinaryStorageOptions> = {
  enabled: true,
}

type CloudinaryStoragePlugin = (cloudinaryStorageOpts: CloudinaryStorageOptions) => Plugin

export const cloudinaryStorage: CloudinaryStoragePlugin =
  (options: CloudinaryStorageOptions) =>
  (incomingConfig: Config): Config => {
    if (options.enabled === false) {
      return incomingConfig
    }

    const optionsWithDefaults = {
      ...defaultUploadOptions,
      ...options,
    }

    const baseUrl = `https://res.cloudinary.com/${options.config.cloud_name}`

    const fields: Field[] = [
      {
        name: 'cloudinaryPublicId',
        type: 'text',
        required: true,
        admin: {
          hidden: true,
        },
      },
      {
        name: 'cloudinarySecureUrl',
        type: 'text',
        required: true,
        admin: {
          hidden: true,
        },
      },
    ]

    initClientUploads<
      CloudinaryClientUploadHandlerExtra,
      CloudinaryStorageOptions['collections'][string]
    >({
      clientHandler:
        '@jhb.software/payload-storage-cloudinary/client#CloudinaryClientUploadHandler',
      collections: options.collections,
      config: incomingConfig,
      enabled: !!options.clientUploads,
      extraClientHandlerProps: (collection) => ({
        baseURL: baseUrl,
        prefix: (typeof collection === 'object' && collection.prefix) || '',
        folder: options.folder,
      }),
      serverHandler: getClientUploadRoute({
        access:
          typeof options.clientUploads === 'object' ? options.clientUploads.access : undefined,
      }),
      serverHandlerPath: '/cloudinary-client-upload-route', // the route where the signature is generated
    })

    const adapter = cloudinaryStorageInternal({ ...optionsWithDefaults, baseUrl })

    // Add adapter to each collection option object
    const collectionsWithAdapter: CloudStoragePluginOptions['collections'] = Object.entries(
      options.collections,
    ).reduce(
      (acc, [slug, collOptions]) => ({
        ...acc,
        [slug]: {
          ...(collOptions === true ? {} : collOptions),
          adapter,
        },
      }),
      {} as Record<string, CollectionOptions>,
    )

    // Set disableLocalStorage: true for collections specified in the plugin options
    const config = {
      ...incomingConfig,
      collections: (incomingConfig.collections || []).map((collection) => {
        if (!collectionsWithAdapter[collection.slug]) {
          return collection
        }

        return {
          ...collection,
          upload: {
            ...(typeof collection.upload === 'object' ? collection.upload : {}),
            disableLocalStorage: true,
            crop: false,
            adminThumbnail: getAdminThumbnail,
          },
          fields: [...fields, ...(collection.fields || [])],
        }
      }),
    }

    return cloudStoragePlugin({
      collections: collectionsWithAdapter,
    })(config)
  }

function cloudinaryStorageInternal(
  options: { baseUrl: string } & CloudinaryStorageOptions,
): Adapter {
  return ({ prefix }): GeneratedAdapter => {
    const { baseUrl, config } = options

    const folderSrc = options.folder ? options.folder.replace(/^\/|\/$/g, '') + '/' : ''

    return {
      name: 'cloudinary',
      generateURL: getGenerateUrl(),
      handleDelete: getHandleDelete(),
      handleUpload: getHandleUpload({
        baseUrl,
        folderSrc,
        prefix,
        config,
      }),
      staticHandler: getStaticHandler(),
    }
  }
}
