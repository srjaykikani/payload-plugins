import { Breadcrumb } from '../types/Breadcrumb'
import { Locale } from '../types/Locale'

/** Converts the given breadcrumbs and the locale to a path */
export function pathFromBreadcrumbs({
  locale,
  breadcrumbs,
  additionalSlug,
}: {
  locale: Locale
  breadcrumbs: Breadcrumb[]
  additionalSlug?: string
}): string {
  return [
    `/${locale}`,
    ...[...breadcrumbs.map(({ slug }) => slug), additionalSlug].filter(Boolean),
  ].join('/')
}
