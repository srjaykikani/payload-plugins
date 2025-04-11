import type { StaticHandler } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'
import type { ClientUploadContext } from './client/CloudinaryClientUploadHandler'

// This is called:
// - after the client upload is finished with the clientUploadContext
// - whenever the file is requested from the api/[collection]/[filename] path
export const getStaticHandler = (): StaticHandler => {
  return async (req, { doc, params }) => {
    try {
      type Params = {
        filename: string
        collection: string
        clientUploadContext?: ClientUploadContext
      }
      const { filename, collection, clientUploadContext } = params as Params

      let publicId: string
      let secureUrl: string

      if (
        clientUploadContext &&
        'publicId' in clientUploadContext &&
        clientUploadContext.publicId &&
        'secureUrl' in clientUploadContext &&
        clientUploadContext.secureUrl
      ) {
        publicId = clientUploadContext.publicId
        secureUrl = clientUploadContext.secureUrl
      } else {
        if (doc && 'cloudinaryPublicId' in doc && 'cloudinarySecureUrl' in doc) {
          publicId = doc.cloudinaryPublicId
          secureUrl = doc.cloudinarySecureUrl
        } else {
          const result = await req.payload.find({
            collection,
            req,
            limit: 1,
            pagination: false,
            select: {
              cloudinaryPublicId: true,
              cloudinarySecureUrl: true,
            },
            where: {
              filename: { equals: filename },
            },
          })

          if (result.docs.length > 0) {
            publicId = result.docs[0].cloudinaryPublicId
            secureUrl = result.docs[0].cloudinarySecureUrl
          }
        }
      }

      if (!publicId || !secureUrl) {
        console.log('No publicId or secureUrl found, returning 404')
        return new Response(null, { status: 404, statusText: 'Not Found' })
      }

      console.log('publicId', publicId)

      const response = await fetch(secureUrl)
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
        console.log('Error fetching file from cloudinary, 404, message:', err.error.message)
        return new Response(null, { status: 404, statusText: 'Not Found' })
      }

      req.payload.logger.error({ err, msg: 'Unexpected error in staticHandler' })
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}
