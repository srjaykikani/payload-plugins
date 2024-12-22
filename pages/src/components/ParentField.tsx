'use client'
import { RelationshipField, useDocumentInfo, useField } from '@payloadcms/ui'
import { RelationshipFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'
import { fetchRestApi } from '../utils/fetchRestApi'
import { usePageCollectionConfigAttributes } from './hooks/usePageCollectionConfigAtrributes'

// TODO: migrate this component to be a server component which useses the local api to fetch the shared parent document

/**
 * Parent field which (depending on the config) sets its value automatically to the shared parent document if one exists and locks the field.
 */
export const ParentField: RelationshipFieldClientComponent = ({ field, path }) => {
  const { collectionSlug } = useDocumentInfo()
  const { sharedParentDocument, parentField } = usePageCollectionConfigAttributes()

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
      // find any other document which has a parent and take its parent value
      const response = await fetchRestApi(`/${collectionSlug}`, {
        limit: 1,
        draft: true,
        where: {
          [parentField]: {
            not_equals: null,
          },
        },
        select: {
          [parentField]: true,
        },
      })
      const parentValue = response.docs.at(0)?.[parentField] ?? null

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
