import type { TextareaField } from 'payload'

import type { AltTextFieldConfig } from '../types/AltTextFieldConfig'

export function aiAltTextField(config?: AltTextFieldConfig): TextareaField {
  return {
    name: config?.altFieldName ?? 'alt',
    label: config?.label ?? 'Alternate text',
    type: 'textarea',
    required: config?.required ?? true,
    localized: config?.localized,
    validate: (value, ctx) => {
      // Alt text is required only for existing documents (documents with id)
      // Not required when creating since generation requires uploaded image
      if (ctx.id && (!value || value.trim().length === 0)) {
        return 'The alternate text is required'
      }
      return true
    },
    admin: {
      components: {
        Field: '@jhb.software/payload-ai-alt-text-plugin/client#AltTextField',
      },
    },
  }
}
