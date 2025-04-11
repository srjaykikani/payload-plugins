import type { HandleDelete } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'
import { APIError } from 'payload'

export const getHandleDelete = (): HandleDelete => {
  return async ({ doc }) => {
    if (!doc.cloudinaryPublicId) {
      throw new APIError('File is missing a cloudinaryPublicId', 500)
    }

    type ReturnType = {
      result?: 'ok' | 'not-found' | any
    }

    const result = (await cloudinary.uploader.destroy(doc.cloudinaryPublicId)) as ReturnType

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
