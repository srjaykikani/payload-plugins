import { FieldHook } from 'payload'

/** Hooks which adjusts the slug to make sure the slug is still unique after duplication. */
export const beforeDuplicateSlug: FieldHook<any, any, any> = ({ value }) => {
  return value?.slug ? value.slug + '-' + 'copy' : undefined
}

/** Hooks which adjusts the title to indicate this is a copy. */
export const beforeDuplicateTitle: FieldHook<any, any, any> = ({ value }) => {
  return value?.title ? value.title + ' - ' + 'copy' : undefined
}
