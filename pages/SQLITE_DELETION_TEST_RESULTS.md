# SQLite Adapter Deletion Behavior Test Results

## Test Overview
This document reports the findings from testing Payload CMS's native behavior with SQLite adapter regarding document deletion when referenced by other documents.

## Test Setup
- **Database Adapter**: SQLite (`@payloadcms/db-sqlite`)
- **Collection**: `pages` with self-referencing `parent` relationship field
- **Test Scenario**: Parent-child document relationships where child references parent

## Test Execution

### 1. Environment Setup
✅ **SUCCESS**: SQLite adapter initialized successfully
- Database file: `test-deletion.db`
- Schema pulled from database without issues
- Test collection created with relationship field

### 2. Document Creation
✅ **SUCCESS**: Created test documents
- **Parent Page**: ID `1`, title "Parent Page", no parent reference
- **Child Page**: ID `2`, title "Child Page", parent reference to ID `1`

### 3. Parent Deletion Attempt
❌ **CRITICAL FINDING**: Parent deletion was **ALLOWED**

**Key Observations:**
- The parent document (ID: 1) was successfully deleted despite being referenced by a child document
- **No foreign key constraint violation occurred**
- **No error was thrown during deletion**
- The child document remained in the database
- The child's parent reference was automatically set to `null`

### 4. Post-Deletion State
- **Child Document**: Still exists with `parent: null`
- **Parent Document**: Successfully deleted
- **Data Integrity**: Compromised - orphaned child document created

## Technical Analysis

### Foreign Key Constraint Behavior
**UNEXPECTED RESULT**: SQLite adapter does **NOT** enforce foreign key constraints for relationship fields in Payload CMS.

**Expected Behavior**: Foreign key constraints should prevent deletion of referenced documents
**Actual Behavior**: Deletion proceeds, and referencing fields are set to `null`

### Database Schema Investigation
The test suggests that Payload CMS with SQLite adapter:
1. Does not create foreign key constraints with `ON DELETE RESTRICT`
2. May use `ON DELETE SET NULL` behavior or no constraints at all
3. Allows orphaned references to be created

## Implications for Plugin Development

### 1. Custom Blocking Logic Required
**CONCLUSION**: Custom deletion prevention logic **IS REQUIRED** for SQLite adapter, contrary to initial assumptions.

### 2. MongoDB vs SQLite Behavior
- **MongoDB**: Requires custom hooks (already implemented)
- **SQLite**: Also requires custom hooks (contrary to expectations)
- **PostgreSQL**: Needs separate testing to confirm behavior

### 3. Plugin Architecture Impact
The `preventParentDeletion` hook should **NOT** bypass SQL databases automatically. Instead:
- Test each SQL adapter individually
- Apply custom logic where foreign key constraints are not enforced
- Only bypass where native constraints are confirmed to work

## Recommendations

### Immediate Actions
1. **Remove SQL Bypass**: Update `preventParentDeletion.ts` to not automatically skip SQLite
2. **Test PostgreSQL**: Verify if PostgreSQL adapter behaves differently
3. **Update Documentation**: Correct assumptions about SQL adapter behavior

### Code Changes Needed
```typescript
// Current logic (INCORRECT):
if (adapter === '@payloadcms/db-mongodb') {
  // Apply prevention logic
}

// Proposed logic (CORRECT):
if (adapter === '@payloadcms/db-postgresql' && foreignKeyConstraintsEnabled) {
  // Skip only if confirmed to have proper constraints
} else {
  // Apply prevention logic for MongoDB, SQLite, and unconfigured PostgreSQL
}
```

## Test Environment Details
- **Payload Version**: 3.50.0
- **SQLite Adapter Version**: 3.50.0
- **Node.js Version**: 22.17.0
- **Test Date**: Current session
- **Test File**: `test-sqlite-deletion.js`

## Console Output Summary
```
🔍 Testing SQLite adapter behavior for parent document deletion...
✅ Payload initialized with SQLite adapter
📄 Creating parent page...
✅ Created parent page with ID: 1
👶 Creating child page that references parent...
✅ Created child page with ID: 2, parent: [object Object]
🗑️ Attempting to delete parent page that is referenced by child...
❌ UNEXPECTED: Parent deletion was ALLOWED - this may indicate missing foreign key constraints
🔍 Child page still exists. Parent reference is now: null
```

## Conclusion
**SQLite adapter does NOT provide native protection against deleting referenced documents.** Custom deletion prevention logic is required for both MongoDB and SQLite adapters in Payload CMS.