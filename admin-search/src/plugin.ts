import type { Config } from 'payload'

import type { SearchPluginConfig } from './types/SearchPluginConfig.ts'

export const searchPlugin =
  (pluginOptions: SearchPluginConfig) =>
  (incomingConfig: Config): Config => {
    if (pluginOptions.enabled === false) {
      return incomingConfig
    }

    return {
      ...incomingConfig,
      admin: {
        ...incomingConfig.admin,
        components: {
          ...incomingConfig.admin?.components,
          actions: [
            ...(incomingConfig.admin?.components?.actions || []),
            '@/payload-plugin/admin-search/admin/components/search-button#SearchButton',
          ],
        },
      },
    }
  }
