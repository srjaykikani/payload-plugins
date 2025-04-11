import type { GetAdminThumbnail } from '@payloadcms/plugin-cloud-storage/types'

export const getAdminThumbnail: GetAdminThumbnail = ({ doc }) => {
  const transformOptions = 'w_300,h_300,c_fill,f_auto,q_auto,dpr_auto'

  const newUrl = (doc.cloudinarySecureUrl as string).replace(
    '/upload',
    `/upload/${transformOptions}`,
  )

  // As payload does not support videos as thumbnails, create an image thumbnail of the video:
  if (doc.mimeType.startsWith('video/')) {
    const videoThumbnailExtension = '.webp'
    const videoExtension = doc.cloudinarySecureUrl.split('/').pop()?.split('.').pop()
    const videoThumbnailUrl = newUrl.replace(`.${videoExtension}`, videoThumbnailExtension)

    return videoThumbnailUrl
  }

  return newUrl
}
