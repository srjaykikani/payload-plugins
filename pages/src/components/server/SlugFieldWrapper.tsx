import { TextFieldServerComponent } from 'payload'
import SlugField from '../client/SlugField.js'

/**
 * Server component wrapper for SlugField that handles access-aware readOnly state.
 */
export const SlugFieldWrapper: TextFieldServerComponent = async ({
  clientField,
  path,
  permissions,
  readOnly,
}) => {
  const isReadOnly = readOnly || (permissions !== true && permissions?.update !== true)
  return (
    <SlugField
      field={clientField}
      path={path as string}
      readOnly={isReadOnly}
    />
  )
}