import { CollectionBeforeChangeHook } from 'payload'
import { CloudinaryPluginConfig } from '../types/CloudinaryPluginConfig'
import { streamUpload } from '../utils/streamUpload'

const beforeChangeHook = (pluginConfig: CloudinaryPluginConfig) => {
  const hook: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
    if (operation === 'create' && !req.file) {
      console.error('req.file undefined. Returning data unchanged.')
      return data
    }

    // The image of a media document can be updated via the admin UI. Therefore also check for operation === 'update'.
    if ((operation === 'create' || operation === 'update') && req.file) {
      const streamUploadFunction = streamUpload(pluginConfig)

      const result = await streamUploadFunction(req.file, data.cloudinaryPublicId)

      return {
        ...data,
        cloudinaryPublicId: result.public_id,
        cloudinaryURL: result.secure_url,
      }
    }

    return data
  }
  return hook
}

export default beforeChangeHook
