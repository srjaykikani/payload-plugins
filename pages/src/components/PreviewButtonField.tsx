'use client'

import { Button, useDocumentInfo, useField } from '@payloadcms/ui'
import React from 'react'
import { getPageUrl } from '../utils/getPageUrl'

// TODO: override the live preview button instead?
// https://payloadcms.com/docs/beta/admin/components#root-components

/**
 * Custom field to display a preview button which links to the frontend page.
 */
export const PreviewButtonField: React.FC = () => {
  const { id, initialData } = useDocumentInfo()
  const { value: path } = useField<string>({ path: 'path' })
  const initialPath = initialData?.path

  // TODO: disable the preview button, when the document is currently being edited
  // The button should only be enabled, when the document was just saved, or when it was not edited yet.
  const disable = initialPath != path

  const tooltip = disable
    ? 'Save the document to preview the changes'
    : 'Open Frontend Page in preview mode'

  // The preview button should only be displayed, when the document has a draft/published version
  // with a path before any action to this form. Only then the frontend will have a page for this document.
  const previewUrl = initialPath && id ? getPageUrl({ path, preview: true }) : undefined

  // TODO: is there a LinkButton component in @payloadcms/ui?

  return (
    previewUrl && (
      <a href={previewUrl} target="_blank" rel="noopener noreferrer">
        <Button type="button" tooltip={tooltip} disabled={disable}>
          Preview
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="14"
            height="14"
            style={{ marginLeft: '8px', marginBottom: '2px' }}
          >
            <path
              fillRule="evenodd"
              d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </a>
    )
  )
}