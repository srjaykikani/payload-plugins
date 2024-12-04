import { CollectionSlug } from 'payload'

/** Custom attributes for a page collection config which are primarily used in collection and field hooks. */
export type PageCollectionConfigAttributes = {
  /** Collection in which the parent document is stored. */
  parentCollection: CollectionSlug

  /** Name of the field to store the parent document. */
  parentField: string

  /** Whether this collection contains the root page and therefore the parent field is optional. Defaults to `false`. */
  isRootCollection?: boolean

  /** Whether all documents share the same parent document. Defaults to `false`. */
  sharedParentDocument?: boolean

  /**
   * Name of the field to use to generate the breadcrumb label.
   * Most of the time this will be the field which is set as the 'useAsTitle' field.
   *
   * Defaults to `admin.useAsTitle`.
   **/
  breadcrumbLabelField?: string

  /**
   * Name of the field to use as fallback for the slug field.
   *
   * Defaults to `title`.
   */
  slugFallbackField?: string
}
