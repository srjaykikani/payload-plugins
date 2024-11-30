import { Field } from 'payload'

/** Virtual field which holds the paths for the alternate languages. */
export function alternatePathsField(): Field {
  return {
    name: 'alternatePaths',
    type: 'array',
    required: true,
    localized: false,
    virtual: true,
    admin: {
      readOnly: true,
      hidden: true,
    },
    hooks: {
      afterRead: [
        // The alternate paths are generated in the setVirtualFields collection hook
      ],
    },
    fields: [
      {
        name: 'hreflang',
        type: 'text',
        required: true,
      },
      {
        name: 'path',
        type: 'text',
        required: true,
      },
    ],
  }
}
