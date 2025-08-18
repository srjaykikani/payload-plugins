'use client'

import { Button, useDocumentInfo, useField, useFormModified, useTranslation } from '@payloadcms/ui'
import React from 'react'
import { getPageUrl } from '../../utils/getPageUrl.js'
import { usePluginTranslation } from '../../utils/usePluginTranslations.js'
import { ExternalLinkIcon } from '@payloadcms/ui/icons/ExternalLink'

/**
 * Custom field to display a preview button which links to the frontend page.
 */
export const PreviewButtonField: React.FC = () => {
  const { id, initialData } = useDocumentInfo()
  const { value: path } = useField<string>({ path: 'path' })
  const { t: pluginTranslation } = usePluginTranslation()
  const { t } = useTranslation()

  const initialPath = initialData?.path

  // Returns true once the form is modified. When the "save" or "publish changes" button is clicked, this will reset to false.
  // TODO: (Currently modified is not reset when the document is saved with the autosave feature. Is this a bug in paylaod?)
  const modified = useFormModified()

  // When the document is modified, the changes will only be visible in the preview when the document is saved.
  // Therefore, disable the preview button, when the document is modified.
  const disable = modified

  const tooltip = disable
    ? pluginTranslation('saveDocumentToPreview')
    : pluginTranslation('openWebsitePageInPreviewMode')

  // The preview button should only be displayed, when the document has a draft/published version
  // with a path before any action to this form. Only then the frontend will have a page for this document.
  const previewUrl = initialPath && id ? getPageUrl({ path, preview: true }) : undefined

  return (
    previewUrl && (
      <Button
        tooltip={tooltip}
        disabled={disable}
        buttonStyle="secondary"
        el="anchor"
        url={previewUrl}
        newTab
        icon={
          <div
            style={{
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ExternalLinkIcon />
          </div>
        }
      >
        {t('version:preview')}
      </Button>
    )
  )
}
