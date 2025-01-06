import { PayloadRequest } from 'payload'
import { Breadcrumb } from '../types/Breadcrumb.js'
import { Locale } from '../types/Locale.js'
import { PageCollectionConfigAttributes } from '../types/PageCollectionConfigAttributes.js'
import { SeoMetadata } from '../types/SeoMetadata.js'
import { getBreadcrumbs } from './getBreadcrumbs.js'
import { validateBreadcrumbs } from './validateBreadcrumbs.js'
import { validatePath } from './validatePath.js'

/** Sets the virtual fields (breadcrumbs, path, alternatePaths) of the given root page document. */
export async function setPageDocumentVirtualFields({
  req,
  doc,
  locale,
  locales,
  pageConfigAttributes,
}: {
  req: PayloadRequest | undefined
  doc: any
  locale: Locale | 'all'
  locales: Locale[]
  pageConfigAttributes: PageCollectionConfigAttributes
}) {
  const breadcrumbs = (await getBreadcrumbs({
    req,
    locales: locales,
    breadcrumbLabelField: pageConfigAttributes.breadcrumbLabelField,
    parentField: pageConfigAttributes.parentField,
    parentCollection: pageConfigAttributes.parentCollection,
    data: doc,
    // we need to fetch the breadcrumbs for all locales in order to correctly set the alternate paths
    locale: 'all',
  })) as Record<Locale, Breadcrumb[]>

  const paths: Record<Locale, string> = locales.reduce(
    (acc, locale) => {
      // If the slug is not set for this locale, exclude the path to not generate a 404 path
      if (doc.slug[locale]) {
        acc[locale] = breadcrumbs[locale].at(-1)!.path
      }
      return acc
    },
    {} as Record<Locale, string>,
  )

  const alternatePaths: SeoMetadata['alternatePaths'] = Object.entries(paths).map(
    ([locale, path]) => ({
      hreflang: locale as Locale,
      path,
    }),
  )

  if (locale === 'all') {
    // TODO: remove these validations in favor of more unit tests?
    Object.entries(paths).forEach(([_, path]) => validatePath(path, doc.id, 'all'))
    Object.entries(paths).forEach(([locale, _]) =>
      validateBreadcrumbs(locale as Locale, breadcrumbs[locale as Locale]),
    )

    return {
      ...doc,
      path: paths,
      breadcrumbs,
      meta: {
        ...doc.meta,
        alternatePaths,
      },
    }
  } else {
    validatePath(paths[locale], doc.id, locale)
    validateBreadcrumbs(locale, breadcrumbs[locale])

    return {
      ...doc,
      path: paths[locale],
      breadcrumbs: breadcrumbs[locale],
      meta: {
        ...doc.meta,
        alternatePaths,
      },
    }
  }
}
