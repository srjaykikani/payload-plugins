import { RelationshipField } from '@payloadcms/ui'
import { RelationshipFieldServerComponent } from 'payload'
import { getPageCollectionConfigAttributes } from '../../utils/getPageCollectionConfigAttributes.js'

/**
 * Parent field which sets the field to be read only if the collection has a shared parent document and the field has a value.
 */
export const ParentField: RelationshipFieldServerComponent = async ({
  path,
  collectionSlug,
  payload,
  clientField,
  data,
  permissions,
  readOnly,
}) => {
  const {
    parent: { name: parentField, sharedDocument: sharedParentDocument },
  } = getPageCollectionConfigAttributes({
    collectionSlug,
    payload,
  })

  var parentValue: string | undefined = data?.[parentField] ?? undefined
  // Check both shared parent document and permissions
  var isReadOnly = Boolean(sharedParentDocument && parentValue) || 
                   readOnly || 
                   (permissions !== true && permissions?.update !== true)

  return <RelationshipField path={path as string} field={clientField} readOnly={isReadOnly} />
}
