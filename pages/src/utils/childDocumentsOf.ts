import { PayloadRequest, CollectionSlug } from 'payload'
import type { SanitizedCollectionConfig } from 'payload'
import type { PageCollectionConfigAttributes } from '../types/PageCollectionConfigAttributes.js'
import type { PagesPluginConfig } from '../types/PagesPluginConfig.js'

/**
 * Finds all child documents that reference a given parent document.
 * Used by preventParentDeletion hook to prevent broken references.
 */
async function childDocumentsOfInternal(
  req: PayloadRequest,
  docId: string | number,
  collectionSlug: CollectionSlug,
  baseFilter?: PagesPluginConfig['baseFilter']
): Promise<{ id: string | number; collection: CollectionSlug }[]> {
  const childReferences: { id: string | number; collection: CollectionSlug }[] = []
  
  const allCollections = req.payload.config.collections || []
  
  const pageCollections = allCollections.filter(
    isPageCollectionWithParent(collectionSlug)
  )
  
  for (const targetCollection of pageCollections) {
    const parentFieldName = targetCollection.page.parent.name || 'parent'
    
    const baseFilterWhere = typeof baseFilter === 'function' 
      ? baseFilter({ req }) 
      : undefined
    
    try {
      const childDocuments = await req.payload.find({
        collection: targetCollection.slug,
        where: {
          and: [
            { [parentFieldName]: { equals: docId } },
            ...(baseFilterWhere ? [baseFilterWhere] : []),
          ],
        },
        depth: 0,
        select: {},
        limit: 0,
      })
      
      for (const doc of childDocuments.docs) {
        childReferences.push({
          id: doc.id,
          collection: targetCollection.slug,
        })
      }
    } catch (error) {
      console.warn(`Error checking collection ${targetCollection.slug} for child documents:`, error)
    }
  }
  
  return childReferences
}

/**
 * Finds all child documents that reference a given parent document.
 * Used by preventParentDeletion hook to prevent broken references.
 */
export const childDocumentsOf = childDocumentsOfInternal

/**
 * Check if a document has any child references
 */
export async function hasChildDocuments(
  req: PayloadRequest,
  docId: string | number,
  collectionSlug: CollectionSlug,
  baseFilter?: PagesPluginConfig['baseFilter']
): Promise<boolean> {
  const children = await childDocumentsOf(req, docId, collectionSlug, baseFilter)
  return children.length > 0
}

function isPageCollectionWithParent(expectedParent: CollectionSlug) {
  return (
    col: SanitizedCollectionConfig
  ): col is SanitizedCollectionConfig & { page: PageCollectionConfigAttributes } => {
    if (!('page' in col)) return false
    const p = (col as unknown as { page?: unknown }).page
    if (!p || typeof p !== 'object') return false
    const parent = (p as { parent?: { collection?: unknown } }).parent
    return !!parent && parent.collection === expectedParent
  }
}