import type { TextareaField } from 'payload'

/** Configuration for the AI alt text field. */
export type AltTextFieldConfig = {
  altFieldName?: string
  keywordsFieldName?: string
  contextFieldName?: string
  label?: TextareaField['label']
  required?: boolean
  localized?: boolean
}
