import { Field } from 'payload'
import { Locale } from 'src/types/Locale.js'
import { beforeDuplicateSlug } from '../hooks/beforeDuplicate.js'
import { createSlugFromFallbackField } from '../hooks/validateSlug.js'

// Note: make sure this field can be used separately from the PagesCollectionConfig (e.g. a non page collection needs a slug field as well)

export function slugField({
  redirectWarning,
  fallbackField = 'title',
  unique = true,
  staticValue,
}: {
  redirectWarning: boolean
  fallbackField?: string
  unique?: boolean
  staticValue?: string | Record<Locale, string>
}): Field {
  return {
    name: 'slug',
    type: 'text',
    defaultValue: ({ locale }) =>
      typeof staticValue === 'string' ? staticValue : locale && staticValue?.[locale],
    admin: {
      position: 'sidebar',
      readOnly: !!staticValue,
      components: {
        Field: {
          path: '@jhb.software/payload-pages-plugin/client#SlugField',
          clientProps: {
            readOnly: !!staticValue,
            defaultValue: staticValue,
            redirectWarning: redirectWarning,
            fallbackField: fallbackField,
          },
        },
      },
      // The condition option is not used to hide the field when the page is the root page because then the type of the slug field would be optional.
    },
    validate: (
      value: string | null | undefined,
      options: { data: any; siblingData: any; id?: string | number },
    ): string | true => {
      // TODO: reactivate this code when refactoring the virtual field validation, note that this validation should only be applied in pages collections
      // if (options.data.isRootPage) {
      //   if (value !== ROOT_PAGE_SLUG) {
      //     return 'The slug of the root page must be an empty string.'
      //   } else {
      //     return true
      //   }
      // } else {
      //   if (!value) {
      //     return 'The slug is required.'
      //   }
      //   const formattedValue = formatSlug(value)
      //   if (value !== formattedValue) {
      //     return 'The slug is not formatted correctly.'
      //   }
      //   return true
      // }
      return true
    },
    hooks: {
      beforeDuplicate: [beforeDuplicateSlug],
      beforeValidate: [createSlugFromFallbackField(fallbackField)],
    },
    unique: unique,
    index: true,
    localized: true,
    required: true,
  }
}
