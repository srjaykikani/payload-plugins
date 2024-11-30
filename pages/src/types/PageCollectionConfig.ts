import { CollectionConfig } from 'payload'
import { PageCollectionConfigAttributes } from './PageCollectionConfigAttributes'

/** A collection config with additional attributes for page collections. */
export type PageCollectionConfig = CollectionConfig & {
  page: PageCollectionConfigAttributes
}
