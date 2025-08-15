import payload, { ValidationError } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import config from './src/payload.config'

beforeAll(async () => {
  await payload.init({
    config: config,
  })
  console.log('beforeAll  top Level')

  for (const collection of (await config).collections.filter((c) => c.slug !== 'users')) {
    await payload.delete({
      collection: collection.slug,
      where: {},
    })
  }
})

afterAll(async () => {
  // if (payload.db && typeof payload.db.destroy === 'function') {
  //   await payload.db.destroy()
  // } else {
  //   console.log('Could not destroy database')
  // }
})

// describe('Path and breadcrumb virtual fields are returned correctly for find operation.', () => {
//   describe('The root page document', () => {
//     beforeEach(async () => {
//       await payload.delete({
//         collection: 'pages',
//         where: {},
//       })
//     })

//     test('has the correct virtual fields', async () => {
//       const rootPageData = {
//         title: 'Root Page',
//         slug: '',
//         content: 'Root Page',
//         isRootPage: true,
//       }

//       const rootPageId = (
//         await payload.create({
//           collection: 'pages',
//           // @ts-ignore
//           data: rootPageData,
//         })
//       ).id

//       const rootPage = await payload.findByID({
//         collection: 'pages',
//         id: rootPageId,
//       })

//       const path = `/`

//       expect(rootPage.slug).toBe('') // Plugin convention: The slug of the root page is an empty string.
//       expect(rootPage.path).toBe(path)
//       expect(removeIdsFromArray(rootPage.breadcrumbs)).toEqual(
//         removeIdsFromArray([
//           {
//             path,
//             label: rootPageData.title,
//             slug: rootPageData.slug,
//           },
//         ]),
//       )
//     })
//   })

//   describe('Nested document in same collection.', () => {
//     const rootPageData = {
//       title: 'Root Page',
//       slug: 'root-page',
//       content: 'Root Page',
//     }
//     const nestedPageData = {
//       title: 'Nested Page',
//       slug: 'nested-page',
//       content: 'Nested Page',
//     }
//     let rootPageId: string | number | undefined // will be set in the beforeEach hook
//     let nestedPageId: string | number | undefined // will be set in the beforeEach hook

//     beforeAll(async () => {
//       await payload.delete({
//         collection: 'pages',
//         where: {},
//       })

//       // ################# Seed the database for the tests of this group #################

//       rootPageId = (
//         await payload.create({
//           collection: 'pages',
//           // @ts-expect-error
//           data: rootPageData,
//         })
//       ).id

//       await payload.update({
//         collection: 'pages',
//         id: rootPageId,
//         data: rootPageData,
//       })

//       nestedPageId = (
//         await payload.create({
//           collection: 'pages',
//           // @ts-expect-error
//           data: { ...nestedPageData, parent: rootPageId },
//         })
//       ).id

//       await payload.update({
//         collection: 'pages',
//         id: nestedPageId,
//         data: { ...nestedPageData, parent: rootPageId },
//       })
//     })

//     describe('Breadcrumbs', () => {
//       test('are correctly set when requested.', async () => {
//         const nestedPage = await payload.findByID({
//           collection: 'pages',
//           id: nestedPageId!,
//         })

//         expect(nestedPage).toBeDefined()

//         // Breadcrumbs must be an array
//         expect(Array.isArray(nestedPage.breadcrumbs)).toBe(true)

//         // Breadcrumbs must be correctly set
//         expect(nestedPage.breadcrumbs).toStrictEqual([
//           {
//             id: nestedPage.breadcrumbs[0]?.id,
//             label: rootPageData.title,
//             slug: rootPageData.slug,
//             path: `/${rootPageData.slug}`,
//           },
//           {
//             id: nestedPage.breadcrumbs[1]?.id,
//             label: nestedPageData.title,
//             slug: nestedPageData.slug,
//             path: `/${rootPageData.slug}/${nestedPageData.slug}`,
//           },
//         ])
//       })
//     })

//     describe('Path', () => {
//       test('is correctly set when requested.', async () => {
//         const nestedPage = await payload.findByID({
//           collection: 'pages',
//           id: nestedPageId!,
//         })

//         expect(nestedPage).toBeDefined()
//         expect(nestedPage.path).toBeDefined()
//         expect(typeof nestedPage.path).toBe('string')

//         expect(nestedPage.path).toStrictEqual(`/${rootPageData.slug}/${nestedPageData.slug}`)
//       })
//     })
//   })

