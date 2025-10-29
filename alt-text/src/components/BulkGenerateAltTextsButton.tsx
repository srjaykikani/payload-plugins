'use client'

import { Button, toast, useSelection } from '@payloadcms/ui'
import { useRouter } from 'next/navigation.js'
import { useTransition } from 'react'

import { Lightning } from './icons/Lightning.js'
import { Spinner } from './icons/Spinner.js'
import { usePluginTranslation } from '../utils/usePluginTranslation.js'

export function BulkGenerateAltTextsButton({ collectionSlug }: { collectionSlug: string }) {
  const { t } = usePluginTranslation()
  const [isPending, startTransition] = useTransition()
  const { selected, setSelection } = useSelection()

  const selectedIds = Array.from(selected.entries())
    .filter(([, isSelected]) => isSelected)
    .map(([id]) => id) as string[]

  const router = useRouter()

  const handleGenerateAltTexts = async () => {
    startTransition(async () => {
      if (!collectionSlug) {
        throw new Error('Collection slug is required')
      }

      try {
        const response = await fetch('/api/alt-text-plugin/bulk-generate-alt-texts', {
          method: 'POST',
          body: JSON.stringify({
            collection: collectionSlug,
            ids: selectedIds,
          }),
        })

        if (!response.ok) {
          toast.error(t('failedToGenerate'))
          return
        }

        const data = (await response.json()) as {
          updatedDocs: number
          totalDocs: number
          erroredDocs: string[]
        }

        if (data.erroredDocs.length > 0) {
          toast.error(
            t('failedToGenerateForXImages').replace('{X}', data.erroredDocs.length.toString()),
          )
        }

        // in case not all images were updated, show a warning instead of a success message:
        if (data.updatedDocs === data.totalDocs) {
          toast.success(
            t('xOfYImagesUpdated')
              .replace('{X}', data.updatedDocs.toString())
              .replace('{Y}', data.totalDocs.toString()),
          )
        } else {
          toast.warning(
            t('xOfYImagesUpdated')
              .replace('{X}', data.updatedDocs.toString())
              .replace('{Y}', data.totalDocs.toString()),
          )
        }

        // deselect all previously selected images
        for (const id of selectedIds) {
          setSelection(id)
        }

        router.refresh()
      } catch (error) {
        console.error('Error generating alt text:', error)
        toast.error(t('errorGeneratingAltText'))
      }
    })
  }

  return (
    selectedIds.length > 0 && (
      <div style={{ display: 'flex', justifyContent: 'right' }} className="m-0">
        <Button
          onClick={handleGenerateAltTexts}
          disabled={isPending || selectedIds.length === 0}
          icon={isPending ? <Spinner /> : <Lightning />}
          className="m-0"
        >
          {t('generateAltTextFor')} {selectedIds.length}{' '}
          {selectedIds.length === 1 ? t('image') : t('images')}
        </Button>
      </div>
    )
  )
}
