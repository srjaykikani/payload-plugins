import { createPageCollectionConfig } from '@jhb.software/payload-pages-plugin'
import { CollectionConfig } from 'payload'

export const Countries: CollectionConfig = createPageCollectionConfig({
  slug: 'countries',
  admin: {
    useAsTitle: 'title',
  },
  page: {
    parentCollection: 'pages',
    parentField: 'parent',
    sharedParentDocument: true,
  },
  versions: {
    drafts: true,
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
