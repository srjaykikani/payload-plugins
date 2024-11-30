import { Field } from 'payload'

/**
 * Creates a virtual path field that generates the path based on the parents' slugs, the document's slug and the locale.
 *
 * It is not stored in the database, because this would not automatically reflect changes in the parent(s) slug(s).
 */
export function pathField(): Field {
  return {
    name: 'path',
    type: 'text',
    required: true,
    virtual: true,
    localized: true,
    admin: {
      readOnly: true,
      position: 'sidebar',
      components: {
        Field: '@jhb.software/payload-pages-plugin/client#PathField',
      },
    },
    hooks: {
      afterRead: [
        // The path is generated in the getVirtualFields collection hook
      ],
    },
  }
}
