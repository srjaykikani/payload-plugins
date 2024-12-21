import { CollectionBeforeOperationHook } from 'payload'
import { asPageCollectionConfigOrThrow } from '../collections/PageCollectionConfig'
import { requiredFields } from './setVirtualFields'

/**
 * A CollectionBeforeOperationHook that ensures that all required fields for the
 * setVirtualFields hook to generate the path and breadcrumbs fields are selected.
 */
export const ensureSelectedFieldsBeforeOperation: CollectionBeforeOperationHook = async ({
  args,
  operation,
  context,
}) => {
  if (operation == 'read' && args.select) {
    const selectedFields = Object.keys(args.select)

    if (selectedFields.includes('path') || selectedFields.includes('breadcrumbs')) {
      const pageConfig = asPageCollectionConfigOrThrow(args.collection.config)

      // Select the parent, slug and breadcrumbLabelField fields, as they are required for the setVirtualFields hook to work.
      args.select = {
        ...args.select,
        ...requiredFields(pageConfig).reduce((acc, field) => ({ ...acc, [field]: true }), {}),
      }
    }
  }

  // Make the select object available to the setVirtualFields hook
  context.select = args.select

  return args
}
