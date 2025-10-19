/** Configuration options for the AI alt text plugin. */
export type AltTextPluginConfig = {
  /** Whether the AI alt text plugin is enabled. */
  enabled?: boolean

  /** OpenAI API key for authentication. Required when enabled is true. */
  openAIApiKey?: string

  /** Collection slugs to enable AI alt text generation for. */
  collections?: string[]

  /** Available models for alt text generation. */
  models?: Array<'gpt-4o-mini' | 'gpt-4o-2024-08-06'>

  /** Maximum number of concurrent API requests for bulk operations. */
  maxConcurrency?: number

  /** Default model to use for generation. */
  defaultModel?: 'gpt-4o-mini' | 'gpt-4o-2024-08-06'
}
