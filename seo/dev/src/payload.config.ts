import { payloadSeoPlugin } from '@jhb.software/payload-seo-plugin'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { Pages } from './collections/pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
    payloadSeoPlugin({
      // ### Options of the official seo plugin ###
      collections: ['pages'],

      // ### Options of this seo plugin ###
      websiteContext: {
        topic: 'A website of a software developer for mobile, web-apps and websites.',
      },
      documentContentTransformers: {
        pages: async (doc, lexicalToPlainText) => ({
          title: doc.title,
          contentLexical: (await lexicalToPlainText(doc.contentLexical)) ?? '',
          contentPlaintext: doc.contentPlaintext,
        }),
      },
    }),
  ],
})