//   describe('Nested document in same collection.', () => {
//     const rootPageData = {
//       title: 'Root Page',
//       slug: 'root-page',
//       content: 'Root Page',
//     }
//     const nestedPageData = {
//       title: 'Nested Page',
//       slug: 'nested-page',
//       content: 'Nested Page',
//     }
//     let rootPageId: string | number | undefined // will be set in the beforeEach hook
//     let nestedPageId: string | number | undefined // will be set in the beforeEach hook

//     beforeAll(async () => {
//       await payload.delete({
//         collection: 'pages',
//         where: {},
//       })

//       // ################# Seed the database for the tests of this group #################

//       rootPageId = (
//         await payload.create({
//           collection: 'pages',
//           // @ts-expect-error
//           data: rootPageData,
//         })
//       ).id

//       nestedPageId = (
//         await payload.create({
//           collection: 'pages',
//           // @ts-expect-error
//           data: { ...nestedPageData, parent: rootPageId },
//         })
//       ).id
//     })

//     describe('Breadcrumbs', () => {
//       test('are correctly set when requested.', async () => {
//         const nestedPage = await payload.findByID({
//           collection: 'pages',
//           id: nestedPageId!,
//         })

//         expect(nestedPage).toBeDefined()

//         // Breadcrumbs must be an array
//         expect(Array.isArray(nestedPage.breadcrumbs)).toBe(true)

//         // Breadcrumbs must be correctly set
//         expect(nestedPage.breadcrumbs).toStrictEqual([
//           {
//             id: nestedPage.breadcrumbs[0]?.id,
//             label: rootPageData.title,
//             slug: rootPageData.slug,
//             path: `/${rootPageData.slug}`,
//           },
//           {
//             id: nestedPage.breadcrumbs[1]?.id,
//             label: nestedPageData.title,
//             slug: nestedPageData.slug,
//             path: `/${rootPageData.slug}/${nestedPageData.slug}`,
//           },
//         ])
//       })
//     })

//     describe('Path', () => {
//       test('is correctly set when requested.', async () => {
//         const nestedPage = await payload.findByID({
//           collection: 'pages',
//           id: nestedPageId!,
//         })

//         expect(nestedPage).toBeDefined()
//         expect(nestedPage.path).toBeDefined()
//         expect(typeof nestedPage.path).toBe('string')

//         expect(nestedPage.path).toStrictEqual(`/${rootPageData.slug}/${nestedPageData.slug}`)
//       })
//     })
//   })

//   test('Nested document across collections.', async () => {
//     const authorOverviewPageData = {
//       title: 'Authors',
//       slug: 'authors',
//       content: 'Authors page',
//     }
//     const authorPageData = {
//       name: 'Test Author',
//       slug: 'test-author',
//       content: 'Test Author',
//     }

//     const authorOverviewPageId = (
//       await payload.create({
//         collection: 'pages',
//         // @ts-expect-error
//         data: authorOverviewPageData,
//       })
//     ).id

//     const authorPageId = (
//       await payload.create({
//         collection: 'authors',
//         // @ts-expect-error
//         data: { ...authorPageData, parent: authorOverviewPageId },
//       })
//     ).id

//     // Verify the author was created and linked correctly
//     const author = await payload.findByID({
//       collection: 'authors',
//       depth: 0,
//       id: authorPageId,
//     })

//     expect(author).toBeDefined()
//     expect(author.parent).toBe(authorOverviewPageId)

//     // Verify path is correctly set
//     expect(author.path).toBe(`/${authorOverviewPageData.slug}/${authorPageData.slug}`)

//     // Verify breadcrumbs are correctly set
//     expect(author.breadcrumbs).toBeDefined()
//     expect(removeIdsFromArray(author.breadcrumbs)).toEqual([
//       {
//         label: authorOverviewPageData.title,
//         path: `/${authorOverviewPageData.slug}`,
//         slug: authorOverviewPageData.slug,
//       },
//       {
//         label: authorPageData.name,
//         path: `/${authorOverviewPageData.slug}/${authorPageData.slug}`,
//         slug: authorPageData.slug,
//       },
//     ])
//   })
// })

// describe('Path and breadcrumb virtual fields are set correctly for find operation with select.', () => {
//   test('Only path and breadcrumbs are selected (not slug etc.)', async () => {
//     const pageId = (
//       await payload.create({
//         collection: 'pages',
//         // @ts-expect-error
//         data: {
//           title: 'Page',
//           slug: 'page',
//           content: 'Page',
//         },
//       })
//     ).id

