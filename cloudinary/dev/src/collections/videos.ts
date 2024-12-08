import { createMediaCollectionConfig } from '@jhb.software/payload-cloudinary-plugin'

export const Videos = createMediaCollectionConfig({
  slug: 'videos',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  uploads: {
    mimeTypes: ['video/*'],
  },
  fields: [
    {
      name: 'description',
      type: 'textarea',
    },
  ],
})
