import { SEOPluginConfig as PayloadSeoPluginConfig } from '@payloadcms/plugin-seo/types'
import { CollectionSlug } from 'payload'
import { DocumentContentTransformer } from './DocumentContentTransformer'
import { WebsiteContext } from './WebsiteContext'

/** Configuration options for the seo plugin (Extends the official seo plugin config). */
export type SeoPluginConfig = {
  /** Whether the seo plugin is enabled. */
  enabled?: boolean

  /** Contextual information about the website which is added to the meta description generation prompt. */
  websiteContext: WebsiteContext

  /** A map of transformers which transform the raw document into a structured object used to generate the meta description. */
  documentContentTransformers: Partial<Record<CollectionSlug, DocumentContentTransformer>>

  /** The OpenAI LLM model to use for meta description generation (e.g. 'gpt-4o'). */
  llmModel?: string
} & PayloadSeoPluginConfig
