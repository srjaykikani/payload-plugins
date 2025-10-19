'use server'

import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import type { ChatCompletionContentPartText } from 'openai/resources/chat/completions'
import pMap from 'p-map'
import type { BasePayload, CollectionSlug } from 'payload'
import { getPayload } from 'payload'
import { z } from 'zod'

import { getGenerationCost } from '../utilities/getGenerationCost'
import { getImageThumbnail } from '../utilities/getImageThumbnail'
import { getUserFromHeaders } from '../utilities/getUserFromHeaders'

/**
 * Generates and updates alt text for multiple images in all locales.
 */
export async function bulkUpdateAltTexts({
  collection,
  ids,
  model = 'gpt-4o-mini',
}: {
  collection: CollectionSlug
  ids: string[]
  model?: 'gpt-4o-mini' | 'gpt-4o-2024-08-06'
}): Promise<{
  updatedDocs: number
  totalDocs: number
  erroredDocs: string[]
}> {
  try {
    const payload = await getPayload({ config: await import('@payload-config') })
    const user = await getUserFromHeaders({ payload })

    if (!user) {
      throw new Error('Unauthorized')
    }

    let updatedDocs = 0
    const erroredDocs: string[] = []

    await pMap(
      ids,
      async (id) => {
        try {
          await generateAndUpdateAltText({ payload, id, collection, model })
          updatedDocs++
          console.log(
            `${updatedDocs}/${ids.length} updated (${Math.round((updatedDocs / ids.length) * 100)}%)`,
          )
        } catch (error) {
          console.error(`Error generating alt text for ${id}:`, error)
          erroredDocs.push(id)
        }
      },
      { concurrency: 16 },
    )

    if (erroredDocs.length > 0) {
      console.error(`Failed for: ${erroredDocs.join(', ')}`)
    }

    return {
      updatedDocs,
      totalDocs: ids.length,
      erroredDocs,
    }
  } catch (error) {
    console.error('Error in bulk generation:', error)
    throw new Error(
      `Error generating alt text: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

async function generateAndUpdateAltText({
  payload,
  id,
  collection,
  model,
}: {
  payload: BasePayload
  id: string
  collection: CollectionSlug
  model: string
}) {
  const imageDoc = await payload.findByID({
    collection,
    id,
    depth: 0,
  })

  if (!imageDoc) {
    throw new Error('Image not found')
  }

  const thumbnailUrl = getImageThumbnail(imageDoc as any)

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  // Assuming en and de locales - adjust as needed
  const schema = z.object({
    en: z.object({
      altText: z.string(),
      keywords: z.array(z.string()),
    }),
    de: z.object({
      altText: z.string(),
      keywords: z.array(z.string()),
    }),
  })

  const response = await openai.chat.completions.parse({
    model,
    messages: [
      {
        role: 'system',
        content: `
          Expert at creating localized alt text in English and German.

          Provide for both languages:
          - Concise alt text (1-2 sentences)
          - Keywords describing content

          Avoid 'Image of' phrases. Be specific. Make no assumptions.
        `,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: thumbnailUrl },
          },
          ...('filename' in imageDoc && imageDoc.filename
            ? [{ type: 'text', text: imageDoc.filename } satisfies ChatCompletionContentPartText]
            : []),
          ...('context' in imageDoc && imageDoc.context
            ? [{ type: 'text', text: imageDoc.context } satisfies ChatCompletionContentPartText]
            : []),
        ],
      },
    ],
    max_completion_tokens: 300,
    response_format: zodResponseFormat(schema, 'data'),
  })

  console.log({ imageId: id, ...getGenerationCost(response, model) })

  const result = response.choices[0]?.message?.parsed

  if (!result) {
    throw new Error('No result from OpenAI')
  }

  // Update for each locale
  for (const locale of ['en', 'de'] as const) {
    await payload.update({
      collection,
      id,
      locale,
      data: {
        alt: result[locale].altText,
        keywords: result[locale].keywords,
      },
    })
  }
}
