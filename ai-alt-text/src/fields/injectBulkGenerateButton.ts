import type { CollectionConfig } from 'payload'

export function injectBulkGenerateButton(
  collectionConfig: CollectionConfig,
): CollectionConfig {
  return {
    ...collectionConfig,
    admin: {
      ...collectionConfig.admin,
      components: {
        ...(collectionConfig.admin?.components ?? {}),
        beforeListTable: [
          ...(collectionConfig.admin?.components?.beforeListTable ?? []),
          '@jhb.software/payload-ai-alt-text-plugin/client#BulkUpdateAltTextsButton',
        ],
      },
    },
  }
}
