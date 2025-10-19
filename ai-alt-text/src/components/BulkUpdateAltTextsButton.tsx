'use client'

import { Button, toast, useDocumentInfo, useSelection } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { bulkUpdateAltTexts } from '../actions/bulkUpdateAltTexts'

export function BulkUpdateAltTextsButton() {
  const [isPending, startTransition] = useTransition()
  const { selected, setSelection } = useSelection()
  const { collectionSlug } = useDocumentInfo()
  const router = useRouter()

  const selectedIds = Array.from(selected.entries())
    .filter(([, isSelected]) => isSelected)
    .map(([id]) => id) as string[]

  const handleBulkGenerate = async () => {
    if (!collectionSlug) {
      toast.error('Cannot determine collection')
      return
    }

    startTransition(async () => {
      try {
        // Use env var if set, otherwise use plugin config default (gpt-4o-mini)
        // Plugin config is accessed server-side in the action
        const model =
          (process.env.NEXT_PUBLIC_OPENAI_MODEL as 'gpt-4o-mini' | 'gpt-4o-2024-08-06') ||
          'gpt-4o-mini'

        const { updatedDocs, totalDocs, erroredDocs } = await bulkUpdateAltTexts({
          collection: collectionSlug,
          ids: selectedIds,
          model,
        })

        if (erroredDocs.length > 0) {
          toast.error(`Failed for ${erroredDocs.length} images`)
        }

        if (updatedDocs === totalDocs) {
          toast.success(`${updatedDocs} of ${totalDocs} updated`)
        } else {
          toast.warning(`${updatedDocs} of ${totalDocs} updated`)
        }

        // Deselect all
        selectedIds.forEach((id) => setSelection(id))

        router.refresh()
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error generating alt text')
      }
    })
  }

  return selectedIds.length > 0 ? (
    <div style={{ display: 'flex', justifyContent: 'right' }} className="m-0">
      <Button onClick={handleBulkGenerate} disabled={isPending} className="m-0">
        {isPending ? 'Generating...' : `AI-Generate for ${selectedIds.length}`}
      </Button>
    </div>
  ) : null
}

