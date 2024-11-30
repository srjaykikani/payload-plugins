/** The SEO Metadata fields that are created by the plugin. */
export interface SeoMetadata {
  [key: string]: any
  alternatePaths: {
    hreflang: string
    path: string
    id?: string | null
  }[]
}