//     const pageWithSelect = await payload.findByID({
//       collection: 'pages',
//       id: pageId,
//       select: {
//         path: true,
//         breadcrumbs: true,
//         alternatePaths: true,
//       },
//     })

//     const pageWithoutSelect = await payload.findByID({
//       collection: 'pages',
//       id: pageId,
//     })

//     // Breadcrumbs must be an array
//     expect(Array.isArray(pageWithSelect.breadcrumbs)).toBe(true)

//     // Breadcrumbs array should match homePage breadcrumbs
//     expect(removeIdsFromArray(pageWithSelect.breadcrumbs)).toEqual(
//       removeIdsFromArray(pageWithoutSelect.breadcrumbs),
//     )

//     // Path must be defined and non-empty
//     expect(pageWithSelect.path).toBeDefined()

//     // Path must be defined and non-empty
//     expect(pageWithSelect.path).toEqual(pageWithoutSelect.path)
//   })
// })

// describe('Slug field behaves as expected for create and update operations', () => {
//   test('Slug remains unchanged when title is updated', async () => {
//     // Create initial page
//     const initialData = {
//       title: 'Initial Title',
//       content: 'Some content',
//       slug: 'initial-title',
//     }

//     const page = await payload.create({
//       collection: 'pages',
//       data: initialData,
//     })

//     expect(page.slug).toBe('initial-title')

//     // Update the title
//     const updatedPage = await payload.update({
//       collection: 'pages',
//       id: page.id,
//       data: {
//         title: 'Updated Title',
//       },
//     })

//     // Verify slug remains unchanged
//     expect(updatedPage.slug).toBe('initial-title')
//     expect(updatedPage.title).toBe('Updated Title')
//   })

//   test('Validation Error is thrown when creating a page without providing a slug', async () => {
//     // Create page without providing a slug
//     const pageData = {
//       title: 'Test Page Title',
//       content: 'Some content',
//     }

//     try {
//       await payload.create({
//         collection: 'pages',
//         data: pageData,
//       })
//     } catch (error) {
//       expect(error).toBeInstanceOf(ValidationError)
//     }
//   })

//   test('Validation Error is thrown when creating a page with an invalid slug', async () => {
//     // Create page without providing a slug
//     const pageData = {
//       title: 'Test Page Title 2',
//       content: 'Some content 2',
//       slug: 'invalid slug &!=',
//     }

//     try {
//       await payload.create({
//         collection: 'pages',
//         data: pageData,
//       })
//     } catch (error) {
//       expect(error).toBeInstanceOf(ValidationError)
//     }
//   })

//   test('Validation Error is thrown when trying to create a root page without providing a slug', async () => {
//     // Create initial root page without providing a slug
//     const initialData = {
//       title: 'Root Page',
//       content: 'Root page content',
//       isRootPage: true,
//     }

//     try {
//       await payload.create({
//         collection: 'pages',
//         data: initialData,
//       })
//     } catch (error) {
//       expect(error).toBeInstanceOf(ValidationError)
//     }
//   })

//   test('Root page is created sucessfully with an empty slug and throws validation error when slug is updated', async () => {
//     // Delete any existing root page
//     await payload.delete({
//       collection: 'pages',
//       where: {
//         slug: '',
//       },
//     })

//     // Create initial root page without providing a slug
//     const initialData = {
//       title: 'Root Page',
//       content: 'Root page content',
//       isRootPage: true,
//       slug: '',
//     }

//     const rootPage = await payload.create({
//       collection: 'pages',
//       data: initialData,
//     })

//     // Verify the slug is empty
//     expect(rootPage.slug).toBe('')
//     expect(rootPage.isRootPage).toBe(true)

//     // Try to update the slug
//     try {
//       await payload.update({
//         collection: 'pages',
//         id: rootPage.id,
//         data: {
//           slug: 'attempted-slug',
//         },
//       })
//     } catch (error) {
//       expect(error).toBeInstanceOf(ValidationError)
//     }
//   })
// })

// /**
//  * Helper function to remove id field from objects in an array
//  */
// const removeIdsFromArray = <T extends { id?: any }>(array: T[]): Omit<T, 'id'>[] => {
//   return array.map(({ id, ...rest }) => rest)
// }

