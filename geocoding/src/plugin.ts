import type { Config } from 'payload'

import type { MyPluginOptions } from './types.js'

export const myPlugin =
  (pluginOptions: MyPluginOptions) =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    // If the plugin is disabled, return the config without modifying it
    if (pluginOptions.enabled === false) {
      return config
    }

    return config
  }
