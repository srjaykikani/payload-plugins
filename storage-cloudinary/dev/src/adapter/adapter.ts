import { GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'

import { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'
import { CollectionConfig } from 'payload'
import { getGenerateUrl } from './getGenerateURL'
import { getHandleDelete } from './getHandleDelete'
import { getHandleUpload } from './getHandleUpload'
import { getStaticHandler } from './staticHandler'

export const generateAdapter: Adapter = (args: {
  collection: CollectionConfig
  prefix?: string
}): GeneratedAdapter => {
  const folderSrc = 'cloudinary-adapter-test'

  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const storageClient = cloudinary

  function getStorageClient() {
    return storageClient
  }

  return {
    name: 'cloudinary',
    generateURL: getGenerateUrl({ folderSrc, getStorageClient }),
    handleDelete: getHandleDelete({ folderSrc, getStorageClient }),
    handleUpload: getHandleUpload({
      collection: args.collection,
      folderSrc,
      getStorageClient,
      prefix: args.prefix,
    }),
    staticHandler: getStaticHandler({
      collection: args.collection,
      folderSrc,
      getStorageClient,
    }),
  }
}
