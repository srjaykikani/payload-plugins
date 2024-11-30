import { CollectionAfterChangeHook, CollectionBeforeReadHook } from 'payload'
import { asPageCollectionConfigOrThrow } from '../collections/PageCollectionConfig'
import { Locale } from '../types/Locale'
import { SeoMetadata } from '../types/SeoMetadata'
import { getBreadcrumbsForAllLocales, getBreadcrumbsForLocale } from '../utils/getBreadcrumbs'
import { validateBreadcrumbs } from '../utils/validateBreadcrumbs'
import { validatePath } from '../utils/validatePath'

/**
 * A [CollectionBeforeReadHook] that sets the values for all virtual fields before a document is read.
 *
 * A "before read" hook is used, because it is fired before localized fields are flattened which is necessary for generating the alternate paths.
 */
export const setVirtualFieldsBeforeRead: CollectionBeforeReadHook = async ({
  doc,
  req,
  collection,
}) => {
  const locale = req.locale as Locale | 'all'

  // When the slug is not (yet) set, it is not possible to generate the path and breadcrumbs
  if (locale !== 'all' && !doc.slug?.[locale]) {
    return doc
  }

  if (typeof doc.slug !== 'object') {
    throw new Error(
      'The slug must be an object with all available locales. Is the slug field set to be localized?',
    )
  }

  const { parentCollection, parentField } = asPageCollectionConfigOrThrow(collection).page

  const breadcrumbs = await getBreadcrumbsForAllLocales({
    req,
    collection,
    parentField,
    parentCollection,
    data: doc,
  })

  const locales = (req?.payload.config.localization! as any).localeCodes as Locale[]

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
    const locale = req.locale as Locale

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

/**
 * A `CollectionAfterChangeHook` that sets the values for all virtual fields.
 *
 * This "after change" hook is needed to re-fill the virtual fields after a document is changed/saved in the admin panel.
 */
export const setVirtualFieldsAfterChange: CollectionAfterChangeHook = async ({
  doc,
  req,
  collection,
}) => {
  // This type of hook is only called for one locale.
  const locale = req.locale as Locale

  const { parentCollection, parentField } = asPageCollectionConfigOrThrow(collection).page

  const breadcrumbs = await getBreadcrumbsForLocale({
    req,
    collection,
    parentField,
    parentCollection,
    data: doc,
    locale,
  })

  const path = breadcrumbs.at(-1)!.path

  validatePath(path, doc.id, locale)
  validateBreadcrumbs(locale, breadcrumbs)

  return {
    ...doc,
    path: path,
    breadcrumbs: breadcrumbs,
    meta: {
      ...doc.meta,
      alternatePaths: [
        // Because this type of hook is only called for one locale, the alternatePaths field cannot be fully generated here.
        // But because this hook is only used for filling the virtual fields in the admin panel after a document is changed/saved, this is not a problem.
        // To not trigger a validation issue when publishing the document, partially set the alternatePaths field:
        {
          hreflang: locale,
          path: path,
        },
      ],
    },
  }
}
