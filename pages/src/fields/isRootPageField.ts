import { Field } from 'payload'

export function isRootPageField(): Field {
  return {
    name: 'isRootPage',
    type: 'checkbox',
    admin: {
      position: 'sidebar',
      components: {
        Field: {
          path: '@jhb.software/payload-pages-plugin/server#IsRootPageField',
        },
      },
    },
  }
}
