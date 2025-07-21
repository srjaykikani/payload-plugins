export interface SearchResult {
  collectionName?: string
  collectionSlug?: string
  createdAt?: string
  doc?: {
    relationTo: string
    value:
      | {
          [key: string]: unknown
          id: string
        }
      | string
  }
  id: string
  priority?: number
  title: string
  updatedAt?: string
  url?: string
}
