import { createMediaCollectionConfig } from '@jhb.software/payload-cloudinary-plugin'

export const Images = createMediaCollectionConfig({
  slug: 'images',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  uploads: {
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
})
