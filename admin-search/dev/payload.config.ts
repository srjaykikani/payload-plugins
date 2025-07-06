import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { searchPlugin } from '@payloadcms/plugin-search'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { authorsSchema } from './collections/authors.js'
import { mediaSchema } from './collections/media.js'
import { pagesSchema } from './collections/pages.js'
import { postsSchema } from './collections/posts.js'
import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const buildConfigWithMemoryDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const memoryDB = await MongoMemoryReplSet.create({
      replSet: {
        count: 3,
        dbName: 'payloadmemory',
      },
    })

    process.env.DATABASE_URI = `${memoryDB.getUri()}&retryWrites=true`
  }

  return buildConfig({
    collections: [pagesSchema, postsSchema, authorsSchema, mediaSchema],
    db: mongooseAdapter({
      ensureIndexes: true,
      url: process.env.DATABASE_URI || '',
    }),
    editor: lexicalEditor(),
    email: testEmailAdapter,
    onInit: async (payload) => {
      await seed(payload)
    },
    plugins: [
      searchPlugin({
        beforeSync: ({ originalDoc, searchDoc }) => ({
          ...searchDoc,
          collectionSlug: searchDoc.doc?.relationTo || '',
          title: originalDoc?.title || searchDoc.title,
        }),
        collections: ['pages', 'posts', 'authors'],
        searchOverrides: {
          fields: ({ defaultFields }) => [
            ...defaultFields,
            {
              name: 'collectionSlug',
              type: 'text',
              admin: { readOnly: true },
            },
          ],
        },
      }) as any,
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildConfigWithMemoryDB()
