import { CollectionSlug, PayloadRequest } from 'payload'
import { Breadcrumb } from '../types/Breadcrumb.js'
import { Locale } from '../types/Locale.js'
import { fetchRestApi } from './fetchRestApi.js'
import { pathFromBreadcrumbs } from './pathFromBreadcrumbs.js'
import { ROOT_PAGE_SLUG } from './setRootPageVirtualFields.js'

/** Returns the breadcrumbs to the given document. */
export async function getBreadcrumbs({
  req,
  locales,
  breadcrumbLabelField,
  parentField,
  parentCollection,
  data,
  locale,
}: {
  req: PayloadRequest | undefined // undefined when called from the client (e.g. when using the PathField)
  locales: Locale[]
  breadcrumbLabelField: string
  parentField: string
  parentCollection: CollectionSlug
  data: any
  locale: Locale | 'all'
}): Promise<Breadcrumb[] | Record<Locale, Breadcrumb[]>> {
  const getCurrentDocBreadcrumb = (locale: Locale, parentBreadcrumbs: Breadcrumb[]) =>
    docToBreadcrumb(
      {
        ...data,
        path: pathFromBreadcrumbs({
          locale,
          breadcrumbs: parentBreadcrumbs,
          additionalSlug: data.isRootPage
            ? ROOT_PAGE_SLUG
            : typeof data.slug === 'string'
              ? data.slug
              : typeof data.slug === 'object'
                ? data.slug[locale]
                : undefined,
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
    : await fetchRestApi(`/${parentCollection}/${parentId}`, {
        depth: 0,
        locale: locale,
        select: {
          breadcrumbs: true,
        },
      })

  if (!parent) {
    // This can be the case, when the parent document got deleted.
    throw new Error('Parent document of document ' + data.id + ' not found.')
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
    slug: doc.isRootPage
      ? ROOT_PAGE_SLUG
      : typeof doc.slug === 'string'
        ? doc.slug
        : typeof doc.slug === 'object'
          ? doc.slug[locale]
          : undefined,
    path: typeof doc.path === 'string' ? doc.path : doc.path?.[locale],
    label: breadcrumbLabelField
      ? // the label field might not be localized (e.g. it's a persons name), therefore we need to check both localized and unlocalized
        (doc[breadcrumbLabelField]?.[locale] ?? doc[breadcrumbLabelField])
      : (doc.breadcrumbs?.[locale]?.at(-1)?.label ?? doc.breadcrumbs?.at(-1)?.label),
  }
}
