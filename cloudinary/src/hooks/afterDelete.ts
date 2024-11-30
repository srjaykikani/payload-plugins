import { CollectionAfterDeleteHook } from 'payload'
import { v2 as cloudinary } from 'cloudinary'

/** Hooks which deletes the file from Cloudinary */
const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc }) => {
  await cloudinary.uploader.destroy(doc.cloudinaryPublicId, (error: any, result: any) => {
    console.error('Error deleting file from Cloudinary:', error, result)
  })
  return doc
}

export default afterDeleteHook
