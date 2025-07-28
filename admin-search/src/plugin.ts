import type { Config } from 'payload'

import type { AdminSearchPluginConfig } from './types/AdminSearchPluginConfig.js'

export const adminSearchPlugin =
  (pluginOptions: AdminSearchPluginConfig) =>
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
            '@jhb.software/payload-admin-search/client#SearchButton',
          ],
        },
      },
    }
  }
