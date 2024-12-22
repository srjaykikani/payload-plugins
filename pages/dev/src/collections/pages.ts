import { createPageCollectionConfig } from '@jhb.software/payload-pages-plugin'
import { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = createPageCollectionConfig({
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  page: {
    parentCollection: 'pages',
    parentField: 'parent',
    isRootCollection: true,
  },
  versions: {
    drafts: {
      autosave: true,
    },
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
