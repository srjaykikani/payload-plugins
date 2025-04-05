import type { Config } from 'payload'

import type { PagesPluginConfig } from './types/PagesPluginConfig.js'
import { translations } from './translations/index.js'
import { deepMergeSimple } from './utils/deepMergeSimple.js'

/** Payload plugin which integrates fields for managing website pages. */
export const payloadPagesPlugin =
  (pluginOptions: PagesPluginConfig) =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    // If the plugin is disabled, return the config without modifying it
    if (pluginOptions.enabled === false) {
      return config
    }

    config.onInit = async (payload) => {
      if (incomingConfig.onInit) {
        await incomingConfig.onInit(payload)
      }

      const neededEnvVars = ['NEXT_PUBLIC_FRONTEND_URL']

      const missingEnvVars = neededEnvVars.filter((envVar) => !process.env[envVar])
      if (missingEnvVars.length > 0) {
        throw new Error(
          `The following environment variables are required for the pages plugin but not defined: ${missingEnvVars.join(
            ', ',
          )}`,
        )
      }
    }

    return {
      ...config,
      i18n: {
        ...config.i18n,
        translations: deepMergeSimple(translations, incomingConfig.i18n?.translations ?? {}),
      },
    }
  }
