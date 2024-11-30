import type { FieldHook } from 'payload'

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

/** Function which returns a hook which sets the slug based on a fallback field if it is empty or the provided slug has an invalid format. */
export const validateSlug = (fallbackField: string): FieldHook => {
  return ({ operation, value, originalDoc, data }) => {
    if (operation === 'update' && !value) {
      // The value could be undefined even though the document has a slug set, when
      // other fields of the document are updated via the local API.
      // To prevent unintended slug changes in this case, get the slug from the original document.
      value = originalDoc.slug
    }

    // field has value, use formatted value
    if (typeof value === 'string' && value !== '') {
      return formatSlug(value)
    }

    // field has no value, use formatted fallback
    if (operation === 'create' || operation === 'update') {
      const fallbackFieldValue = data?.[fallbackField] || originalDoc?.[fallbackField]

      if (fallbackFieldValue && typeof fallbackFieldValue === 'string') {
        return formatSlug(fallbackFieldValue)
      }
    }

    return value
  }
}
