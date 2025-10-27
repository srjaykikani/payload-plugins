import { useTranslation } from '@payloadcms/ui'
import { PluginAltTextTranslationKeys } from 'src/translations/index.js'
import { PluginAltTextTranslations } from 'src/translations/index.js'

/** Hook which returns a translation function for the plugin translations. */
export const usePluginTranslation = () => {
  const { i18n } = useTranslation<PluginAltTextTranslations, PluginAltTextTranslationKeys>()
  const pluginTranslations = i18n.translations[
    '@jhb.software/payload-alt-text-plugin'
  ] as PluginAltTextTranslations

  return {
    t: (key: PluginAltTextTranslationKeys) => {
      const translation = pluginTranslations[key] as string

      if (!translation) {
        console.log('Plugin translation not found', key)
      }
      return translation ?? key
    },
  }
}
