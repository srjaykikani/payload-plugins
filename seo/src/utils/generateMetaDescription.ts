import { GenerateDescription } from '@payloadcms/plugin-seo/types'
import OpenAI from 'openai'
import { Config, SanitizedConfig } from 'payload'
import { PageContext } from '../types/PageContext'
import { SeoPluginConfig } from '../types/SeoPluginConfig'
import { generateOpenAIChatCompletion } from './generateOpenAIChatCompletion'
import { lexicalToPlainText } from './lexicalToPlainText'

/** Wrapper function which returns the generateMetaDescription function which can be passed to the official seo plugin. */
export const getGenerateMetaDescription = (
  pluginConfig: SeoPluginConfig,
  payloadConfig: Config,
) => {
  const generateMetaDescription: GenerateDescription = async ({ doc, locale, collectionSlug }) => {
    if (!collectionSlug) {
      throw new Error('Collection slug is required')
    }

    const transformerFunction = pluginConfig.documentContentTransformers[collectionSlug]

    if (!transformerFunction) {
      throw new Error(
        `No document content transformer found for collection slug: ${collectionSlug}`,
      )
    }

    // TODO: Sanitize the payload config and pass it to lexicalToPlainText
    // const sanitizedPayloadConfig = await sanitizeConfig(payloadConfig)

    const content = await transformerFunction(doc, (field: any) =>
      lexicalToPlainText(field, {} as SanitizedConfig),
    )

    const pageContext: PageContext = {
      title: doc?.title,
      type: collectionSlug,
      keywords: doc?.meta?.keywords?.map(
        (keywordArrayItem: { keyword: string }) => keywordArrayItem.keyword,
      ),
    }

    // the real max value is 150, but this leaves a bit more room for the inaccuracies of the LLM
    const lengthLimit = 140

    const body: OpenAI.Chat.ChatCompletionCreateParams = {
      model: pluginConfig.llmModel ?? 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
        Du bist ein SEO-Experte. Erstelle eine SEO-optimierte Meta-Beschreibung unter Berücksichtigung der folgenden Informationen:
  
        **Website Context**: 
        - Website Topic: ${pluginConfig.websiteContext.topic}
        
        **Page Context**:
        - Page Title: ${pageContext.title}
        - Page Type: ${pageContext.type}
        - Focus Keyword: ${pageContext.keywords?.at(0) ?? 'N/A'}
        - Page Keywords: ${pageContext.keywords ? pageContext.keywords.slice(1).join(', ') : 'N/A'}
        
        **Richtlinien**:
        
        - Schreibe eine prägnante und ansprechende Zusammenfassung des Seiteninhalts.
        - Die Beschreibung soll den Nutzer anregen, die Seite zu besuchen.
        - Das Focus Keyword muss in der Beschreibung enthalten sein.
        - Integriere die Keywords wenn möglich natürlich in den Text.
        - Behalte einen professionellen und informativen Ton bei. Verwende eine neutrale Sprache.
        - Vermeide direkte Ansprachen wie "Entdecken Sie" oder "Erfahren Sie".
        - Halte die Länge auf maximal ${lengthLimit} Zeichen.
        - Schreibe in der Sprache, die durch den ISO-2-Code "${locale}" angegeben ist.

        WICHTIG: Nimm dein Ergebnis und zähle die verwendeten Zeichen (inkl. Leerzeichen). Falls die Beschreibung mehr als ${lengthLimit} Zeichen beträgt, passe die Beschreibung an, sodass alle Richtlinien erfüllt sind.
        Gebe die Anzahl der Zeichen nicht mit aus.
        
        Der Seiteninhalt wird im nächsten Schritt bereitgestellt.`,
        },
        {
          role: 'user',
          content: JSON.stringify(content),
        },
      ],
      max_completion_tokens: 100,
    }

    const result = await generateOpenAIChatCompletion(body)

    if (!result) {
      throw new Error('No description generated')
    }

    // Remove any quotes that OpenAI might have added around the description
    return result.trim().replace(/^["']|["']$/g, '')
  }

  return generateMetaDescription
}
