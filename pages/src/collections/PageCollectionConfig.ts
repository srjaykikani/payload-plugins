import { ClientCollectionConfig, CollectionConfig, Field } from 'payload'
import { breadcrumbsField } from '../fields/breadcrumbsField.js'
import { isRootPageField } from '../fields/isRootPageField.js'
import { parentField } from '../fields/parentField.js'
import { pathField } from '../fields/pathField.js'
import { slugField } from '../fields/slugField.js'
import { beforeDuplicateTitle } from '../hooks/beforeDuplicate.js'
import { ensureSelectedFieldsBeforeOperation } from '../hooks/ensureSelectedFieldsBeforeOperation.js'
import { setVirtualFieldsBeforeRead } from '../hooks/setVirtualFields.js'
import {
  IncomingPageCollectionConfig,
  PageCollectionConfig,
} from '../types/PageCollectionConfig.js'
import { PageCollectionConfigAttributes } from '../types/PageCollectionConfigAttributes.js'
import { getPageUrl } from '../utils/getPageUrl.js'

/**
 * Creates a collection config for a page-like collection by adding:
 * - Page attributes as custom attributes for use in hooks
 * - Required parent relationship field in the sidebar
 * - Hidden breadcrumbs array field
 * - Hooks for managing virtual fields and page duplication
 */
export const createPageCollectionConfig = (
  config: IncomingPageCollectionConfig,
): PageCollectionConfig => {
  const pageConfig: PageCollectionConfigAttributes = {
    // required fields are kept as they are
    parentCollection: config.page.parentCollection,
    parentField: config.page.parentField,

    // optional fields are set to default values if not provided
    breadcrumbLabelField: config.page.breadcrumbLabelField ?? config.admin?.useAsTitle ?? 'title',
    slugFallbackField: config.page.slugFallbackField ?? config.admin?.useAsTitle ?? 'title',
    sharedParentDocument: config.page.sharedParentDocument ?? false,
    isRootCollection: config.page.isRootCollection ?? false,
  }

  return {
    ...config,
    admin: {
      ...config.admin,
      preview: (data) =>
        getPageUrl({
          path: data.path as string,
          preview: true,
        }) as string,
      components: {
        edit: {
          PreviewButton: {
            path: '@jhb.software/payload-pages-plugin/client#PreviewButtonField',
          },
        },
      },
    },
    custom: {
      ...config.custom,
      // This makes the page attributes available in hooks etc.
      pageConfig,
    },
    page: pageConfig,
    hooks: {
      ...config.hooks,
      beforeOperation: [
        ...(config.hooks?.beforeOperation || []),
        ensureSelectedFieldsBeforeOperation,
      ],
      beforeRead: [...(config.hooks?.beforeRead || []), setVirtualFieldsBeforeRead],
    },
    fields: [
      ...(pageConfig.isRootCollection ? ([isRootPageField()] satisfies Field[]) : []),
      slugField({ redirectWarning: true, fallbackField: pageConfig.slugFallbackField }),
      parentField(pageConfig, config.slug),
      pathField(),
      breadcrumbsField(),
      // add the user defined fields below the fields defined by the plugin to ensure a correct order in the sidebar

      // add the beforeDuplicate hook to the title field
      ...config.fields.map((field) =>
        'name' in field && field.name === config.admin?.useAsTitle
          ? {
              ...field,
              hooks: {
                beforeDuplicate: [beforeDuplicateTitle],
              },
            }
          : field,
      ),
    ],
  }
}

/** Checks if the config is a PageCollectionConfig. */
export const isPageCollectionConfig = (
  config: CollectionConfig | ClientCollectionConfig,
): config is PageCollectionConfig => {
  if (!config) {
    console.error('config is not defined')
    return false
  }

  return 'page' in config && typeof config.page === 'object'
}

/**
 * Returns the PageCollectionConfig or null if the config is not a PageCollectionConfig.
 *
 * This provides type-safe access to the page attributes.
 */
export const asPageCollectionConfig = (
  config: CollectionConfig | ClientCollectionConfig,
): PageCollectionConfig | null => {
  if (isPageCollectionConfig(config)) {
    return config
  }
  return null
}

/**
 * Returns the PageCollectionConfig or throws an error if the config is not a PageCollectionConfig.
 *
 * This provides type-safe access to the page attributes.
 */
export const asPageCollectionConfigOrThrow = (
  config: CollectionConfig | ClientCollectionConfig,
): PageCollectionConfig => {
  if (isPageCollectionConfig(config)) {
    return config
  }

  throw new Error('Collection is not a page collection')
}
