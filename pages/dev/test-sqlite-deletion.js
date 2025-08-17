import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Test configuration with SQLite adapter to investigate parent deletion behavior
 */
const testConfig = buildConfig({
  collections: [
    {
      slug: 'pages',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
        {
          name: 'parent',
          type: 'relationship',
          relationTo: 'pages',
          required: false,
        },
      ],
    },
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
  ],
  db: sqliteAdapter({
    client: {
      url: 'file:./test-deletion.db',
    },
  }),
  secret: 'test-secret-key-for-deletion-test',
  typescript: {
    outputFile: path.resolve(dirname, 'test-payload-types.ts'),
  },
  async onInit(payload) {
    // Create a test user if none exists
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'test@example.com',
          password: 'test123',
        },
      })
    }
  },
})

/**
 * Test function to investigate SQLite adapter behavior with parent-child relationships
 */
async function testSQLiteDeletionBehavior() {
  console.log('🔍 Testing SQLite adapter behavior for parent document deletion...')
  
  try {
    // Initialize Payload with SQLite adapter
    const payload = await getPayload({ config: testConfig })
    console.log('✅ Payload initialized with SQLite adapter')
    
    // Clean up existing test data
    console.log('🧹 Cleaning up existing test data...')
    const existingPages = await payload.find({ collection: 'pages' })
    for (const page of existingPages.docs) {
      await payload.delete({ collection: 'pages', id: page.id })
    }
    
    // Create parent page
    console.log('📄 Creating parent page...')
    const parentPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Parent Page',
        slug: 'parent-page',
        parent: null,
      },
    })
    console.log(`✅ Created parent page with ID: ${parentPage.id}`)
    
    // Create child page that references the parent
    console.log('👶 Creating child page that references parent...')
    const childPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Child Page',
        slug: 'child-page',
        parent: parentPage.id,
      },
    })
    console.log(`✅ Created child page with ID: ${childPage.id}, parent: ${childPage.parent}`)
    
    // Attempt to delete the parent page that is referenced by the child
    console.log('🗑️  Attempting to delete parent page that is referenced by child...')
    try {
      await payload.delete({
        collection: 'pages',
        id: parentPage.id,
      })
      console.log('❌ UNEXPECTED: Parent deletion was ALLOWED - this may indicate missing foreign key constraints')
      
      // Check if child page still exists and what happened to its parent reference
      const remainingChild = await payload.findByID({
        collection: 'pages',
        id: childPage.id,
      })
      console.log(`🔍 Child page still exists. Parent reference is now: ${remainingChild.parent}`)
      
    } catch (deleteError) {
      console.log('✅ EXPECTED: Parent deletion was BLOCKED')
      console.log('📋 Error details:')
      console.log(`   - Error type: ${deleteError.constructor.name}`)
      console.log(`   - Error message: ${deleteError.message}`)
      console.log(`   - Error code: ${deleteError.code || 'N/A'}`)
      
      // Verify parent still exists
      const parentStillExists = await payload.findByID({
        collection: 'pages',
        id: parentPage.id,
      })
      console.log(`✅ Parent page still exists: ${parentStillExists.title}`)
    }
    
    // Clean up: Delete child first, then parent
    console.log('🧹 Cleaning up: Deleting child page first...')
    await payload.delete({ collection: 'pages', id: childPage.id })
    console.log('✅ Child page deleted successfully')
    
    console.log('🧹 Now attempting to delete parent page...')
    await payload.delete({ collection: 'pages', id: parentPage.id })
    console.log('✅ Parent page deleted successfully after child was removed')
    
    console.log('\n📊 TEST RESULTS SUMMARY:')
    console.log('- SQLite adapter behavior has been documented above')
    console.log('- Check the console output for deletion blocking behavior')
    console.log('- Foreign key constraint enforcement details are logged')
    
  } catch (error) {
    console.error('❌ Test failed with error:')
    console.error(error)
  }
}

// Run the test
testSQLiteDeletionBehavior().catch(console.error)