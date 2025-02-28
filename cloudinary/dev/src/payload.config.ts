import { payloadCloudinaryPlugin } from '@jhb.software/payload-cloudinary-plugin'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { Images } from './collections/images'
import { Videos } from './collections/videos'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default buildConfig({
  admin: {
    autoLogin: {
      email: 'dev@payloadcms.com',
      password: 'test',
    },
    user: 'users',
    components: {
      beforeDashboard: ['/src/components/ClientSideCloudinaryUpload'],
    },
  },
  collections: [
    Videos,
    Images,
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI!,
  }),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    payloadCloudinaryPlugin({
      credentials: {
        apiKey: process.env.CLOUDINARY_API_KEY!,
        apiSecret: process.env.CLOUDINARY_API_SECRET!,
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        folder: 'payload-cloudinary-plugin',
      },
      uploadCollections: ['images', 'videos'],
      uploadOptions: {
        useFilename: true,
      },
    }),
  ],
  endpoints: [
    {
      path: '/sign',
      method: 'post',
      handler: async (req) => {
        if (!req) {
          return new Response(JSON.stringify({ error: 'No request provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const body = await req.json?.()

        if (!body?.paramsToSign) {
          return new Response(JSON.stringify({ error: 'No paramsToSign provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const signature = cloudinary.utils.api_sign_request(
          body.paramsToSign,
          process.env.CLOUDINARY_API_SECRET!,
        )

        return new Response(JSON.stringify({ signature }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
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
