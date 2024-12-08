'use client'
import { useAllFormFields, useRowLabel } from '@payloadcms/ui'
import { RowLabelComponent } from 'payload'

function countOccurrences(mainStr: string, subStr: string): number {
  const regex = new RegExp(subStr, 'g')
  const matches = mainStr.match(regex)
  return matches ? matches.length : 0
}

/** A row label for the keywords field which includes hints and warning about the keyword. */
export const KeywordsFieldRowLabel = ({}: RowLabelComponent) => {
  const { data, rowNumber } = useRowLabel<{ keyword: string }>()
  const [fields] = useAllFormFields()

  const getKeywordCount = () => {
    let count: number = 0

    Object.entries(fields).forEach(([fieldName, field]) => {
      // Skip meta.* fields
      if (fieldName.startsWith('meta.')) return

      const value = field?.value

      if (typeof value === 'string') {
        // Count in text fields
        count += countOccurrences(value, data.keyword)
      } else if (typeof value === 'object' && (value as any)?.root != null) {
        // Count in Lexical RichText fields
        // TODO: convert to plain text first
        count += countOccurrences(JSON.stringify(value), data.keyword)
      }
    })
    return count
  }

  const checkSeoFields = () => {
    const title = (fields as any)['meta.title'].value as string
    const description = (fields as any)['meta.description'].value as string
    const keyword = data.keyword?.toLowerCase()

    if (!keyword) return null

    const inTitle = title?.toLowerCase().includes(keyword)
    const inDescription = description?.toLowerCase().includes(keyword)

    return (
      <>
        {!inTitle && (
          <span
            style={{
              background: '#ffcccc',
              padding: '0px 6px',
              borderRadius: '4px',
              marginLeft: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <WarningIcon /> Not in Title
          </span>
        )}
        {!inDescription && (
          <span
            style={{
              background: '#ffcccc',
              padding: '0px 6px',
              borderRadius: '4px',
              marginLeft: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <WarningIcon /> Not in Description
          </span>
        )}
      </>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
      <span>{rowNumber === 0 ? '★ Focus Keyword' : rowNumber + '. Keyword'}</span>

      {data.keyword?.trim() && (
        <>
          <span
            style={{
              background:
                getKeywordCount() > 5 ? '#ccffcc' : getKeywordCount() > 0 ? '#ffe6cc' : '#ffcccc',
              padding: '0px 6px',
              borderRadius: '4px',
              marginLeft: '12px',
            }}
          >
            {getKeywordCount() > 0 ? (
              `${getKeywordCount()} Occurrences`
            ) : (
              <>
                <WarningIcon /> Not in content
              </>
            )}
          </span>
          {rowNumber === 0 && checkSeoFields()}
        </>
      )}
    </div>
  )
}

export default KeywordsFieldRowLabel

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-circle-alert"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
