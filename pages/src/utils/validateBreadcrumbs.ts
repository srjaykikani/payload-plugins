import { Breadcrumb } from '../types/Breadcrumb'
import { Locale } from '../types/Locale'
import { pathFromBreadcrumbs } from './pathFromBreadcrumbs'

/**
 * Validates the breadcrumbs and throws an error if invalid.
 */
export function validateBreadcrumbs(locale: Locale, breadcrumbs: Breadcrumb[]) {
  if (!breadcrumbs) {
    throw new Error('No breadcrumbs found for locale ' + locale)
  }

  if (breadcrumbs.length === 0) {
    throw new Error('Empty breadcrumbs found for locale ' + locale)
  }

  if (
    pathFromBreadcrumbs({ locale: locale, breadcrumbs: breadcrumbs }) !== breadcrumbs.at(-1)?.path
  ) {
    throw new Error(
      'Path generated from breadcrumbs is not equal to the path of the last breadcrumb: ' +
        pathFromBreadcrumbs({ locale: locale, breadcrumbs: breadcrumbs }) +
        ' !== ' +
        breadcrumbs.at(-1)?.path,
    )
  }
}
