import type { HandleUpload } from '@payloadcms/plugin-cloud-storage/types'

import { v2 as cloudinary, UploadApiOptions } from 'cloudinary'
import path from 'path'

import fs from 'fs'
import type stream from 'stream'

import type { CloudinaryStorageOptions } from './index.js'

type HandleUploadArgs = {
  baseUrl: string
  prefix?: string
  folderSrc: string
} & Omit<CloudinaryStorageOptions, 'collections'>

// TODO: why?
const multipartThreshold = 1024 * 1024 * 99 // 99MB

export const getHandleUpload = ({
  baseUrl,
  folderSrc,
  prefix = '',
}: HandleUploadArgs): HandleUpload => {
  return async ({ data, file }) => {
    console.log('Server side upload of file', data, file)
    const fileKey = path.posix.join(data.prefix || prefix, file.filename)

    const uploadOptions: UploadApiOptions = {
      folder: folderSrc,
      public_id: fileKey.replace(/\.[^/.]+$/, ''), // Remove file extension,
      resource_type: 'auto',
    }

    const fileBufferOrStream: Buffer | stream.Readable = file.tempFilePath
      ? fs.createReadStream(file.tempFilePath)
      : file.buffer

    if (file.buffer.length > 0 && file.buffer.length < multipartThreshold) {
      await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) {
              reject(new Error(`Upload error: ${error.message}`))
            }

            resolve(result)
          })
          .end(fileBufferOrStream)
      })

      return data
    }

    await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_chunked_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(new Error(`Chunked upload error: ${error.message}`))
          }

          resolve(result)
        })
        .end(fileBufferOrStream)
    })

    return data
  }
}
