'use client'

import { ArrayField, Drawer, Button, useModal } from '@payloadcms/ui'
import { ArrayFieldClientComponent } from 'payload'
import { BreadcrumbsIcon } from '../../icons/BreadcrumbsIcon.js'

const breadcrumbsModalSlug = 'breadcrumbs-drawer'

export const BreadcrumbsFieldModalButton: React.FC = () => {
  const { toggleModal } = useModal()

  return (
    <Button
      onClick={() => toggleModal(breadcrumbsModalSlug)}
      buttonStyle="transparent"
      size="small"
      icon={<BreadcrumbsIcon />}
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
