/** Configuration options for the AI alt text plugin. */
export type AltTextPluginConfig = {
  enabled?: boolean
  models?: Array<'gpt-4o-mini' | 'gpt-4o-2024-08-06'>
  maxConcurrency?: number
  defaultModel?: 'gpt-4o-mini' | 'gpt-4o-2024-08-06'
}
