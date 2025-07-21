import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  redirects: () => [
    {
      source: '/',
      destination: '/admin',
      permanent: true,
    },
  ],
}

export default withPayload(nextConfig)
