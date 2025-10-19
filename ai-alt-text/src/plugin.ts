import type { Config, Field } from 'payload'

import type { AltTextPluginConfig } from './types/AltTextPluginConfig'
import { injectBulkGenerateButton } from './fields/injectBulkGenerateButton'

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
      collections: pluginOptions.collections ?? [],
      models: pluginOptions.models ?? ['gpt-4o-mini', 'gpt-4o-2024-08-06'],
      maxConcurrency: pluginOptions.maxConcurrency ?? 16,
      defaultModel: pluginOptions.defaultModel ?? 'gpt-4o-mini',
    }

    // Ensure collections array exists
    config.collections = config.collections || []

    // Map over collections and inject AI alt text fields into specified ones
    config.collections = config.collections.map((collection) => {
      // Check if this collection should have AI alt text fields
      if (pluginConfigWithDefaults.collections.includes(collection.slug)) {
        // Check if it's an upload collection
        if (!collection.upload) {
          console.warn(
            `AI Alt Text Plugin: Collection "${collection.slug}" is not an upload collection. Skipping field injection.`,
          )
          return collection
        }

        // Inject the bulk generate button
        const modifiedCollection = injectBulkGenerateButton(collection)

        // Add AI alt text fields if they don't exist
        const fields: Field[] = modifiedCollection.fields || []

        // Check if context field already exists
        if (!fields.find((field) => 'name' in field && field.name === 'context')) {
          fields.unshift({
            name: 'context',
            label: 'Context',
            type: 'text',
            required: false,
            localized: true,
            admin: {
              description:
                'Details not visible in the image (such as the location or event). Used to enhance AI-generated alt text with additional context.',
            },
          })
        }

        // Check if alt field already exists
        if (!fields.find((field) => 'name' in field && field.name === 'alt')) {
          fields.push({
            name: 'alt',
            label: 'Alternative Text',
            type: 'textarea',
            required: false,
            localized: true,
            validate: (value: any, ctx: any) => {
              // Alt text is required only for existing documents (documents with id)
              if (ctx.id && (!value || value.trim().length === 0)) {
                return 'The alternate text is required'
              }
              return true
            },
            admin: {
              components: {
                Field: {
                  path: '@jhb.software/payload-ai-alt-text-plugin/client',
                  exportName: 'AltTextField',
                  clientProps: {
                    openAIApiKey: pluginConfigWithDefaults.openAIApiKey,
                    defaultModel: pluginConfigWithDefaults.defaultModel,
                    models: pluginConfigWithDefaults.models,
                  },
                },
              },
            },
          })
        }

        // Check if keywords field already exists
        if (!fields.find((field) => 'name' in field && field.name === 'keywords')) {
          fields.push({
            name: 'keywords',
            label: 'Keywords',
            type: 'text',
            hasMany: true,
            required: false,
            localized: true,
            admin: {
              description: 'Keywords describing the image content',
            },
          })
        }

        return {
          ...modifiedCollection,
          fields,
        }
      }

      return collection
    })

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
