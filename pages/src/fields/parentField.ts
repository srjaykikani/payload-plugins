import { Field } from 'payload'
import { IncomingPageCollectionConfigAttributes } from '../types/PageCollectionConfigAttributes'

export function parentField(pageConfig: IncomingPageCollectionConfigAttributes): Field {
  return {
    name: pageConfig.parentField!,
    type: 'relationship',
    relationTo: pageConfig.parentCollection,
    required: !pageConfig.isRootCollection,
    // Exclude the current page from the list of available parents:
    filterOptions: ({ data }) => {
      // TODO: find a way to get the current document's collection in the filterOptions function
      // Filter by the document ID here. However, for a postgres database, where the ids
      // are just sequential numbers, this can hide documents with the same ID in a different collection.
      // if(relationTo !== collection) {
      //   return {
      //     id: {
      //       not_equals: id,
      //     },
      //   }
      // }

      // Current temporary solution: filter by slug
      return {
        slug: {
          not_equals: data.slug,
        },
      }
    },
    admin: {
      position: 'sidebar',
      components: {
        Field: '@jhb.software/payload-pages-plugin/client#ParentField',
      },
    },
  }
}
