import type { CollectionConfig } from 'payload'
import afterDeleteHook from '../hooks/afterDelete'
import beforeChangeHook from '../hooks/beforeChange'
import { CloudinaryPluginConfig } from '../types/CloudinaryPluginConfig'

/**
 * Extends the given `CollectionConfig` with all hooks and fields needed for the Cloudinary integration.
 */
export const extendUploadCollectionConfig = ({
  config,
  pluginConfig,
}: {
  config: CollectionConfig
  pluginConfig: CloudinaryPluginConfig
}): CollectionConfig => ({
  ...config,
  admin: {
    defaultColumns: ['filename', 'createdAt'],
    listSearchableFields: ['filename'],
    ...config.admin,
  },
  disableDuplicate: true,
  hooks: {
    ...config.hooks,
    beforeChange: [...(config.hooks?.beforeChange ?? []), beforeChangeHook(pluginConfig)],
    afterDelete: [...(config.hooks?.afterDelete ?? []), afterDeleteHook],
  },
  fields: [
    {
      // This field is needed to delete and update cloudinary files.
      name: 'cloudinaryPublicId',
      type: 'text',
      required: true,
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        // hide the field before the file is uploaded and the id is generated:
        condition: (data) => Boolean(data?.cloudinaryPublicId),
      },
    },
    // Payload automatically adds a `url` field to media collections.
    // To override its value to match the Cloudinary URL, we need to define it here. Otherwise updates to the media document would fail.
    {
      name: 'url',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ data }) => {
            return data?.cloudinaryURL
          },
        ],
      },
      label: 'URL',
    },
    {
      name: 'cloudinaryURL',
      label: 'Cloudinary URL',
      type: 'text',
      required: true,
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        // hide the field before the file is uploaded and the URL is generated:
        condition: (data) => Boolean(data?.cloudinaryURL),
      },
    },
    ...(config.fields ?? []),
  ],
  upload: {
    ...(typeof config.upload === 'object' ? config.upload : {}),
    disableLocalStorage: true,
    crop: false,
    // @ts-ignore
    adminThumbnail: ({ doc }: { doc: { cloudinaryURL: string; mimeType: string } }) => {
      const transformOptions = 'w_300,h_300,c_fill,f_auto,q_auto,dpr_auto'

      const newUrl = (doc.cloudinaryURL as string).replace('/upload', `/upload/${transformOptions}`)

      // As payload does not support videos as thumbnails, create an image thumbnail of the video:
      if (doc.mimeType.startsWith('video/')) {
        const videoThumbnailExtension = '.webp'
        const videoExtension = doc.cloudinaryURL.split('/').pop()?.split('.').pop()
        const videoThumbnailUrl = newUrl.replace(`.${videoExtension}`, videoThumbnailExtension)

        return videoThumbnailUrl
      }

      return newUrl
    },
  },
})
