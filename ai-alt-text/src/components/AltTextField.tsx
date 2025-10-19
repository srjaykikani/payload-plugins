'use client'

import { FieldLabel, TextareaInput, useDocumentInfo, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

import { GenerateAltTextButton } from './GenerateAltTextButton'

export function AltTextField(clientProps: TextFieldClientComponent) {
  // @ts-expect-error - Payload types
  const { field, path } = clientProps

  const { value, setValue } = useField<string>({ path })
  const { id } = useDocumentInfo()

  // Field is optional when document is being created
  const required = id ? field.required : false

  return (
    <div className="field-type textarea" style={{ flex: '1 1 auto' }}>
      <FieldLabel
        htmlFor={`field-${path}`}
        label={field.label}
        required={required}
        localized={field.localized}
      />

      <div className="field-type__wrap">
        <TextareaInput
          value={value}
          path={path!}
          required={required}
          onChange={(e) => setValue(e.target.value)}
          AfterInput={<GenerateAltTextButton />}
        />
      </div>
    </div>
  )
}
