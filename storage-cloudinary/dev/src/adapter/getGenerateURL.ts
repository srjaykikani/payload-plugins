import type { GenerateURL } from '@payloadcms/plugin-cloud-storage/types'
import type { v2 as cloudinary } from 'cloudinary'
import { config } from 'next/dist/build/templates/pages'
import path from 'path'

interface GenerateUrlArgs {
  folderSrc: string
  getStorageClient: () => typeof cloudinary
}

export const getGenerateUrl = ({ folderSrc, getStorageClient }: GenerateUrlArgs): GenerateURL => {
  return ({ filename, prefix = '' }) => {
    const filePath = path.posix.join(folderSrc, prefix, filename)
    const ext = path.extname(filename).toLowerCase()
    // const resourceType = getResourceType(ext)
    // TODO: get resource type
    const resourceType = 'image'
    const baseUrl = `https://res.cloudinary.com/${config.cloud_name}`

    switch (resourceType) {
      case 'video':
        return `${baseUrl}/video/upload/f_auto,q_auto/${filePath}`
      case 'image':
        return `${baseUrl}/image/upload/f_auto,q_auto/${filePath}`
      case 'raw':
        return `${baseUrl}/raw/upload/${filePath}`
      default:
        return `${baseUrl}/auto/upload/${filePath}`
    }
  }
}
