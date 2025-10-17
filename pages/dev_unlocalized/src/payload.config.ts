import { payloadPagesPlugin } from '@jhb.software/payload-pages-plugin'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { Authors } from './collections/authors'
import { Blogposts } from './collections/blogposts'
import { Countries } from './collections/countries'
import { CountryTravelTips } from './collections/country-travel-tips'
import { Pages } from './collections/pages'
import { Redirects } from './collections/redirects'
import { BlogpostCategories } from './collections/blogpost-categories'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Returns the full frontend URL to the given path. Returns null if the page has no path (yet).
 */
const generatePageURL = ({
  path,
  preview,
}: {
  path: string | null
  preview: boolean
}): string | null => {
  return path && process.env.NEXT_PUBLIC_FRONTEND_URL
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}${preview ? '/preview' : ''}${path}`
    : null
}

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
    Authors,
    Blogposts,
    BlogpostCategories,
    Redirects,
    Countries,
    CountryTravelTips,
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
  ],
  db: mongooseAdapter({
    url: process.env.MONGODB_URL!,
  }),
  /* db: sqliteAdapter({
    client: {
      url: process.env.SQLITE_URL!,
    },
  }), */
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: false,
  plugins: [
    payloadPagesPlugin({
      generatePageURL,
    }),
  ],
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
})
