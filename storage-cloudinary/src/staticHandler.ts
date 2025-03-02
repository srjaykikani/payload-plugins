import type { StaticHandler } from '@payloadcms/plugin-cloud-storage/types'
import type { CollectionConfig } from 'payload'

import { getFilePrefix } from '@payloadcms/plugin-cloud-storage/utilities'
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'

type StaticHandlerArgs = {
  folderSrc: string
}

export const getStaticHandler = (
  { folderSrc }: StaticHandlerArgs,
  collection: CollectionConfig,
): StaticHandler => {
  return async (req, { params: { filename } }) => {
    try {
      const prefix = await getFilePrefix({ collection, filename, req })
      const fileKey = path.posix.join(folderSrc, prefix, encodeURIComponent(filename))

      const resourceType = 'image' // TODO

      const result = await cloudinary.api.resource(fileKey.replace(/\.[^/.]+$/, ''), {
        resource_type: resourceType,
      })

      if (!result || !result.secure_url) {
        return new Response(null, { status: 404, statusText: 'Not Found' })
      }

      // TODO: handle etag etc....

      // Redirect to Cloudinary URL
      return new Response(null, {
        status: 302,
        headers: {
          Location: result.secure_url,
        },
      })
    } catch (err: unknown) {
      // TODO: catch not found errors from cloudinary

      req.payload.logger.error({ err, msg: 'Unexpected error in staticHandler' })
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}
