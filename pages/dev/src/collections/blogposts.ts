import { createPageCollectionConfig } from '@jhb.software/payload-pages-plugin'
import { CollectionConfig } from 'payload'

export const Blogposts: CollectionConfig = createPageCollectionConfig({
  slug: 'blogposts',
  admin: {
    useAsTitle: 'title',
  },
  page: {
    parentCollection: 'authors',
    parentField: 'author',
    sharedParentDocument: false,
    breadcrumbLabelField: 'shortTitle',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'shortTitle',
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
