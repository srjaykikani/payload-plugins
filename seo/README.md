# JHB Software - Payload SEO Plugin

[![NPM Version](https://img.shields.io/npm/v/%40jhb.software%2Fpayload-seo-plugin)](https://www.npmjs.com/package/@jhb.software/payload-seo-plugin)

Extends the official [SEO plugin](https://payloadcms.com/docs/plugins/seo) with additional features:

- AI-powered meta description generation for compelling search results
- Focus keyword tracking with intelligent warnings when keywords are missing from crucial elements (title, description, content)
- Multi-keyword support with content usage analytics

## Setup

The following environment variables are required:

- `OPENAI_API_KEY`

## Usage

Initialize the `AiMetaDescriptionGenerator` with the `websiteContext` and `collectionContentTransformer`.

```ts
const aiMetaDescriptionGenerator = new AiMetaDescriptionGenerator({
  websiteContext: {
    topic: 'Software Developer for mobile, web-apps and websites',
  },
  collectionContentTransformer: {
    pages: async (doc) => ({
      title: doc.title,
      content: (await lexicalToPlainText(doc.body, {} as SanitizedConfig)) ?? '',
    }),
    projects: async (doc) => ({
      title: doc.title,
      excerpt: doc.excerpt,
      tags: doc.tags?.join(', '),
      body: (await lexicalToPlainText(doc.body, {} as SanitizedConfig)) ?? '',
    }),
  },
})
```

Then pass the `generateDescription` function to the `generateDescription` field in the `seo` plugin config inside your payload config. Also add the `keywordsField` to the fields array.

```ts
export default buildConfig({
  // ...
  plugins: [
    seoPlugin({
      generateDescription: aiMetaDescriptionGenerator.generateDescription,
      fields: ({ defaultFields }) => [...defaultFields, keywordsField()],
    }),
  ],
})
```
