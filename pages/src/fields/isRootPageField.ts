import { Field } from 'payload'
import { translatedLabel } from '../utils/translatedLabel.js'
import { beforeDuplicateIsRootPage } from '../hooks/beforeDuplicate.js'
import { PagesPluginConfig } from '../types/PagesPluginConfig.js'

export function isRootPageField({
  baseFilter,
}: {
  baseFilter: PagesPluginConfig['baseFilter']
}): Field {
  return {
    name: 'isRootPage',
    label: translatedLabel('isRootPage'),
    type: 'checkbox',
    admin: {
      position: 'sidebar',
      components: {
        Field: {
          path: '@jhb.software/payload-pages-plugin/server#IsRootPageField',
          serverProps: {
            baseFilter,
          },
        },
      },
    },
    hooks: {
      beforeDuplicate: [beforeDuplicateIsRootPage],
    },
  }
}
