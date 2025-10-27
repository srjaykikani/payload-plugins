import { GenericTranslationsObject } from './index.js'

export const en: GenericTranslationsObject = {
  $schema: './translation-schema.json',
  '@jhb.software/payload-alt-text-plugin': {
    // Field labels
    alternateText: 'Alternate text',
    keywords: 'Keywords',
    keywordsDescription: 'Keywords which describe the image. Used when searching for the image.',

    // Button labels
    generateAltText: 'Generate alt text',
    generateAltTextFor: 'Generate alt text for',
    image: 'image',
    images: 'images',

    // Toast messages
    cannotGenerateMissingFields: 'Cannot generate alt text. Missing required fields.',
    failedToGenerate: 'Failed to generate alt text. Please try again.',
    altTextGeneratedSuccess:
      'Alt text generated successfully. Please review and save the document.',
    noAltTextGenerated: 'No alt text generated. Please try again.',
    errorGeneratingAltText: 'Error generating alt text. Please try again.',
    failedToGenerateForXImages: 'Failed to generate alt text for {X} images.',
    xOfYImagesUpdated: '{X} of {Y} images updated.',

    // Help text
    altTextDescription:
      'Alternate text for the image. This will be used for screen readers and SEO. It should meet the following requirements:',
    altTextRequirement1: 'Briefly describe what is visible in the image in 1–2 sentences.',
    altTextRequirement2:
      'Ensure it conveys the same information or purpose as the image, whenever possible.',
    altTextRequirement3:
      'Avoid phrases like "image of" or "picture of" — screen readers already announce that it\'s an image.',

    // Tooltips
    pleaseSaveDocumentFirst: 'Please save the document first',
  },
}
