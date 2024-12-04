# JHB Software - Payload Pages Plugin

[![NPM Version](https://img.shields.io/npm/v/%40jhb.software%2Fpayload-pages-plugin)](https://www.npmjs.com/package/@jhb.software/payload-pages-plugin)

The Payload Pages plugin simplifies website building by adding essential fields to your collections. These fields enable hierarchical page structures and dynamic URL management.

## Setup

The following environment variables are required:

- `NEXT_PUBLIC_FRONTEND_URL`

## Usage

Use the `createPagesCollectionConfig` function to create a collection config for the Pages collection. This adds all necessary fields and hooks to the collection. The `page` must be specified:

- `parentCollection`: The slug of the collection that will be used as the parent of the current collection.
- `parentField`: The name of the field on the parent collection that will be used to relate to the current collection.
- `isRootCollection`: Whether the collection is the root collection (collection which contains the root page). If true, the parent field is optional. Defaults to `false`.
- `sharedParentDocument` (optional, defaults to `false`): If true, the parent document will be shared between all documents in the collection.
- `breadcrumbLabelField` (optional, defaults to `admin.useAsTitle`): The name of the field that will be used to label the document in the breadcrumb.
- `slugFallbackField` (optional, defaults to `title`): The name of the field that will be used as the fallback for the slug.

```ts
import { createPagesCollectionConfig } from '@jhb.software/payload-pages-plugin'

const Projects: CollectionConfig = createPageCollectionConfig({
  slug: 'projects',
  page: {
    parentCollection: 'pages',
    parentField: 'parent',
  },
  // configure the rest as normal
})
```

Additionally create the redirect collection:

```ts
import { createRedirectsCollectionConfig } from '@jhb.software/payload-pages-plugin'

const redirectsCollection = createRedirectsCollectionConfig({})
```

In order for the seo plugin to use the generated URL, you need to pass the `generateUrl` function to the `generateUrl` field in the `seo` plugin config inside your payload config. Also add the `alternatePathsField` field to the fields array.

```ts
export default buildConfig({
  // ...
  plugins: [
    seoPlugin({
      generateURL: ({ doc }) => getPageUrl({ path: doc.path })!,
      fields: ({ defaultFields }) => [...defaultFields, alternatePathsField()],
    }),
  ],
})
```
