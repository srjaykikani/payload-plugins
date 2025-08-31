import { CollectionBeforeDeleteHook } from 'payload'
import { asPageCollectionConfigOrThrow } from '../collections/PageCollectionConfig.js'
import { childDocumentsOf, setRequestContext } from '../utils/childDocumentsOf.js'

/**
 * Database adapter types that require custom parent deletion prevention logic.
 * These adapters don't enforce foreign key constraints at the database level for Payload relationship fields.
 */
const ADAPTERS_REQUIRING_CUSTOM_LOGIC = [
  '@payloadcms/db-mongodb',
  '@payloadcms/db-sqlite',
  '@payloadcms/db-postgres'
]

/**
 * Prevents deletion of page documents that are referenced as parents by other documents.
 * This hook applies to MongoDB, SQLite, and PostgreSQL environments as these adapters
 * don't enforce foreign key constraints at the database level for Payload relationship fields.
 * 
 * @throws {Error} When attempting to delete a document that has child dependencies
 */
export const preventParentDeletion: CollectionBeforeDeleteHook = async ({
  req,
  id,
  collection,
}) => {
  // Only apply this protection for adapters that require custom logic
  const databaseAdapter = req.payload.db.packageName || req.payload.db.name
  if (!ADAPTERS_REQUIRING_CUSTOM_LOGIC.includes(databaseAdapter)) {
    return
  }

  const pageConfig = asPageCollectionConfigOrThrow(collection)
  
  // Set request context for childDocumentsOf function
  setRequestContext(req)
  
  // Use the helper function to find all child documents
  // Matches exact specification: childDocumentsOf(docId, collectionSlug)
  const childDocuments = await childDocumentsOf(id, collection.slug)

  if (childDocuments.length > 0) {
    // Group children by collection for better error messaging
    const childrenByCollection = childDocuments.reduce((acc, child) => {
      if (!acc[child.collection]) {
        acc[child.collection] = []
      }
      acc[child.collection].push(child.id)
      return acc
    }, {} as Record<string, (string | number)[]>)

    // Create a descriptive error message
    const collectionMessages = Object.entries(childrenByCollection)
      .map(([collectionSlug, ids]) => 
        `${ids.length} document(s) in the "${collectionSlug}" collection`
      )
      .join(', ')

    const errorMessage = `Cannot delete this document because it is referenced as a parent by ${collectionMessages}. Please remove or reassign the child documents before deleting this parent document.`
    
    throw new Error(errorMessage)
  }
}