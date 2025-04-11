import type { GenerateURL } from '@payloadcms/plugin-cloud-storage/types'

export const getGenerateUrl = (): GenerateURL => {
  return ({ doc }) => {
    return doc.cloudinarySecureUrl
  }
}
