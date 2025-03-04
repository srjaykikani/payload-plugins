import { APIError, CollectionAfterDeleteHook } from 'payload'
import { v2 as cloudinary } from 'cloudinary'

/** Hooks which deletes the file from Cloudinary */
const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc }) => {
  type ReturnType = {
    result?: 'ok' | 'not-found' | any
  }

  const result = (await cloudinary.uploader.destroy(doc.cloudinaryPublicId)) as ReturnType

  if (result?.result === 'ok') {
    return doc
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

export default afterDeleteHook
