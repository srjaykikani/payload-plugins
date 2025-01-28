import { createPageCollectionConfig } from '@jhb.software/payload-pages-plugin'
import { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = createPageCollectionConfig({
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
  },
  page: {
    parent: {
      collection: 'pages',
      name: 'parent',
      sharedDocument: true,
    },
    breadcrumbs: {
      labelField: 'name',
    },
  },
  fields: [
    {
      name: 'name',
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
