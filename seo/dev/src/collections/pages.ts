import { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'contentPlaintext',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'contentLexical',
      type: 'textarea',
      required: true,
      localized: true,
    },
  ],
}
