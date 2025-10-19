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
    // CRITICAL: Use plugin's field factory
    aiAltTextField({
      localized: true, // Test localization support
    }),
    // Additional field for testing
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
  ],
})
