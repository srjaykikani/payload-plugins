export { createPageCollectionConfig } from './collections/PageCollectionConfig.js'
export { createRedirectsCollectionConfig } from './collections/RedirectsCollectionConfig.js'
export { alternatePathsField } from './fields/alternatePathsField.js'
export { slugField } from './fields/slugField.js'
export { payloadPagesPlugin } from './plugin.js'
export type {
  IncomingPageCollectionConfig,
  PageCollectionConfig,
} from './types/PageCollectionConfig.js'
export type {
  PageCollectionConfigAttributes,
  IncomingPageCollectionConfigAttributes as PageCollectionIncomingConfigAttributes,
} from './types/PageCollectionConfigAttributes.js'
export type { PagesPluginConfig } from './types/PagesPluginConfig.js'
export { getPageUrl } from './utils/getPageUrl.js'
