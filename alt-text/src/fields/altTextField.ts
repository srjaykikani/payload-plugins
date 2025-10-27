import type { TextareaField } from 'payload'
import { translatedLabel } from '../utils/translatedLabel.js'

export function altTextField({
  localized,
}: {
  localized?: TextareaField['localized']
}): TextareaField {
  return {
    name: 'alt',
    label: translatedLabel('alternateText'),
    type: 'textarea',
    required: true,
    localized: localized,
    validate: (value, ctx) => {
      // if the document has an id, the alt text is required
      if (ctx.id) {
        if (!value || value.trim().length === 0) {
          // Note: Validation messages don't support StaticLabel format
          // Keeping in English for v1 - can be enhanced in the future
          return 'The alternate text is required.'
        }
      }

      // The alt text is not required when the document is created because the alt text generation
      // can only be used once the document is created and the image uploaded
      return true
    },
    admin: {
      components: {
        Field: '@jhb.software/payload-alt-text-plugin/client#AltTextField',
      },
    },
  }
}
