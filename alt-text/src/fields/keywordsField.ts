import type { TextField } from 'payload'
import { translatedLabel } from '../utils/translatedLabel.js'

export function keywordsField({ localized }: { localized?: TextField['localized'] }): TextField {
  return {
    name: 'keywords',
    label: translatedLabel('keywords'),
    type: 'text',
    hasMany: true,
    required: false,
    localized: localized,
    hidden: true, // this field is only meant to be used for improving the search
    admin: {
      description: ({ t }) =>
        (t as any)('@jhb.software/payload-alt-text-plugin:keywordsDescription'),
      readOnly: true,
    },
  }
}
