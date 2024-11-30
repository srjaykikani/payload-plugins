import { Field } from 'payload'

/** A keywords field which is necessary for the plugin to generate a meta description. */
export const keywordsField = (): Field => ({
  name: 'keywords',
  admin: {
    description:
      'Keywords that indicate what the page is about. These are used for generating the meta description.',
    components: {
      Label: '@jhb.software/payload-seo-plugin/client#KeywordsFieldLabel',
      RowLabel: '@jhb.software/payload-seo-plugin/client#KeywordsFieldRowLabel',
    },
    initCollapsed: true,
  },
  label: {
    de: 'Schlagwörter',
    en: 'Keywords',
  },
  type: 'array',
  required: true,
  localized: true,
  minRows: 1,
  maxRows: 5,
  fields: [
    {
      name: 'keyword',
      type: 'text',
      required: true,
      localized: true,
      maxLength: 100,
      // do not show a label as the array label already includes the label
      label: '',
    },
  ],
})
