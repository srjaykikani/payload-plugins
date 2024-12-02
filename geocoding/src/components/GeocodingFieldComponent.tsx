'use client'
import { SelectField } from '@payloadcms/ui'
import { SelectFieldClientComponent } from 'payload'

export const GeocodingFieldComponent: SelectFieldClientComponent = ({
  field,
  path: fieldPath,
  schemaPath,
}) => {
  return <SelectField field={field} path={fieldPath} schemaPath={schemaPath} />
}
