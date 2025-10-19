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

    // Store plugin config with defaults in config.custom for access in hooks/actions
    const pluginConfigWithDefaults: Required<AltTextPluginConfig> = {
      enabled: pluginOptions.enabled ?? true,
      models: pluginOptions.models ?? ['gpt-4o-mini', 'gpt-4o-2024-08-06'],
      maxConcurrency: pluginOptions.maxConcurrency ?? 16,
      defaultModel: pluginOptions.defaultModel ?? 'gpt-4o-mini',
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

    return {
      ...config,
      custom: {
        ...config.custom,
        // Make plugin config available in hooks/actions (like pages plugin does)
        aiAltTextPluginConfig: pluginConfigWithDefaults,
      },
    }
  }
