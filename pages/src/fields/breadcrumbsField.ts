import { Field } from 'payload'
import { translatedLabel } from '../utils/translatedLabel.js'

/**
 * Creates a virtual breadcrumbs field that generates the breadcrumbs based on the documents parents.
 *
 * It is not stored in the database, because this would not automatically reflect changes in the parent(s) slug(s).
 */
export function breadcrumbsField(): Field {
  return {
    name: 'breadcrumbs',
    interfaceName: 'Breadcrumbs',
    label: translatedLabel('breadcrumbs'),
    labels: {
      singular: translatedLabel('breadcrumb'),
      plural: translatedLabel('breadcrumbs'),
    },
    type: 'array',
    required: true,
    localized: true,
    virtual: true,
    // Validate by default to allow the document to be updated, without having to set the breadcrumbs field.
    validate: (_: any): true => true,
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'slug',
            label: translatedLabel('slug'),
            required: true,
            type: 'text',
            // Validate by default to allow the document to be updated, without having to set the breadcrumbs field.
            validate: (_: any): true => true,
            admin: {
              width: '33%',
            },
          },
          {
            name: 'path',
            label: translatedLabel('path'),
            required: true,
            type: 'text',
            // Validate by default to allow the document to be updated, without having to set the breadcrumbs field.
            validate: (_: any): true => true,
            admin: {
              width: '33%',
            },
          },
          {
            name: 'label',
            label: translatedLabel('label'),
            required: true,
            type: 'text',
            // Validate by default to allow the document to be updated, without having to set the breadcrumbs field.
            validate: (_: any): true => true,
            admin: {
              width: '33%',
            },
          },
        ],
      },
    ],
    admin: {
      readOnly: true,
      disableBulkEdit: true,
      position: 'sidebar',
      components: {
        Field: '@jhb.software/payload-pages-plugin/client#BreadcrumbsField',
      },
    },
    hooks: {
      afterRead: [
        // The breadcrumbs are generated in the getVirtualFields collection hook
      ],
    },
  }
}
