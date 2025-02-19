import { CollectionSlug } from 'payload'

/** Configuration options for the cloudinary plugin. */
export type CloudinaryPluginConfig = {
  /** Whether the cloudinary plugin is enabled. */
  enabled?: boolean

  /**
   * Upload collections which should be integrated with cloudinary.
   */
  uploadCollections?: ({} | CollectionSlug)[]

  uploadOptions?: {
    /** Whether cloudinary will use the file name of the uploaded image for the public ID. Defaults to false. */
    useFilename?: boolean

    /**
     * The size of the chunks to upload the file in.
     * See https://cloudinary.com/documentation/upload_images#chunked_asset_upload
     */
    chunkSize?: number
  }

  /**
   * API credentials for the cloudinary account.
   */
  credentials: {
    apiKey: string
    apiSecret: string
  }

  /**
   * General cloudinary configuration.
   */
  cloudinary: {
    cloudName: string
    folder?: string
  }
}
