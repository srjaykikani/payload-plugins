import { PageCollectionConfig } from '@jhb.software/payload-pages-plugin'

export const Authors: PageCollectionConfig = {
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
    path: {
      pathPrefix: '/authors',
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
}
