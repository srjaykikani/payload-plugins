import { CollectionBeforeOperationHook } from 'payload'
import { asPageCollectionConfigOrThrow } from '../utils/pageCollectionConfigHelpers.js'
import { dependentFields } from './setVirtualFields.js'
import { getSelectType } from '../utils/getSelectType.js'

/**
 * A CollectionBeforeOperationHook that alters the select in case a virtual field is selected
 * to ensure that the fields the setVirtualFields hook depends on to correctly generate
 * the virtual fields are also selected.
 */
export const selectDependentFieldsBeforeOperation: CollectionBeforeOperationHook = async ({
  args,
  operation,
  context,
}) => {
  // early return if this hook runs for nested operations (e.g. for population operations or field level hooks)
  // else store information about the rootOperation in order for the deleteUnselectedFieldsAfterRead hook to know if it is called for the root operation or for nested operations
  if (typeof args.currentDepth === 'number' && args.currentDepth > 0) {
    return args
  } else {
    context.rootOperation = `${args.id}-${args.collection.config.slug}`
  }

  // Make the select object available to the setVirtualFields hook by adding it to the context
  context.select = args.select

  if (operation == 'read' && args.select) {
    const originalSelect = args.select
    const pageConfig = asPageCollectionConfigOrThrow(args.collection.config)
    const selectType = getSelectType(args.select)
    const dependendSelectedFields = dependentFields(pageConfig)

    if (selectType === 'include') {
      const selectedFields = Object.keys(args.select)

      const virtualFields = ['path', 'breadcrumbs', 'meta']
      const hasVirtualFieldsSelected = virtualFields.some((field) => selectedFields.includes(field))

      if (hasVirtualFieldsSelected) {
        // extend the select with the required fields
        args.select = {
          ...args.select,
          ...dependendSelectedFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
        }

        // TODO: when the user has not selected the parent field, but the parent field is added above, only populate the breadcrumbs field of it.
        // args.populate = {
        //   ...args.populate,

        //   // only populate the breadcrumbs field of the parent field, otherwise, for every read operation, all fields of the parent would be unecessaryly returned
        //   [pageConfig.page.parent.collection]: {
        //     breadcrumbs: true,
        //     ...args.populate?.[pageConfig.page.parent.collection],
        //   },
        // }

        // console.log('### args.populate', args.populate)

        // Store the original select so that deleteUnselectedFieldsAfterRead can properly handle field exclusion
        context.originalSelect = originalSelect

        // Make the modified select available to the setVirtualFields hook
        context.select = args.select

        // Indicate that the virtual fields should be generated in the setVirtualFields hook
        context.generateVirtualFields = true
      }
    } else if (selectType === 'exclude') {
      const selectedFields = Object.keys(args.select)
      const virtualFields = ['path', 'breadcrumbs', 'meta']
      const allVirtualFieldsDeselected = virtualFields.every((field) =>
        selectedFields.includes(field),
      )

      if (!allVirtualFieldsDeselected) {
        // min one of the virtual fields needs to be generated
        // -> remove deselection of the required fields
        args.select = Object.fromEntries(
          Object.entries(args.select).filter(([field]) => !dependendSelectedFields.includes(field)),
        )

        // if select is empty now, set it to undefined, because an empty select would select nothing
        if (Object.keys(args.select).length === 0) {
          args.select = undefined
        }

        // Store the original select so that deleteUnselectedFieldsAfterRead can properly handle field exclusion
        context.originalSelect = originalSelect

        // Make the modified select available to the setVirtualFields hook
        context.select = args.select

        // Indicate that the virtual fields should be generated in the setVirtualFields hook
        context.generateVirtualFields = true
      }
    }
  } else if (operation == 'read' && !args.select) {
    // Indicate that the virtual fields should be generated in the setVirtualFields hook
    // if no select is provided
    context.generateVirtualFields = true
  }

  return args
}
