import {
  AiMetaDescriptionGenerator,
  keywordsField,
  lexicalToPlainText,
} from '@jhb.software/payload-seo-plugin'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, SanitizedConfig } from 'payload'
import { fileURLToPath } from 'url'
import { Pages } from './collections/pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const aiMetaDescriptionGenerator = new AiMetaDescriptionGenerator({
  websiteContext: {
    topic: 'Software Developer for mobile, web-apps and websites',
  },
  collectionContentTransformer: {
    pages: async (doc) => ({
      title: doc.title,
      // TODO: fix passing of config
      content: (await lexicalToPlainText(doc.body, {} as SanitizedConfig)) ?? '',
    }),
    projects: async (doc) => ({
      title: doc.title,
      excerpt: doc.excerpt,
      tags: doc.tags?.join(', '),
      // TODO: fix passing of config
      body: (await lexicalToPlainText(doc.body, {} as SanitizedConfig)) ?? '',
    }),
  },
})

export default buildConfig({
  admin: {
    autoLogin: {
      email: 'dev@payloadcms.com',
      password: 'test',
    },
    user: 'users',
  },
  collections: [
    Pages,
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI!,
  }),
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  async onInit(payload) {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'dev@payloadcms.com',
          password: 'test',
        },
      })
    }
  },
  plugins: [
    seoPlugin({
      collections: ['pages'],
      generateDescription: aiMetaDescriptionGenerator.generateDescription,
      fields: ({ defaultFields }) => [keywordsField(), ...defaultFields],
    }),
  ],
})
