import type { HandleDelete } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'

import path from 'path'

type HandleDeleteArgs = {
  baseUrl: string
  folderSrc: string
  prefix?: string
}

export const getHandleDelete = ({ folderSrc }: HandleDeleteArgs): HandleDelete => {
  return async ({ doc: { prefix = '' }, filename }) => {
    const publicId = path.posix.join(folderSrc, prefix, filename)

    const result = await cloudinary.uploader.destroy(publicId)

    console.log('result', result)

    return result
  }
}
