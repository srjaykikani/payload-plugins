/**
 * Type definition for media documents returned by Payload.
 * Represents the structure of upload collection documents.
 */
export interface MediaDocument {
  id: string | number
  url?: string
  filename?: string
  context?: string
  alt?: string
  keywords?: string | string[]
  sizes?: {
    sm?: {
      url?: string
      width?: number
      height?: number
      mimeType?: string
      filesize?: number
      filename?: string
    }
    md?: {
      url?: string
      width?: number
      height?: number
      mimeType?: string
      filesize?: number
      filename?: string
    }
    lg?: {
      url?: string
      width?: number
      height?: number
      mimeType?: string
      filesize?: number
      filename?: string
    }
    [key: string]:
      | {
          url?: string
          width?: number
          height?: number
          mimeType?: string
          filesize?: number
          filename?: string
        }
      | undefined
  }
  mimeType?: string
  filesize?: number
  width?: number
  height?: number
  createdAt?: string
  updatedAt?: string
}
