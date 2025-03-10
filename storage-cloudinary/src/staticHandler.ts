import type { StaticHandler } from '@payloadcms/plugin-cloud-storage/types'
import type { CollectionConfig } from 'payload'

import { getFilePrefix } from '@payloadcms/plugin-cloud-storage/utilities'
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'

type StaticHandlerArgs = {
  folderSrc: string
}

// This is called:
// - after the client upload is finished with the clientUploadContext
// - whenever the file is requested from the api/[collection]/[filename] path
export const getStaticHandler = (
  { folderSrc }: StaticHandlerArgs,
  collection: CollectionConfig,
): StaticHandler => {
  return async (req, { params }) => {
    try {
      type Params = {
        filename: string
        collection: string
        clientUploadContext?: unknown
      }

      const { filename, clientUploadContext } = params as Params

      console.log('Static handler', params)
      const prefix = await getFilePrefix({ collection, filename, req })
      const fileKey = path.posix.join(folderSrc, prefix, filename)
      const publicId = fileKey.replace(/\.[^/.]+$/, '')

      const resourceType = 'image' // TODO

      console.log('publicId', publicId)

      const result = await cloudinary.api.resource(publicId)

      console.log('result', result)

      if (!result || !result.secure_url) {
        console.log('File not found', publicId)
        return new Response(null, { status: 404, statusText: 'Not Found' })
      }
      const response = await fetch(result.secure_url)
      const arrayBuffer = await response.arrayBuffer()

      // TODO: handle etag etc....

      return new Response(arrayBuffer, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Length': response.headers.get('Content-Length') || '',
        },
      })
    } catch (err: unknown) {
      // TODO: catch not found errors from cloudinary

      if (
        typeof err === 'object' &&
        'error' in err &&
        typeof err.error === 'object' &&
        'http_code' in err.error &&
        err.error.http_code === 404
      ) {
        console.log('File not found', err.error.message)
        return new Response(null, { status: 404, statusText: 'Not Found' })
      }

      req.payload.logger.error({ err, msg: 'Unexpected error in staticHandler' })
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}
