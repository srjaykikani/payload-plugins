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
    validate: (value, { id, req: { t } }) => {
      // if the document has an id, which means a media file was uploaded, the alt text is required
      if (id) {
        if (!value || value.trim().length === 0) {
          // @ts-expect-error - the translation key type does not include the custom key
          return t('@jhb.software/payload-alt-text-plugin:theAlternateTextIsRequired')
        }
      }

      // The alt text is not required when the media file was not uploaded yet
      // (since the alt text generation needs an URL to fetch the file)
      return true
    },
    admin: {
      components: {
        Field: '@jhb.software/payload-alt-text-plugin/client#AltTextField',
      },
    },
  }
}
