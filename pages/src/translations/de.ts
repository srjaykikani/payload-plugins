import { GenericTranslationsObject } from './index.js'

export const de: GenericTranslationsObject = {
  $schema: './translation-schema.json',
  '@jhb.software/payload-pages-plugin': {
    path: 'Pfad',
    label: 'Beschriftung',
    slug: 'URL-Endung',
    parent: 'Übergeordnete Seite',
    rootPage: 'Startseite',
    alternatePaths: 'Alternative Pfade',
    alternatePath: 'Alternative Pfad',
    breadcrumbs: 'Navigationspfade',
    breadcrumb: 'Navigationspfad',
    saveDocumentToPreview: 'Speichere das Dokument um die Vorschau zu sehen',
    openWebsitePageInPreviewMode: 'Seite der Website im Vorschau-Modus öffnen',
    syncSlugWithX: 'Mit {X} synchronisieren',
    slugWasChangedFromXToY:
      'Die URL-Endung wurde von <code>{X}</code> zu <code>{Y}</code> geändert. Dies erfordert eine manuelle Erstellung einer Umleitung vom alten zum neuen Seitenpfad.',
  },
}
