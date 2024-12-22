import { CollectionSlug } from 'payload'

/** The incoming attributes for the page collection config. */
export type IncomingPageCollectionConfigAttributes = {
  /** Collection in which the parent document is stored. */
  parentCollection: CollectionSlug

  /** Name of the relationship field which stores the parent document. */
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

/** The attributes for the page collection config after they have been processed using the incoming config attributes. */
export type PageCollectionConfigAttributes = {
  /** Collection in which the parent document is stored. */
  parentCollection: CollectionSlug

  /** Name of the relationship field which stores the parent document. */
  parentField: string

  /** Whether this collection contains the root page and therefore the parent field is optional. */
  isRootCollection: boolean

  /** Whether all documents share the same parent document. */
  sharedParentDocument: boolean

  /**
   * Name of the field to use to generate the breadcrumb label.
   **/
  breadcrumbLabelField: string

  /**
   * Name of the field to use as fallback for the slug field.
   */
  slugFallbackField: string
}
