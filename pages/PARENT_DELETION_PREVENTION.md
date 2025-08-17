# Parent Deletion Prevention Implementation

## Overview

This document describes the implementation of a mechanism to prevent the deletion of page documents that are referenced as parents by other documents, designed for MongoDB, SQLite, and PostgreSQL environments.

## Problem Statement

When using MongoDB, SQLite, or PostgreSQL as database adapters, Payload CMS does not enforce foreign key constraints at the database level for relationship fields. This can lead to orphaned child documents when a parent document is deleted, causing exceptions and data integrity issues.

## Solution

### Implementation Details

The solution consists of a `beforeDelete` hook that:

1. **Database Adapter Detection**: Only applies to MongoDB, SQLite, and PostgreSQL environments (`@payloadcms/db-mongodb`, `@payloadcms/db-sqlite`, `@payloadcms/db-postgres`)
2. **Reference Checking**: Scans all page collections to find documents that reference the document being deleted
3. **Multi-tenant Support**: Respects `baseFilter` configurations for multi-tenant scenarios
4. **Efficient Queries**: Uses `count` operations instead of full document retrieval for performance
5. **Clear Error Messages**: Provides descriptive error messages indicating which collections have dependencies

### Files Created/Modified

#### New Files
- `src/hooks/preventParentDeletion.ts` - Main hook implementation
- `src/hooks/__tests__/preventParentDeletion.test.ts` - Unit tests
- `PARENT_DELETION_PREVENTION.md` - This documentation

#### Modified Files
- `src/collections/PageCollectionConfig.ts` - Integrated the hook into page collections

### Hook Implementation

```typescript
export const preventParentDeletion: CollectionBeforeDeleteHook = async ({
  req,
  id,
  collection,
}) => {
  // Only apply this protection for adapters requiring custom logic
  const databaseAdapter = req.payload.db.name
  if (!ADAPTERS_REQUIRING_CUSTOM_LOGIC.includes(databaseAdapter)) {
    return
  }

  // Check all page collections for references to the document being deleted
  // Throw error if dependencies are found
}
```

### Key Features

1. **Adapter-Specific**: Only activates for MongoDB, SQLite, and PostgreSQL adapters that require custom deletion prevention logic
2. **Cross-Collection Support**: Checks all configured page collections for parent references
3. **Performance Optimized**: Uses count queries instead of fetching full documents
4. **Multi-tenant Aware**: Respects baseFilter configurations
5. **Descriptive Errors**: Provides clear error messages with dependency counts

## Testing

### Test Coverage

The implementation includes comprehensive unit tests covering:

- ✅ Allows deletion when no child documents exist
- ✅ Prevents deletion when child documents exist
- ✅ Skips check for adapters that don't require custom logic
- ✅ Handles multi-tenant scenarios with baseFilter
- ✅ Provides descriptive error messages

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test preventParentDeletion.test.ts
```

## Usage

The hook is automatically applied to all page collections configured through the plugin. No additional configuration is required.

### Error Example

When attempting to delete a document with child dependencies:

```
Error: Cannot delete this document because it is referenced as a parent by 3 document(s) in the "pages" collection. Please remove or reassign the child documents before deleting this parent document.
```

## SQL Database Behavior

For SQL databases (PostgreSQL, SQLite), this hook is automatically bypassed as these databases handle referential integrity through foreign key constraints at the database level.

## Future Enhancements

1. **Cascade Options**: Add configuration for cascade delete behavior
2. **Bulk Operations**: Extend support for bulk delete operations
3. **Custom Error Messages**: Allow customization of error messages per collection
4. **Performance Monitoring**: Add metrics for hook execution time

## Migration Guide

Existing projects using this plugin will automatically benefit from this protection once updated. No migration steps are required.

## Troubleshooting

### Common Issues

1. **Hook Not Triggering**: Ensure you're using a MongoDB, SQLite, or PostgreSQL adapter
2. **Performance Issues**: Consider adding database indexes on parent fields for large collections
3. **Multi-tenant Issues**: Verify baseFilter configuration is correct

### Debug Mode

To enable debug logging, set the environment variable:
```bash
DEBUG=payload:pages-plugin
```