'use server'

import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import type { ChatCompletionContentPartText } from 'openai/resources/chat/completions'
import type { CollectionSlug } from 'payload'
import { getPayload } from 'payload'
import { z } from 'zod'

import { getGenerationCost } from '../utilities/getGenerationCost'
import { getImageDataUrl } from '../utilities/getImageDataUrl'
import { getImageThumbnail } from '../utilities/getImageThumbnail'
import { getUserFromHeaders } from '../utilities/getUserFromHeaders'
import type { MediaDocument } from '../types/MediaDocument'

/**
 * Generates alt text for a single image using OpenAI Vision API.
 * Returns result without updating the document.
 */
export async function generateAltText({
  collection,
  id,
  locale,
  context,
  model = 'gpt-4o-mini',
}: {
  collection: CollectionSlug
  id: string
  locale: string
  context?: string
  model?: 'gpt-4o-mini' | 'gpt-4o-2024-08-06'
}): Promise<{
  altText: string
  keywords: string[]
}> {
  try {
    // @ts-ignore - User's project will have @payload-config
    const payload = await getPayload({ config: await import('@payload-config') })
    const user = await getUserFromHeaders({ payload })

    if (!user) {
      throw new Error('Unauthorized')
    }

    const imageDoc = await payload.findByID({
      collection,
      id,
      depth: 0,
    })

    if (!imageDoc) {
      throw new Error('Image not found')
    }

    const thumbnailUrl = getImageThumbnail(imageDoc as MediaDocument)

    // For local development (http://), convert image to base64
    // OpenAI cannot access localhost URLs, so we need to send the image data directly
    const imageUrl = thumbnailUrl.startsWith('http://')
      ? await getImageDataUrl(thumbnailUrl)
      : thumbnailUrl

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const schema = z.object({
      altText: z.string().describe('A concise, descriptive alt text for the image'),
      keywords: z.array(z.string()).describe('Keywords describing the image content'),
    })

    // @ts-ignore - parse method exists in openai 4.77+
    const response = await openai.chat.completions.parse({
      model,
      messages: [
        {
          role: 'system',
          content: `
            You are an expert at analyzing images and creating descriptive alt text.

            Provide:
            - A concise alt text (1-2 sentences) as "altText". Focus on subject, action, setting.
            - Avoid phrases like 'Image of', 'A picture of', or 'Photo showing'
            - Be specific with relevant details like location or context if visible
            - Make no assumptions
            - A list of keywords as "keywords" (e.g., ["mountain", "snow", "nature"])

            If context is provided, use it to enhance the alt text.

            Respond in ${locale} language.
          `,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
            ...('filename' in imageDoc && imageDoc.filename
              ? [
                  {
                    type: 'text',
                    text: imageDoc.filename,
                  } satisfies ChatCompletionContentPartText,
                ]
              : []),
            ...(context
              ? [
                  {
                    type: 'text',
                    text: context,
                  } satisfies ChatCompletionContentPartText,
                ]
              : []),
          ],
        },
      ],
      max_completion_tokens: 150,
      response_format: zodResponseFormat(schema, 'data'),
    })

    console.log({ imageId: id, ...getGenerationCost(response, model) })

    const result = response.choices[0]?.message?.parsed

    if (!result) {
      throw new Error('No result from OpenAI')
    }

    return result
  } catch (error) {
    console.error('Error generating alt text:', error)
    throw new Error(
      `Error generating alt text: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
