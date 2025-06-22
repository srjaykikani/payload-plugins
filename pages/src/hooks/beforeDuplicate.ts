import { FieldHook } from 'payload'

/** Hooks which adjusts the slug to make sure the slug is still unique after duplication. */
export const beforeDuplicateSlug: FieldHook = ({ value }) => {
  return value && typeof value === 'string' ? value + '-copy' : value
}

/** Hooks which adjusts the title to indicate this is a copy. */
export const beforeDuplicateTitle: FieldHook = ({ value }) => {
  return value && typeof value === 'string' ? value + ' (copy)' : value
}
