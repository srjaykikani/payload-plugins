import type { FieldHook } from 'payload'
import { ROOT_PAGE_SLUG } from '../utils/setRootPageVirtualFields.js'

const germanCharacterReplacements: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
}

export const formatSlug = (val: string): string =>
  val
    .toString() // Cast to string (optional)
    .toLowerCase() // Convert the string to lowercase letters
    .replace(/[äöüß]/g, (match) => germanCharacterReplacements[match])
    .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .trim() // Remove whitespace from both sides of a string
    .replace(/\s+/g, '-') // Replace spaces with hyphen
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^\-+|\-+$/g, '') // Trim hyphens from start and end

/**
 * Same as formatSlug, except that it does not remove hyphens from the end of the string. Also converts spaces at the end of the string to hyphens.
 *
 * This is used to format a slug while typing.
 */
export const liveFormatSlug = (val: string): string =>
  val
    .toString() // Cast to string (optional)
    .toLowerCase() // Convert the string to lowercase letters
    .replace(/[äöüß]/g, (match) => germanCharacterReplacements[match])
    .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .replace(/\s+/g, '-') // Replace spaces with hyphen
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    // place trim at the end to replace inner whitespaces with hyphens:
    .trim() // Remove whitespace from both sides of a string

/** Function which returns a hook which ensures that the slug is correctly set in cases where it would not be set otherwise. */
export const createSlugFromFallbackField = (fallbackField: string): FieldHook => {
  return ({ operation, value, originalDoc, data }) => {
    const isRootPage = Boolean(data?.isRootPage ?? originalDoc?.isRootPage)

    // Falling back to the data.slug and originalDoc.slug is essential, because for update operations where the slug is not affected, the value is undefined.
    const slug = value ?? data?.slug ?? originalDoc?.slug

    if (isRootPage) {
      // This ensures that the slug of the root page is always an empty string.
      // (Especially necessary to ensure that the secondly added localized version of a document has a slug set.)
      if (slug !== ROOT_PAGE_SLUG) {
        return ROOT_PAGE_SLUG
      }
    } else if (!slug && (operation === 'create' || operation === 'update')) {
      // When the doc is not the root page and the slug is not set, use the fallback field to set the slug.
      const fallbackFieldValue = data?.[fallbackField] || originalDoc?.[fallbackField]

      if (fallbackFieldValue && typeof fallbackFieldValue === 'string') {
        return formatSlug(fallbackFieldValue)
      }
    }

    return value
  }
}
