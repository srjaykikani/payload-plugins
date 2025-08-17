import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Simple pages collection configuration for testing parent-child relationships
 */
const Pages = {
  slug: 'pages',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      required: false,
    },
  ],
}

export default buildConfig({
  collections: [
    Pages,
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
  ],
  db: sqliteAdapter({
    client: {
      url: 'file:./test.db',
    },
  }),
  secret: 'test-secret-key-for-sql-testing',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [],
  async onInit(payload) {
    // Create a test user
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'test@example.com',
          password: 'test123',
        },
      })
    }
  },
})