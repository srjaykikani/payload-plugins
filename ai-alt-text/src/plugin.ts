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

    // Validate required config
    if (!pluginOptions.openAIApiKey) {
      throw new Error('OpenAI API key is required for the AI alt text plugin')
    }

    // Store plugin config with defaults in config.custom for access in hooks/actions
    const pluginConfigWithDefaults = {
      enabled: pluginOptions.enabled ?? true,
      openAIApiKey: pluginOptions.openAIApiKey!,
      models: pluginOptions.models ?? ['gpt-4o-mini', 'gpt-4o-2024-08-06'],
      maxConcurrency: pluginOptions.maxConcurrency ?? 16,
      defaultModel: pluginOptions.defaultModel ?? 'gpt-4o-mini',
    }

    config.onInit = async (payload) => {
      if (incomingConfig.onInit) {
        await incomingConfig.onInit(payload)
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
