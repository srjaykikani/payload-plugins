import type { MediaDocument } from '../types/MediaDocument'

/** Extracts the thumbnail URL from a media document. */
export function getImageThumbnail(media: MediaDocument): string {
  let url = media.url

  // Prefer small size to reduce costs
  if (media.sizes?.sm?.url) {
    url = media.sizes.sm.url
  } else {
    console.warn('No thumbnail (sm size) found for media', media)
  }

  if (!url) {
    throw new Error(`No URL found for media: ${JSON.stringify(media)}`)
  }

  // Convert relative URLs to absolute
  if (url.startsWith('/api')) {
    url = `${process.env.NEXT_PUBLIC_CMS_URL}${url}`
  }

  // Validate URL protocol (allow http:// for local development)
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    throw new Error(`Invalid URL for media: ${url}`)
  }

  return url
}
