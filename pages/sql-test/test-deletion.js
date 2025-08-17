import { getPayload } from 'payload'
import config from './payload.config.js'

/**
 * Test script to investigate SQLite adapter behavior when deleting parent documents
 * that are referenced by child documents through the parent field.
 */
async function testParentDeletion() {
  console.log('🔍 Testing SQLite adapter parent deletion behavior...')
  
  try {
    // Initialize Payload
    const payload = await getPayload({ config })
    console.log('✅ Payload initialized with SQLite adapter')
    
    // Clean up any existing test data
    const existingPages = await payload.find({
      collection: 'pages',
      limit: 100,
    })
    
    for (const page of existingPages.docs) {
      try {
        await payload.delete({
          collection: 'pages',
          id: page.id,
        })
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    console.log('🧹 Cleaned up existing test data')
    
    // Create parent page
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
    const childPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Child Page',
        slug: 'child-page',
        parent: parentPage.id,
      },
    })
    
    console.log(`✅ Created child page with ID: ${childPage.id}, referencing parent: ${parentPage.id}`)
    
    // Verify the relationship
    const childWithParent = await payload.findByID({
      collection: 'pages',
      id: childPage.id,
    })
    
    console.log(`🔗 Child page parent field value: ${childWithParent.parent}`)
    
    // Now attempt to delete the parent page
    console.log('\n🚨 Attempting to delete parent page that is referenced by child...')
    
    try {
      await payload.delete({
        collection: 'pages',
        id: parentPage.id,
      })
      
      console.log('❌ UNEXPECTED: Parent deletion was ALLOWED')
      console.log('   This means SQLite adapter does NOT automatically prevent deletion of referenced documents')
      
      // Check if child still exists and what happened to its parent reference
      const childAfterDeletion = await payload.findByID({
        collection: 'pages',
        id: childPage.id,
      })
      
      console.log(`   Child page still exists with parent field: ${childAfterDeletion.parent}`)
      
    } catch (error) {
      console.log('✅ EXPECTED: Parent deletion was BLOCKED')
      console.log('   This means SQLite adapter automatically prevents deletion of referenced documents')
      console.log(`   Error message: ${error.message}`)
      console.log(`   Error type: ${error.constructor.name}`)
      
      // Log full error for debugging
      console.log('\n📋 Full error details:')
      console.log(error)
    }
    
    // Test deletion of child first (should work)
    console.log('\n🧪 Testing deletion of child page (should work)...')
    
    try {
      await payload.delete({
        collection: 'pages',
        id: childPage.id,
      })
      
      console.log('✅ Child page deletion successful')
      
      // Now try deleting parent again (should work now)
      console.log('\n🧪 Testing deletion of parent after child is removed...')
      
      await payload.delete({
        collection: 'pages',
        id: parentPage.id,
      })
      
      console.log('✅ Parent page deletion successful after child removal')
      
    } catch (error) {
      console.log('❌ Unexpected error during child deletion:')
      console.log(error.message)
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:')
    console.error(error)
  }
  
  console.log('\n🏁 Test completed')
  process.exit(0)
}

// Run the test
testParentDeletion()