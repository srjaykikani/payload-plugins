'use client'
import { CheckboxField, useField } from '@payloadcms/ui'
import { CheckboxFieldClient } from 'payload'

type IsRootPageStatusProps = ({
  field,
  path,
  hasRootPage,
}: {
  field: Omit<CheckboxFieldClient, 'type'> & Partial<Pick<CheckboxFieldClient, 'type'>>
  path: string
  hasRootPage: boolean
}) => React.JSX.Element | null

/**
 * Field which displays either a checkbox to set the page to be root page or a message if the page is the root page.
 */
export const IsRootPageStatus: IsRootPageStatusProps = ({ field, path, hasRootPage }) => {
  const { value } = useField<boolean>({ path: path! })
  const isRootPage = value ?? false

  if (isRootPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem' }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }}
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Root page
      </div>
    )
  } else if (!hasRootPage && !isRootPage) {
    return <CheckboxField path={path} field={field} />
  }

  return null
}
