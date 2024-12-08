import type { Config } from 'payload'

import type { CloudinaryPluginConfig } from './types/CloudinaryPluginConfig'

/** Payload plugin which integrates cloudinary for hosting media collection items. */
export const payloadCloudinaryPlugin =
  (pluginOptions: CloudinaryPluginConfig) =>
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

      const neededEnvVars = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'CLOUDINARY_FOLDER',
      ]

      const missingEnvVars = neededEnvVars.filter((envVar) => !process.env[envVar])
      if (missingEnvVars.length > 0) {
        throw new Error(
          `The following environment variables are required for the cloudinary plugin but not defined: ${missingEnvVars.join(
            ', ',
          )}`,
        )
      }
    }

    return config
  }
