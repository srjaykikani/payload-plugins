import { CollectionSlug, PayloadRequest, SanitizedCollectionConfig } from 'payload'
import { asPageCollectionConfigOrThrow } from '../collections/PageCollectionConfig'
import { Breadcrumb } from '../types/Breadcrumb'
import { Locale } from '../types/Locale'
import { getParents } from './getParents'
import { pathFromBreadcrumbs } from './pathFromBreadcrumbs'

/** Returns the breadcrumbs to the given document for a specific locale. */
export async function getBreadcrumbsForLocale({
  req,
  collection,
  parentField,
  parentCollection,
  data,
  locale,
}: {
  req: PayloadRequest | undefined
  collection: SanitizedCollectionConfig
  parentField: string
  parentCollection: CollectionSlug
  data: any
  locale: Locale
}): Promise<Breadcrumb[]> {
  const { breadcrumbLabelField } = asPageCollectionConfigOrThrow(collection).page

  const parents = await getParents(req, locale, parentField, parentCollection, data, [])
  const parentBreadcrumbs = parents.map((doc) => docToBreadcrumb(doc, locale))

  const doc = {
    ...data,
    slug: data.slug,
    path: pathFromBreadcrumbs({
      locale: locale,
      breadcrumbs: parentBreadcrumbs,
      additionalSlug: data.slug,
    }),
  }

  return [...parentBreadcrumbs, docToBreadcrumb(doc, locale, breadcrumbLabelField)]
}

/** Returns a list of breadcrumbs (containing all locales) to the given document. */
export async function getBreadcrumbsForAllLocales({
  req,
  collection,
  parentField,
  parentCollection,
  data,
}: {
  req: PayloadRequest | undefined
  collection: SanitizedCollectionConfig
  parentField: string
  parentCollection: CollectionSlug
  data: any
}): Promise<Record<Locale, Breadcrumb[]>> {
  const { breadcrumbLabelField } = asPageCollectionConfigOrThrow(collection).page

  const parents = await getParents(req, 'all', parentField, parentCollection, data, [])

  const locales = (req?.payload.config.localization! as any).localeCodes as Locale[]

  const breadcrumbs = locales.reduce(
    (acc, locale) => {
      const parentBreadcrumbs = parents.map((doc) => docToBreadcrumb(doc, locale))

      const doc = {
        ...data,
        path: pathFromBreadcrumbs({
          locale,
          breadcrumbs: parentBreadcrumbs,
          additionalSlug: data.slug[locale],
        }),
      }

      acc[locale] = [...parentBreadcrumbs, docToBreadcrumb(doc, locale, breadcrumbLabelField)]
      return acc
    },
    {} as Record<Locale, Breadcrumb[]>,
  )

  return breadcrumbs
}

/** Converts a localized or unlocalized document to a breadcrumb. */
function docToBreadcrumb(
  doc: any,
  locale: Locale,
  breadcrumbLabelField?: string | undefined,
): Breadcrumb {
  return {
    slug: typeof doc.slug === 'string' ? doc.slug : doc.slug?.[locale],
    path: typeof doc.path === 'string' ? doc.path : doc.path?.[locale],
    label: breadcrumbLabelField
      ? // the label field might not be localized (e.g. it's a persons name), therefore we need to check both localized and unlocalized
        (doc[breadcrumbLabelField]?.[locale] ?? doc[breadcrumbLabelField])
      : (doc.breadcrumbs?.[locale]?.at(-1)?.label ?? doc.breadcrumbs?.at(-1)?.label),
  }
}
