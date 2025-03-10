import type { HandleDelete } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'

import path from 'path'
import { APIError } from 'payload'

type HandleDeleteArgs = {
  baseUrl: string
  folderSrc: string
  prefix?: string
}

export const getHandleDelete = ({ folderSrc }: HandleDeleteArgs): HandleDelete => {
  return async ({ doc: { prefix = '' }, filename }) => {
    // TODO: fix the public id generation
    const publicId = path.posix.join(folderSrc, prefix, filename)

    type ReturnType = {
      result?: 'ok' | 'not-found' | any
    }

    const result = (await cloudinary.uploader.destroy(publicId)) as ReturnType

    if (result?.result === 'ok') {
      return result
    } else if (result?.result === 'not found') {
      throw new APIError(
        'File to delete not found in Cloudinary', // message
        500, // status
        result, // data
        true, // isPublic
      )
    } else {
      throw new APIError(
        'Error deleting file from Cloudinary', // message
        500, // status
        result, // data
        true, // isPublic
      )
    }
  }
}
