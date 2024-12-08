import type { Config } from 'payload'

import type { SeoPluginConfig } from './types/SeoPluginConfig'

/** Payload plugin which integrates additional seo capabilities to pages documents. */
export const payloadSeoPlugin =
  (pluginOptions: SeoPluginConfig) =>
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

      // TODO: check if payloads seo plugin is installed, if not throw an error

      const neededEnvVars = ['OPENAI_API_KEY']

      const missingEnvVars = neededEnvVars.filter((envVar) => !process.env[envVar])
      if (missingEnvVars.length > 0) {
        throw new Error(
          `The following environment variables are required for the seo plugin but not defined: ${missingEnvVars.join(
            ', ',
          )}`,
        )
      }
    }

    return config
  }
