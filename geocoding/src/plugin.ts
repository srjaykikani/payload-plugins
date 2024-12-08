import type { Config } from 'payload'

import type { GeocodingPluginConfig } from './types/GeoCodingPluginConfig'

/** Payload plugin which extends the point field with geocoding functionality. */
export const payloadGeocodingPlugin =
  (pluginOptions: GeocodingPluginConfig) =>
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

      const neededEnvVars = ['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY']

      const missingEnvVars = neededEnvVars.filter((envVar) => !process.env[envVar])
      if (missingEnvVars.length > 0) {
        throw new Error(
          `The following environment variables are required for the geocoding plugin but not defined: ${missingEnvVars.join(
            ', ',
          )}`,
        )
      }
    }

    return config
  }
