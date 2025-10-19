'use client'

import { Button, toast, useDocumentInfo, useField, useLocale } from '@payloadcms/ui'
import { useTransition } from 'react'

import { generateAltText } from '../actions/generateAltText'

function GenerateAltTextButton() {
  const { id, collectionSlug } = useDocumentInfo()
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  const { value: context } = useField<string | undefined>({ path: 'context' })
  const { setValue: setKeywords } = useField<string>({ path: 'keywords' })
  const { setValue: setAltText } = useField<string>({ path: 'alt' })

  const handleGenerate = async () => {
    if (!collectionSlug || !id) {
      toast.error('Cannot generate. Missing required fields.')
      return
    }

    startTransition(async () => {
      try {
        const model =
          (process.env.NEXT_PUBLIC_OPENAI_MODEL as 'gpt-4o-mini' | 'gpt-4o-2024-08-06') ||
          'gpt-4o-mini'

        const data = await generateAltText({
          collection: collectionSlug,
          id: id as string,
          context,
          model,
          locale: locale.code,
        })

        if (data.altText && data.keywords) {
          setAltText(data.altText)
          setKeywords(data.keywords)
          toast.success('Alt text generated. Please review and save.')
        } else {
          toast.error('No alt text generated.')
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error generating alt text.')
      }
    })
  }

  return (
    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
      <div style={{ flex: '1', color: 'var(--theme-elevation-400)' }}>
        <p>Alt text for screen readers and SEO. Requirements:</p>
        <ol style={{ paddingLeft: '20px', margin: '10px 0' }}>
          <li>Briefly describe visible content (1-2 sentences)</li>
          <li>Convey same information/purpose as image</li>
          <li>Avoid "image of" or "picture of"</li>
        </ol>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          onClick={handleGenerate}
          disabled={isPending || !id}
          tooltip={!id ? 'Save document first' : undefined}
        >
          {isPending ? 'Generating...' : 'AI-Generate'}
        </Button>
      </div>
    </div>
  )
}

export default GenerateAltTextButton
