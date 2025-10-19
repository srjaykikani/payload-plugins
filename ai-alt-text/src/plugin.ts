import type { Config } from 'payload'

import type { AltTextPluginConfig } from './types/AltTextPluginConfig'

/** Payload plugin which adds AI-powered alt text generation to upload collections. */
export const payloadAiAltTextPlugin =
  (pluginOptions: AltTextPluginConfig = {}) =>
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

      const neededEnvVars = ['OPENAI_API_KEY']

      const missingEnvVars = neededEnvVars.filter((envVar) => !process.env[envVar])
      if (missingEnvVars.length > 0) {
        throw new Error(
          `The following environment variables are required for the AI alt text plugin but not defined: ${missingEnvVars.join(
            ', ',
          )}`,
        )
      }
    }

    return config
  }
