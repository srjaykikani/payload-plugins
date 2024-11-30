'use client'

import { RelationshipField, useConfig, useDocumentInfo, useField } from '@payloadcms/ui'
import { RelationshipFieldClientComponent, SanitizedCollectionConfig } from 'payload'
import { useEffect, useState } from 'react'
import { asPageCollectionConfigOrThrow } from '../collections/PageCollectionConfig'

// TODO: migrate this component to be a server component which useses the local api to fetch the shared parent document

/**
 * Parent field which (depending on the config) sets its value automatically to the shared parent document if one exists and locks the field.
 */
export const ParentField: RelationshipFieldClientComponent = ({ field, path }) => {
  const { collectionSlug } = useDocumentInfo()
  const {
    config: { collections },
  } = useConfig()

  // TODO: find a solution without using the unknown type, pass fallbackSlug directly to this component instead?
  const collection = collections.find(
    (c) => c.slug === collectionSlug,
  ) as unknown as SanitizedCollectionConfig
  const { sharedParentDocument: sharedParentDocumentRaw } =
    asPageCollectionConfigOrThrow(collection).page
  const sharedParentDocument = sharedParentDocumentRaw!

  const { value, setValue } = useField<string>({ path: path! })
  const [readOnly, setReadOnly] = useState(sharedParentDocument)

  useEffect(() => {
    onInit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onInit() {
    // Only fetch if field has no value, which means that this either
    // 1. is the first item in the collection, then getCollectionWideParent() will return null
    // 2. is a new item, then getCollectionWideParent() will return the shared parent value
    if (sharedParentDocument && !value) {
      const parentValue = await getSharedParentDocument({ collection: collectionSlug! })

      if (parentValue) {
        setValue(parentValue)
        setReadOnly(true)
      } else {
        // When the collection is empty and this is the first document being created, the parent field must be editable
        setReadOnly(false)
      }
    }
  }

  return <RelationshipField path={path} field={field} readOnly={readOnly} />
}

/**  Fetches the shared parent document value */
async function getSharedParentDocument({
  collection,
}: {
  collection: string
}): Promise<string | null> {
  let collectionSlugCapitalized = collection.charAt(0).toUpperCase() + collection.slice(1)
  if (collectionSlugCapitalized.includes('-')) {
    // replace the hypen and capitalize the letter after it
    collectionSlugCapitalized = collectionSlugCapitalized.replace(/-./g, (match) =>
      match.charAt(1).toUpperCase(),
    )
  }

  try {
    const query = /* GraphQL */ `
      query Data {
        ${collectionSlugCapitalized}(limit: 1, draft: true, where: { parent: { not_equals: null } }) {
          docs {
            id
            parent {
              id
            }
          }
        }
      }
    `

    const response = await fetch(`/api/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    const json = await response.json()
    const doc = json.data[collectionSlugCapitalized].docs.at(0)

    return doc?.parent?.id
  } catch (error) {
    console.error('Error fetching the parent ID of other docs in this collection. ', error)
    return null
  }
}
