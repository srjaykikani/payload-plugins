import type { Config } from 'payload'

import type { GeocodingPluginConfig } from './types/GeoCodingPluginConfig'

/**
 * Payload plugin which extends the point field with geocoding functionality.
 *
 * The plugin stores the Google Maps API key in config.custom, allowing the
 * server component wrapper to access it when rendering geocoding fields.
 */
export const payloadGeocodingPlugin =
  (pluginOptions: GeocodingPluginConfig) =>
  (incomingConfig: Config): Config => {
    // If the plugin is disabled, return the config without modifying it
    if (pluginOptions.enabled === false) {
      return incomingConfig
    }

    // Store API key in config.custom for server component access
    const config: Config = {
      ...incomingConfig,
      custom: {
        ...incomingConfig.custom,
        payloadGeocodingPlugin: {
          googleMapsApiKey: pluginOptions.googleMapsApiKey,
        },
      },
    }

    return config
  }
