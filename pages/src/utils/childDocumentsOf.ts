import { PayloadRequest, CollectionSlug } from 'payload'
import { PagesPluginConfig } from '../types/PagesPluginConfig.js'

/**
 * Result type for child document references
 */
export interface ChildDocumentReference {
  id: string | number
  collection: CollectionSlug
}

/**
 * Returns all documents that reference the given document ID in their parent field.
 * This function checks both self-referencing collections and cross-collection references
 * based on the parentCollection configuration.
 * 
 * @param req - Payload request object
 * @param docId - The document ID to find children for
 * @param collectionSlug - The collection slug of the parent document
 * @param baseFilter - Optional base filter function for multi-tenant scenarios
 * @returns Array of child document references with their IDs and collection slugs
 */
export async function childDocumentsOf(
  req: PayloadRequest,
  docId: string | number,
  collectionSlug: CollectionSlug,
  baseFilter?: PagesPluginConfig['baseFilter']
): Promise<ChildDocumentReference[]> {
  const childReferences: ChildDocumentReference[] = []
  
  // Get all collections from the payload config
  const allCollections = req.payload.config.collections || []
  
  // Find collections that have page configuration and can reference the current collection as parent
  const pageCollections = allCollections.filter(col => {
    if (!('page' in col) || !col.page || typeof col.page !== 'object') {
      return false
    }
    
    const pageConfig = col.page as any
    const parentCollectionSlug = pageConfig.parent?.collection
    
    // Include if this collection can use the current collection as parent
    return parentCollectionSlug === collectionSlug
  })
  
  // Check each relevant collection for child documents
  for (const targetCollection of pageCollections) {
    const pageConfig = targetCollection.page as any
    const parentFieldName = pageConfig.parent?.name || 'parent'
    
    // Build the base filter for multi-tenant scenarios
    const baseFilterWhere = typeof baseFilter === 'function' 
      ? baseFilter({ req }) 
      : undefined
    
    try {
      // Find all documents in this collection that reference the given docId as parent
      const childDocuments = await req.payload.find({
        collection: targetCollection.slug,
        where: {
          and: [
            { [parentFieldName]: { equals: docId } },
            ...(baseFilterWhere ? [baseFilterWhere] : []),
          ],
        },
        depth: 0, // Only get IDs, no need for full document data
        limit: 1000, // Set a reasonable limit to prevent memory issues
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
 * @param req - Payload request object
 * @param docId - The document ID to check
 * @param collectionSlug - The collection slug of the parent document
 * @param baseFilter - Optional base filter function for multi-tenant scenarios
 * @returns True if the document has child references, false otherwise
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