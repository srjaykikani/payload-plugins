import { CollectionConfig } from 'payload'
import {
  IncomingPageCollectionConfigAttributes,
  PageCollectionConfigAttributes,
} from './PageCollectionConfigAttributes.js'

/** The plugins incoming config for page collections. */
export type IncomingPageCollectionConfig = CollectionConfig & {
  page: IncomingPageCollectionConfigAttributes
}

/** A collection config with additional attributes for page collections after they have been processed. */
export type PageCollectionConfig = CollectionConfig & {
  page: PageCollectionConfigAttributes
}