describe('Multi-tenant baseFilter functionality', () => {
  let tenant1Id: string | number
  let tenant2Id: string | number

  beforeAll(async () => {
    console.log('beforeAll  not top Level')
    // Clear all data first
    // await payload.delete({ collection: 'tenants', where: {} })
    // await payload.delete({ collection: 'pages', where: {} })
    // await payload.delete({ collection: 'redirects', where: {} })
    // await payload.delete({ collection: 'authors', where: {} })

    // Create two tenants
    const tenant1 = await payload.create({
      collection: 'tenants',
      data: {
        slug: 'tenant-1',
        name: 'Tenant 1',
      },
    })
    tenant1Id = tenant1.id

    const tenant2 = await payload.create({
      collection: 'tenants',
      data: {
        slug: 'tenant-2',
        name: 'Tenant 2',
      },
    })
    tenant2Id = tenant2.id
  })

  describe('Pages isolation between tenants', () => {
    test('Root page creation respects tenant isolation', async () => {
      // Create root pages for both tenants
      const rootPage1 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Tenant 1 Home',
          slug: '',
          content: 'Tenant 1 home content',
          isRootPage: true,
          tenant: tenant1Id,
        },
      })

      const rootPage2 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Tenant 2 Home',
          slug: '',
          content: 'Tenant 2 home content',
          isRootPage: true,
          tenant: tenant2Id,
        },
      })

      // Verify both root pages were created with the same slug
      expect(rootPage1.slug).toBe('')
      expect(rootPage2.slug).toBe('')
      expect(rootPage1.tenant?.id).toBe(tenant1Id)
      expect(rootPage2.tenant?.id).toBe(tenant2Id)
    })

    test('Pages with same slug can exist in different tenants', async () => {
      // Create pages with the same slug for both tenants
      const page1 = await payload.create({
        collection: 'pages',
        data: {
          title: 'About Us - Tenant 1',
          slug: 'about',
          content: 'About tenant 1',
          tenant: tenant1Id,
        },
      })

      const page2 = await payload.create({
        collection: 'pages',
        data: {
          title: 'About Us - Tenant 2',
          slug: 'about',
          content: 'About tenant 2',
          tenant: tenant2Id,
        },
      })

      // Verify both pages were created with the same slug
      expect(page1.slug).toBe('about')
      expect(page2.slug).toBe('about')
      expect(page1.tenant?.id).toBe(tenant1Id)
      expect(page2.tenant?.id).toBe(tenant2Id)
    })

    test('Parent field respects tenant isolation', async () => {
      // Create parent pages for both tenants
      const parentPage1 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Products - Tenant 1',
          slug: 'products',
          content: 'Products for tenant 1',
          tenant: tenant1Id,
        },
      })

      const parentPage2 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Products - Tenant 2',
          slug: 'products',
          content: 'Products for tenant 2',
          tenant: tenant2Id,
        },
      })

      // Create child pages
      const childPage1 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Product A',
          slug: 'product-a',
          content: 'Product A details',
          parent: parentPage1.id,
          tenant: tenant1Id,
        },
      })

      const childPage2 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Product B',
          slug: 'product-b',
          content: 'Product B details',
          parent: parentPage2.id,
          tenant: tenant2Id,
        },
      })

      // Verify parent relationships
      expect(childPage1.parent?.id).toBe(parentPage1.id)
      expect(childPage2.parent?.id).toBe(parentPage2.id)
      expect(childPage1.tenant?.id).toBe(tenant1Id)
      expect(childPage2.tenant?.id).toBe(tenant2Id)
    })
  })

  describe('Breadcrumbs respect tenant isolation', () => {
    test('Breadcrumbs only include pages from the same tenant', async () => {
      // Setup: Create hierarchical pages for tenant 1
      const rootPageT1 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Services',
          slug: 'services',
          content: 'Services page',
          tenant: tenant1Id,
        },
      })

      const childPageT1 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Consulting',
          slug: 'consulting',
          content: 'Consulting services',
          parent: rootPageT1.id,
          tenant: tenant1Id,
        },
      })

      // Setup: Create similar hierarchy for tenant 2
      const rootPageT2 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Services',
          slug: 'services',
          content: 'Services page T2',
          tenant: tenant2Id,
        },
      })

      const childPageT2 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Development',
          slug: 'development',
          content: 'Development services',
          parent: rootPageT2.id,
          tenant: tenant2Id,
        },
      })

      // Fetch pages with breadcrumbs
      const fetchedChildT1 = await payload.findByID({
        collection: 'pages',
        id: childPageT1.id,
      })

      const fetchedChildT2 = await payload.findByID({
        collection: 'pages',
        id: childPageT2.id,
      })

      // Verify breadcrumbs are tenant-specific
      expect(fetchedChildT1.breadcrumbs).toHaveLength(2)
      expect(fetchedChildT1.breadcrumbs[0].label).toBe('Services')
      expect(fetchedChildT1.breadcrumbs[1].label).toBe('Consulting')

      expect(fetchedChildT2.breadcrumbs).toHaveLength(2)
      expect(fetchedChildT2.breadcrumbs[0].label).toBe('Services')
      expect(fetchedChildT2.breadcrumbs[1].label).toBe('Development')

      // Paths should be correctly generated
      expect(fetchedChildT1.path).toBe('/services/consulting')
      expect(fetchedChildT2.path).toBe('/services/development')
    })

    test('Cross-collection breadcrumbs respect tenant isolation', async () => {
      // Create author overview pages for both tenants
      const authorPageT1 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Authors T1',
          slug: 'authors',
          content: 'Authors overview T1',
          tenant: tenant1Id,
        },
      })

      const authorPageT2 = await payload.create({
        collection: 'pages',
        data: {
          title: 'Writers T2',
          slug: 'writers',
          content: 'Writers overview T2',
          tenant: tenant2Id,
        },
      })

      // Create authors in different tenants
      const author1 = await payload.create({
        collection: 'authors',
        data: {
          name: 'Author One',
          slug: 'author-one',
          content: 'Bio of author one',
          parent: authorPageT1.id,
          tenant: tenant1Id,
        },
      })

      const author2 = await payload.create({
        collection: 'authors',
        data: {
          name: 'Author Two',
          slug: 'author-two',
          content: 'Bio of author two',
          parent: authorPageT2.id,
          tenant: tenant2Id,
        },
      })

      // Verify breadcrumbs respect tenant boundaries
      const fetchedAuthor1 = await payload.findByID({
        collection: 'authors',
        id: author1.id,
      })

      const fetchedAuthor2 = await payload.findByID({
        collection: 'authors',
        id: author2.id,
      })

      expect(fetchedAuthor1.breadcrumbs[0].label).toBe('Authors T1')
      expect(fetchedAuthor1.path).toBe('/authors/author-one')

      expect(fetchedAuthor2.breadcrumbs[0].label).toBe('Writers T2')
      expect(fetchedAuthor2.path).toBe('/writers/author-two')
    })
  })

  describe('Redirects validation respects tenant isolation', () => {
    test('Redirect validation only checks within the same tenant', async () => {
      // Create redirect for tenant 1
      const redirect1 = await payload.create({
        collection: 'redirects',
        data: {
          sourcePath: '/old-page',
          destinationPath: '/new-page',
          type: 'permanent',
          tenant: tenant1Id,
        },
      })

      // Should be able to create the same redirect for tenant 2
      const redirect2 = await payload.create({
        collection: 'redirects',
        data: {
          sourcePath: '/old-page',
          destinationPath: '/new-page',
          type: 'permanent',
          tenant: tenant2Id,
        },
      })

      expect(redirect1.sourcePath).toBe('/old-page')
      expect(redirect2.sourcePath).toBe('/old-page')
      expect(redirect1.tenant?.id).toBe(tenant1Id)
      expect(redirect2.tenant?.id).toBe(tenant2Id)
    })

    test('Redirect loop detection only checks within the same tenant', async () => {
      // Create bidirectional redirects in tenant 1 (should fail)

      // First create the 'forward' redirect
      await payload.create({
        collection: 'redirects',
        data: {
          sourcePath: '/page-a',
          destinationPath: '/page-b',
          type: 'permanent',
          tenant: tenant1Id,
        },
      })

      // Then create the 'backward' redirect. This should fail for tenant 1
      await expect(
        payload.create({
          collection: 'redirects',
          data: {
            sourcePath: '/page-b',
            destinationPath: '/page-a',
            type: 'permanent',
            tenant: tenant1Id,
          },
        }),
      ).rejects.toThrow()

      // But creating the same 'backward' redirect should work in tenant 2
      const backwardsRedirectTenant2 = await payload.create({
        collection: 'redirects',
        data: {
          sourcePath: '/page-b',
          destinationPath: '/page-a',
          type: 'permanent',
          tenant: tenant2Id,
        },
      })

      expect(backwardsRedirectTenant2.sourcePath).toBe('/page-b')
      expect(backwardsRedirectTenant2.tenant?.id).toBe(tenant2Id)
    })
  })
})
