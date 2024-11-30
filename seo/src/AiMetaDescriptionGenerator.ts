import { GenerateDescription } from '@payloadcms/plugin-seo/types'
import { CollectionConfig } from 'payload'
import { generateMetaDescription } from './generateMetaDescription'
import { CollectionDocContentTransformer } from './types/CollectionDocContentTransformer'
import { WebsiteContext } from './types/WebsiteContext'

export class AiMetaDescriptionGenerator {
  private collectionContentTransformer: Record<string, CollectionDocContentTransformer>
  private websiteContext: WebsiteContext

  constructor({
    collectionContentTransformer,
    websiteContext,
  }: {
    openAIKey: string
    collectionContentTransformer: Record<string, CollectionDocContentTransformer>
    websiteContext: WebsiteContext
  }) {
    this.collectionContentTransformer = collectionContentTransformer
    this.websiteContext = websiteContext
  }

  private async transformDocContent(doc: any, collection: string): Promise<Record<string, any>> {
    const transformer = this.collectionContentTransformer[collection]

    if (!transformer) {
      throw new Error(`No transformer found for collection ${collection}`)
    }

    return transformer(doc)
  }

  public generateDescription: GenerateDescription = async ({
    doc,
    collectionConfig,
    locale,
  }: {
    doc: any
    collectionConfig?: CollectionConfig | undefined
    locale?: string | undefined
  }) => {
    if (!doc || !collectionConfig || !locale) {
      throw new Error('No doc or collectionConfig or locale provided')
    }

    const content = await this.transformDocContent(doc, collectionConfig.slug)

    const keywords = doc.meta.keywords?.map(
      (keywordArrayItem: { keyword: string }) => keywordArrayItem.keyword,
    )

    return await generateMetaDescription({
      pageContext: {
        type: collectionConfig.slug,
        title: doc.title,
        keywords: keywords,
      },
      websiteContext: this.websiteContext,
      content: JSON.stringify(content),
      locale,
    })
  }
}
