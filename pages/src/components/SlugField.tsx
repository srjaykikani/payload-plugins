'use client'
import { Banner, FieldLabel, TextInput, Tooltip, useDocumentInfo, useField } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { formatSlug, liveFormatSlug } from '../hooks/validateSlug'
import type { TextFieldClientComponent } from 'payload'

export const SlugField: TextFieldClientComponent =
  // @ts-ignore
  ({ field, path, redirectWarning, fallbackField = 'title' }) => {
    const { value: title } = useField<string>({ path: fallbackField })
    const { initialData, hasPublishedDoc, id } = useDocumentInfo()
    const initialSlug = initialData?.[path!]
    const { value: slug, setValue: setSlug } = useField<string>({ path: path })
    const [showSyncButtonTooltip, setShowSyncButtonTooltip] = useState(false)

    // TODO: use the redirectNecessary function to determine if a redirect is necessary

    useEffect(() => {
      // Only update the slug when editing the title when the document is not published to avoid
      // the creation of a redirection due to the slug change
      if (!hasPublishedDoc) {
        // Payload automatically sets the title to "[Untitled]" when the document is created and to id when the title field
        // for an existing document is empty. In this cases, and when the title is not set, clear the slug.
        if (!title || title === id || title === '[Untitled]') {
          setSlug(undefined)
        } else {
          setSlug(formatSlug(title))
        }
      }

      // Only the title should trigger this effect
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title])

    // TextField component could not be used here, because it does not support the onChange event
    return (
      <>
        <div className="field-type slug-field-component">
          <FieldLabel
            htmlFor={`field-${path}`}
            label={field.label}
            required={field.required}
            localized={field.localized}
          />

          <div style={{ position: 'relative' }}>
            <TextInput
              value={slug}
              path={path!}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSlug(liveFormatSlug(e.target.value))
              }}
            />
            {title && formatSlug(title) !== slug && (
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <>
                  <Tooltip show={showSyncButtonTooltip}>Sync slug with {fallbackField}</Tooltip>

                  <button
                    type="button"
                    onClick={() => {
                      setSlug(formatSlug(title))
                      setShowSyncButtonTooltip(false)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'var(--theme-elevation-500)',
                      transition: 'color 0.2s',
                      transform: 'scale(0.5)',
                    }}
                    onMouseEnter={(_) => setShowSyncButtonTooltip(true)}
                    onMouseLeave={(_) => setShowSyncButtonTooltip(false)}
                  >
                    <RefreshIcon />
                  </button>
                </>
              </div>
            )}
          </div>

          {redirectWarning && initialSlug !== slug && hasPublishedDoc && (
            <div style={{ marginTop: '0.5rem' }}>
              <Banner type="info" icon={<InfoIcon />} alignIcon="left">
                <div style={{ marginLeft: '0.5rem' }}>
                  The slug was changed from <code>{initialSlug}</code> to <code>{slug}</code>. This
                  will automatically create a redirection from the old to the new page path.
                </div>
              </Banner>
            </div>
          )}
        </div>
      </>
    )
  }

export default SlugField

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 16V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </svg>
)

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
)
