import { Field } from 'payload'

export function previewButtonField(): Field {
  return {
    name: 'previewButton',
    type: 'ui',
    admin: {
      components: {
        Field: '@jhb.software/payload-pages-plugin/client#PreviewButtonField',
      },
      position: 'sidebar',
    },
  }
}
