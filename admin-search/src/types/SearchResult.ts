export interface SearchResult {
  collectionName?: string
  collectionSlug: string
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
  title: string
  url?: string
}
