import type { PayloadRequest, SanitizedConfig } from 'payload'
import type { AltTextPluginConfig } from '../types/AltTextPluginConfig.js'

/** Returns the locale string (or undefined) from the PayloadRequest. */
export function localeFromRequest(req: PayloadRequest): string | 'all' | undefined {
  // When using the REST API, the locale query param can be set to undefined, in this case it is a string 'undefined'
  // In this case, convert it to an undefined value
  if (typeof req.locale === 'string' && req.locale === 'undefined') {
    return undefined
  }

  return req.locale as string | 'all' | undefined
}

/** Returns the locales from the request. Returns undefined when localization is disabled. */
export function localesFromRequest(req: PayloadRequest): string[] | undefined {
  if (typeof req?.payload.config.localization === 'object' && req?.payload.config.localization) {
    return req.payload.config.localization.localeCodes
  } else {
    return undefined
  }
}

/**
 * Determines the target locale for alt text generation.
 * For localized setups: uses req.locale or defaults to defaultLocale
 * For non-localized setups: uses pluginConfig.locale (required)
 */
export function getTargetLocale(
  config: SanitizedConfig,
  pluginConfig: AltTextPluginConfig,
  req?: PayloadRequest,
): string {
  const locales = req
    ? localesFromRequest(req)
    : config.localization
      ? config.localization.localeCodes
      : undefined

  if (locales) {
    // LOCALIZED MODE: Use req.locale or defaultLocale
    const locale = req ? localeFromRequest(req) : undefined

    if (locale && locale !== 'all') {
      return locale
    }

    // Fallback to defaultLocale
    if (config.localization && config.localization.defaultLocale) {
      return config.localization.defaultLocale
    }

    throw new Error(
      'Localization is enabled but no defaultLocale is configured. ' +
        'Please set config.localization.defaultLocale.',
    )
  } else {
    // NON-LOCALIZED MODE: Use options.locale
    if (!pluginConfig.locale) {
      throw new Error(
        'The alt-text plugin requires a "locale" option when Payload localization is disabled. ' +
          'Please add { locale: "en" } (or your preferred locale) to your plugin configuration.\n\n' +
          'Example:\n' +
          'payloadAltTextPlugin({\n' +
          '  collections: ["media"],\n' +
          '  locale: "en",  // <- Add this\n' +
          '  // ... other options\n' +
          '})',
      )
    }

    return pluginConfig.locale
  }
}
