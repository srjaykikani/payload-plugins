import { CollectionSlug, PayloadRequest, SanitizedCollectionConfig } from 'payload'
import { stringify } from 'qs-esm'
import { asPageCollectionConfigOrThrow } from '../collections/PageCollectionConfig'
import { Breadcrumb } from '../types/Breadcrumb'
import { Locale } from '../types/Locale'
import { pathFromBreadcrumbs } from './pathFromBreadcrumbs'

/** Returns the breadcrumbs to the given document. */
export async function getBreadcrumbs({
  req,
  collection,
  parentField,
  parentCollection,
  data,
  locale,
}: {
  req: PayloadRequest | undefined // undefined when called from the client (e.g. when using the PathField)
  collection: SanitizedCollectionConfig
  parentField: string
  parentCollection: CollectionSlug
  data: any
  locale: Locale | 'all'
}): Promise<Breadcrumb[] | Record<Locale, Breadcrumb[]>> {
  const { breadcrumbLabelField } = asPageCollectionConfigOrThrow(collection).page
  const locales = ((req?.payload.config.localization! as any)?.localeCodes as Locale[]) ?? []

  const getCurrentDocBreadcrumb = (locale: Locale, parentBreadcrumbs: Breadcrumb[]) =>
    docToBreadcrumb(
      {
        ...data,
        path: pathFromBreadcrumbs({
          locale,
          breadcrumbs: parentBreadcrumbs,
          additionalSlug: typeof data.slug === 'string' ? data.slug : data.slug[locale],
        }),
      },
      locale,
      breadcrumbLabelField,
    )

  // If the document has no parent, only return the breadcrumb for the current locale and return
  if (!data[parentField]) {
    if (locale === 'all') {
      return Object.fromEntries(
        locales.map((locale) => [locale, [getCurrentDocBreadcrumb(locale, [])]]),
      )
    }

    return [getCurrentDocBreadcrumb(locale, [])]
  }

  // If the parent is set, fetch its breadcrumbs, add the breadcrumb of the current doc and return
  const parentId = typeof data[parentField] === 'string' ? data[parentField] : data[parentField].id

  const parent = req
    ? await req.payload.findByID({
        id: parentId,
        collection: parentCollection,
        depth: 0,
        locale: locale,
        disableErrors: true,
        select: {
          breadcrumbs: true,
        },
        // IMPORTANT: do not pass the req here, otherwise there will be issues with the locale flattening
      })
    : await fetchPayloadRestApi(`/${parentCollection}/${parentId}`, {
        depth: 0,
        locale: locale,
        select: {
          breadcrumbs: true,
        },
      })

  if (!parent) {
    // This can be the case, when the parent document got deleted.
    throw new Error(
      'Parent document of document ' +
        data.id +
        ' in collection ' +
        collection.slug +
        ' not found.',
    )
  }

  if (locale === 'all') {
    const breadcrumbs: Record<Locale, Breadcrumb[]> = locales.reduce(
      (acc, locale) => {
        const parentBreadcrumbs = (parent?.breadcrumbs as any)[locale] ?? []

        acc[locale] = [...parentBreadcrumbs, getCurrentDocBreadcrumb(locale, parentBreadcrumbs)]
        return acc
      },
      {} as Record<Locale, Breadcrumb[]>,
    )

    return breadcrumbs
  } else {
    const parentBreadcrumbs = (parent?.breadcrumbs as any) ?? []

    return [...parentBreadcrumbs, getCurrentDocBreadcrumb(locale, parentBreadcrumbs)]
  }
}

/** Converts a localized or unlocalized document to a breadcrumb. */
function docToBreadcrumb(
  doc: any,
  locale: Locale | 'all',
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

/** Fetches a document via the Payload REST API. This should only be used if the local API is not available. */
async function fetchPayloadRestApi(path: string, options: Record<string, any>) {
  const response = await fetch('/api' + path + '?' + stringify(options), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch the requested document via the Payload REST API. ${response.statusText}`,
    )
  }

  return await response.json()
}
