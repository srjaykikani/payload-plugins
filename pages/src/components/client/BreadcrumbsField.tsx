'use client'

import { ArrayField, Drawer, Button, useModal } from '@payloadcms/ui'
import { ArrayFieldClientComponent } from 'payload'

const breadcrumbsModalSlug = 'breadcrumbs-drawer'

export const BreadcrumbsFieldModalButton: React.FC = () => {
  const { toggleModal } = useModal()

  return (
    <Button
      onClick={() => toggleModal(breadcrumbsModalSlug)}
      buttonStyle="transparent"
      size="small"
      icon={
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 4l3 4-3 4h2l3-4-3-4H2zm5 0l3 4-3 4h2l3-4-3-4H7z" />
        </svg>
      }
      tooltip="Show Breadcrumbs"
    />
  )
}
export const BreadcrumbsField: ArrayFieldClientComponent = (props) => {
  const { field, path } = props

  return (
    <div className="field-type breadcrumbs-field-component">
      <Drawer slug={breadcrumbsModalSlug} title="Breadcrumbs">
        <div style={{ padding: '20px' }}>
          <ArrayField {...props} field={field} path={path} readOnly={true} />
        </div>
      </Drawer>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-base-100)' }} />
    </div>
  )
}

export default BreadcrumbsField
