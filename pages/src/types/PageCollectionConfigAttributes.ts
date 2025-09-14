import { CollectionSlug } from 'payload'
import { Locale } from './Locale.js'

/** The incoming attributes for the page collection config. */
export type IncomingPageCollectionConfigAttributes = {
  /** Whether this collection contains the root page and therefore the parent field is optional. Defaults to `false`. */
  isRootCollection?: boolean

  breadcrumbs?: {
    /**
     * Name of the field to use to generate the breadcrumb label.
     * Most of the time this will be the field which is set as the 'useAsTitle' field.
     *
     * Defaults to `admin.useAsTitle`.
     **/
    labelField?: string
  }

  parent: {
    /** Collection in which the parent document is stored. */
    collection: CollectionSlug

    /** Name of the field which stores the parent document. */
    name: string

    /** Whether all documents share the same parent document. Defaults to `false`. */
    sharedDocument?: boolean
  }

  slug?: {
    /** Whether the slug must be unique. Defaults to `true`. */
    unique?: boolean

    /** Name of the field to use as fallback for the slug field. Defaults to the `useAsTitle` field. */
    fallbackField?: string

    /** Defines a static slug value for all documents in the collection. This will make the slug field readonly. */
    staticValue?: string | Record<Locale, string>
  }

  path?: {
    /** Optional global prefix prepended to every computed path for this collection. Example: "/members" */
    pathPrefix?: string
  }
}

/** The attributes for the page collection config after they have been processed using the incoming config attributes. */
export type PageCollectionConfigAttributes = {
  /** Whether this collection contains the root page and therefore the parent field is optional. */
  isRootCollection: boolean

  breadcrumbs: {
    /** Name of the field to use to generate the breadcrumb label. */
    labelField: string
  }

  parent: {
    /** Collection in which the parent document is stored. */
    collection: CollectionSlug

    /** Name of the field which stores the parent document. */
    name: string

    /** Whether all documents share the same parent document. */
    sharedDocument: boolean
  }

  slug: {
    /** Whether the slug must be unique.  */
    unique: boolean

    /** Name of the field to use as fallback for the slug field. */
    fallbackField: string

    /** The static slug value for all documents in the collection. */
    staticValue?: string | Record<Locale, string>
  }

  path?: {
    /** Optional global prefix prepended to every computed path for this collection. */
    pathPrefix?: string
  }
}
