import { streamUpload } from '../utils/streamUpload'
import { CollectionBeforeChangeHook } from 'payload'

const beforeChangeHook: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation === 'create' && !req.file) {
    console.error('req.file undefined. Returning data unchanged.')
    return data
  }

  // The image of a media document can be updated via the admin UI. Therefore also check for operation === 'update'.
  if ((operation === 'create' || operation === 'update') && req.file) {
    const result = await streamUpload(req.file, data.cloudinaryPublicId)

    return {
      ...data,
      cloudinaryPublicId: result.public_id,
      cloudinaryURL: result.secure_url,
    }
  }

  return data
}

export default beforeChangeHook
