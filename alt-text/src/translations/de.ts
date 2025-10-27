import { GenericTranslationsObject } from './index.js'

export const de: GenericTranslationsObject = {
  $schema: './translation-schema.json',
  '@jhb.software/payload-alt-text-plugin': {
    // Field labels
    alternateText: 'Alternativtext',
    keywords: 'Schlüsselwörter',
    keywordsDescription:
      'Schlüsselwörter, die das Bild beschreiben. Wird bei der Suche nach dem Bild verwendet.',

    // Button labels
    generateAltText: 'Alternativtext generieren',
    generateAltTextFor: 'Alternativtext generieren für',
    image: 'Bild',
    images: 'Bilder',

    // Toast messages
    cannotGenerateMissingFields:
      'Alternativtext kann nicht generiert werden. Erforderliche Felder fehlen.',
    failedToGenerate:
      'Generierung des Alternativtextes fehlgeschlagen. Bitte versuchen Sie es erneut.',
    altTextGeneratedSuccess:
      'Alternativtext erfolgreich generiert. Bitte überprüfen und speichern Sie das Dokument.',
    noAltTextGenerated: 'Kein Alternativtext generiert. Bitte versuchen Sie es erneut.',
    errorGeneratingAltText:
      'Fehler beim Generieren des Alternativtextes. Bitte versuchen Sie es erneut.',
    failedToGenerateForXImages: 'Generierung des Alternativtextes für {X} Bilder fehlgeschlagen.',
    xOfYImagesUpdated: '{X} von {Y} Bildern aktualisiert.',

    // Help text
    altTextDescription:
      'Alternativtext für das Bild. Dieser wird für Screenreader und SEO verwendet. Er sollte die folgenden Anforderungen erfüllen:',
    altTextRequirement1: 'Beschreiben Sie kurz, was auf dem Bild zu sehen ist, in 1–2 Sätzen.',
    altTextRequirement2:
      'Stellen Sie sicher, dass er möglichst die gleichen Informationen oder den gleichen Zweck wie das Bild vermittelt.',
    altTextRequirement3:
      'Vermeiden Sie Phrasen wie "Bild von" oder "Foto von" — Screenreader kündigen bereits an, dass es sich um ein Bild handelt.',

    // Tooltips
    pleaseSaveDocumentFirst: 'Bitte speichern Sie zuerst das Dokument',
  },
}
