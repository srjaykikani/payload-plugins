import { PayloadRequest, CollectionSlug } from 'payload'
import type { SanitizedCollectionConfig } from 'payload'
import type { PageCollectionConfigAttributes } from '../types/PageCollectionConfigAttributes.js'

// Global request context for accessing Payload instance
let currentRequest: PayloadRequest | null = null

/**
 * Sets the current request context for childDocumentsOf function
 * This should be called from hooks to provide access to Payload instance
 */
export function setRequestContext(req: PayloadRequest): void {
  currentRequest = req
}

/**
 * Returns all documents that reference the given document ID in their parent field.
 * This function checks both self-referencing collections and cross-collection references
 * based on the parentCollection configuration.
 * 
 * Implements the exact specification from the original task:
 * childDocumentsOf(docId: string | number, collectionSlug: CollectionSlug): { id: string | number; collection: CollectionSlug }[]
 * 
 * @param docId - The document ID to find children for
 * @param collectionSlug - The collection slug of the parent document
 * @returns Array of child document references with their IDs and collection slugs
 */
export async function childDocumentsOf(
  docId: string | number,
  collectionSlug: CollectionSlug
): Promise<{ id: string | number; collection: CollectionSlug }[]> {
  if (!currentRequest) {
    throw new Error('Request context not set. Call setRequestContext(req) before using childDocumentsOf.')
  }
  
  const req = currentRequest
  const childReferences: { id: string | number; collection: CollectionSlug }[] = []
  
  // Get all collections from the payload config
  const allCollections = req.payload.config.collections || []
  
  // Find collections that have page configuration and can reference the current collection as parent
  const pageCollections = allCollections.filter(
    isPageCollectionWithParent(collectionSlug)
  )
  
  // Check each relevant collection for child documents
  for (const targetCollection of pageCollections) {
    const parentFieldName = targetCollection.page.parent.name || 'parent'
    
    // Note: Multi-tenant baseFilter support removed per exact specification
    
    try {
      // Find all documents in this collection that reference the given docId as parent
      const childDocuments = await req.payload.find({
        collection: targetCollection.slug,
        where: {
          [parentFieldName]: { equals: docId }
        },
        depth: 0, // Only get IDs of related documents
        select: {},
        limit: 0,
      })
      
      // Add found documents to the results
      for (const doc of childDocuments.docs) {
        childReferences.push({
          id: doc.id,
          collection: targetCollection.slug,
        })
      }
    } catch (error) {
      // Log error but continue checking other collections
      console.warn(`Error checking collection ${targetCollection.slug} for child documents:`, error)
    }
  }
  
  return childReferences
}

/**
 * Checks if a document has any child documents referencing it as parent.
 * This is a convenience function that returns a boolean instead of the full list.
 * 
 * @param docId - The document ID to check
 * @param collectionSlug - The collection slug of the parent document
 * @returns True if the document has child references, false otherwise
 */
export async function hasChildDocuments(
  docId: string | number,
  collectionSlug: CollectionSlug
): Promise<boolean> {
  const children = await childDocumentsOf(docId, collectionSlug)
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