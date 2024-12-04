import { createPageCollectionConfig } from '@jhb.software/payload-pages-plugin'
import { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = createPageCollectionConfig({
  slug: 'authors',
  page: {
    parentCollection: 'pages',
    parentField: 'parent',
    sharedParentDocument: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      localized: true,
    },
  ],
})
