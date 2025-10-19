'use client'

import { FieldLabel, TextareaInput, useDocumentInfo, useField } from '@payloadcms/ui'
import type { TextareaFieldClientComponent } from 'payload'

import { GenerateAltTextButton } from './GenerateAltTextButton'

export type AltTextFieldProps = {
  openAIApiKey: string
  defaultModel: string
  models: string[]
}

export const AltTextField: TextareaFieldClientComponent = (props) => {
  const { field, path } = props as any
  const customProps = (props as any).clientProps as AltTextFieldProps

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
