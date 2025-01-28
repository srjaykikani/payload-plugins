import { createPageCollectionConfig } from '@jhb.software/payload-pages-plugin'
import { CollectionConfig } from 'payload'

export const CountryTravelTips: CollectionConfig = createPageCollectionConfig({
  slug: 'country-travel-tips',
  admin: {
    useAsTitle: 'title',
  },
  page: {
    parentCollection: 'countries',
    parentField: 'country',
    slug: {
      unique: false,
      staticValue: {
        de: 'reisetipps',
        en: 'travel-tips',
      },
    },
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      localized: true,
    },
  ],
})
