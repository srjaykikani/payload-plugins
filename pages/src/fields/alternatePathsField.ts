import { Field } from 'payload'

/** Virtual field which holds the paths for the alternate languages. */
export function alternatePathsField(): Field {
  return {
    name: 'alternatePaths',
    type: 'array',
    required: true,
    localized: false,
    virtual: true,
    // Validate by default to allow the document to be updated, without having to set the alternatePaths field.
    validate: (_: any): true => true,
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
