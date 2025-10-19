import type { CollectionConfig } from 'payload'
import { aiAltTextField, injectBulkGenerateButton } from '@jhb.software/payload-ai-alt-text-plugin'

export const Media: CollectionConfig = injectBulkGenerateButton({
  slug: 'media',
  upload: {
    // Configure image sizes for testing thumbnail generation
    imageSizes: [
      {
        name: 'sm',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'md',
        width: 800,
        height: 600,
        position: 'centre',
      },
    ],
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'context',
      label: 'Context',
      type: 'text',
      required: false,
      localized: true,
      admin: {
        description:
          'Details not visible in the image (such as the location or event). Used to enhance AI-generated alt text with additional context.',
      },
    },
    // CRITICAL: Use plugin's field factory
    aiAltTextField({
      localized: true, // Test localization support
    }),
    {
      name: 'keywords',
      label: 'Keywords',
      type: 'text',
      hasMany: true,
      required: false,
      localized: true,
      admin: {
        description: 'Keywords describing the image content',
      },
    },
    // Additional field for testing
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
  ],
})
