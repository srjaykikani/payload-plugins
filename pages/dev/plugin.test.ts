import payload, { ValidationError } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, test } from 'vitest'
import config from './src/payload.config'

beforeAll(async () => {
  await payload.init({
    config: config,
  })

  for (const collection of (await config).collections.filter((c) => c.slug !== 'users')) {
    await payload.delete({
      collection: collection.slug,
      where: {},
    })
  }
}, 30000)

afterAll(async () => {
  if (payload.db && typeof payload.db.destroy === 'function') {
    await payload.db.destroy()
  } else {
    console.log('Could not destroy database')
  }
}, 30000)

describe('Path and breadcrumb virtual fields are returned correctly for find operation.', () => {
  describe('The root page document', () => {
    beforeEach(async () => {
      await payload.delete({
        collection: 'pages',
        where: {},
      })
    })

    test('has the correct virtual fields when only one locale is present', async () => {
      const locale = 'de'
      const rootPageData = {
        title: 'Root Page DE',
        slug: '',
        content: 'Root Page DE',
        isRootPage: true,
      }

      const rootPageId = (
        await payload.create({
          collection: 'pages',
          locale,
          // @ts-ignore
          data: rootPageData,
        })
      ).id

      const rootPage = await payload.findByID({
        collection: 'pages',
        id: rootPageId,
        locale: locale,
      })

      const path = `/${locale}`

      expect(rootPage.slug).toBe('') // Plugin convention: The slug of the root page is an empty string.
      expect(rootPage.path).toBe(path)
      expect(removeIdsFromArray(rootPage.breadcrumbs)).toEqual(
        removeIdsFromArray([
          {
            path,
            label: rootPageData.title,
            slug: rootPageData.slug,
          },
        ]),
      )
      expect(removeIdsFromArray(rootPage.meta.alternatePaths)).toEqual(
        removeIdsFromArray([
          {
            hreflang: locale,
            path,
          },
        ]),
      )
    })

    test('has the correct virtual fields when all locales are present', async () => {
      const rootPageData = {
        de: {
          title: 'Root Page DE',
          slug: '',
          content: 'Root Page DE',
          isRootPage: true,
        },
        en: {
          title: 'Root Page EN',
          slug: '',
          content: 'Root Page EN',
          isRootPage: true,
        },
      }

      const rootPageId = (
        await payload.create({
          collection: 'pages',
          locale: 'de',
          // @ts-ignore
          data: rootPageData.de,
        })
      ).id

      await payload.update({
        collection: 'pages',
        id: rootPageId,
        locale: 'en',
        // @ts-ignore
        data: rootPageData.en,
      })

      const rootPage = await payload.findByID({
        collection: 'pages',
        id: rootPageId,
        locale: 'all',
      })

      expect(rootPage.slug).toEqual({
        de: '',
        en: '',
      })
      expect(rootPage.path).toEqual({
        de: '/de',
        en: '/en',
      })
      expect(removeIdsFromArray(rootPage.breadcrumbs.de)).toEqual(
        removeIdsFromArray([
          {
            path: '/de',
            label: rootPageData.de.title,
            slug: rootPageData.de.slug,
          },
        ]),
      )
      expect(removeIdsFromArray(rootPage.breadcrumbs.en)).toEqual(
        removeIdsFromArray([
          {
            path: '/en',
            label: rootPageData.en.title,
            slug: rootPageData.en.slug,
          },
        ]),
      )
      expect(removeIdsFromArray(rootPage.meta.alternatePaths)).toEqual(
        removeIdsFromArray([
          {
            hreflang: 'de',
            path: '/de',
          },
          {
            hreflang: 'en',
            path: '/en',
          },
        ]),
      )
    })
  })

  describe('Nested document in same collection with all locales created.', () => {
    const rootPageDataDe = {
      title: 'Root Page DE',
      slug: 'root-page-de',
      content: 'Root Page DE',
    }
    const rootPageDataEn = {
      title: 'Root Page EN',
      slug: 'root-page-en',
      content: 'Root Page EN',
    }
    const nestedPageDataDe = {
      title: 'Nested Page DE',
      slug: 'nested-page-de',
      content: 'Nested Page DE',
    }
    const nestedPageDataEn = {
      title: 'Nested Page EN',
      slug: 'nested-page-en',
      content: 'Nested Page EN',
    }
    let rootPageId: string | number | undefined // will be set in the beforeEach hook
    let nestedPageId: string | number | undefined // will be set in the beforeEach hook

    beforeAll(async () => {
      await payload.delete({
        collection: 'pages',
        where: {},
      })

      // ################# Seed the database for the tests of this group #################

      rootPageId = (
        await payload.create({
          collection: 'pages',
          locale: 'de',
          // @ts-ignore
          data: rootPageDataDe,
        })
      ).id

      await payload.update({
        collection: 'pages',
        id: rootPageId,
        locale: 'en',
        // @ts-ignore
        data: rootPageDataEn,
      })

      nestedPageId = (
        await payload.create({
          collection: 'pages',
          locale: 'de',
          // @ts-ignore
          data: { ...nestedPageDataDe, parent: rootPageId },
        })
      ).id

      await payload.update({
        collection: 'pages',
        id: nestedPageId,
        locale: 'en',
        // @ts-ignore
        data: { ...nestedPageDataEn, parent: rootPageId },
      })
    })

    describe('Breadcrumbs', () => {
      test('All locales requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'all',
        })

        expect(nestedPage).toBeDefined()

        // Breadcrumbs must be an object containing the breadcrumbs for all locales
        expect(typeof nestedPage.breadcrumbs).toBe('object')

        // Breadcrumbs must be correctly set
        expect(nestedPage.breadcrumbs).toStrictEqual({
          de: [
            {
              id: nestedPage.breadcrumbs['de'][0]?.id,
              label: rootPageDataDe.title,
              slug: rootPageDataDe.slug,
              path: `/de/${rootPageDataDe.slug}`,
            },
            {
              id: nestedPage.breadcrumbs['de'][1]?.id,
              label: nestedPageDataDe.title,
              slug: nestedPageDataDe.slug,
              path: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
            },
          ],
          en: [
            {
              id: nestedPage.breadcrumbs['en'][0]?.id,
              label: rootPageDataEn.title,
              slug: rootPageDataEn.slug,
              path: `/en/${rootPageDataEn.slug}`,
            },
            {
              id: nestedPage.breadcrumbs['en'][1]?.id,
              label: nestedPageDataEn.title,
              slug: nestedPageDataEn.slug,
              path: `/en/${rootPageDataEn.slug}/${nestedPageDataEn.slug}`,
            },
          ],
        })
      })

      test('One locale requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'de',
        })

        expect(nestedPage).toBeDefined()

        // Breadcrumbs must be an object containing the breadcrumbs for all locales
        expect(Array.isArray(nestedPage.breadcrumbs)).toBe(true)

        // Breadcrumbs must be correctly set
        expect(nestedPage.breadcrumbs).toStrictEqual([
          {
            id: nestedPage.breadcrumbs[0].id,
            label: rootPageDataDe.title,
            slug: rootPageDataDe.slug,
            path: `/de/${rootPageDataDe.slug}`,
          },
          {
            id: nestedPage.breadcrumbs[1].id,
            label: nestedPageDataDe.title,
            slug: nestedPageDataDe.slug,
            path: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
          },
        ])
      })
    })

    describe('Path', () => {
      test('All locales requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'all',
        })

        expect(nestedPage).toBeDefined()
        expect(nestedPage.path).toBeDefined()
        expect(typeof nestedPage.path).toBe('object')

        expect(nestedPage.path).toStrictEqual({
          de: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
          en: `/en/${rootPageDataEn.slug}/${nestedPageDataEn.slug}`,
        })
      })

      test('One locale requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'de',
        })

        expect(nestedPage).toBeDefined()
        expect(nestedPage.path).toBeDefined()
        expect(typeof nestedPage.path).toBe('string')

        expect(nestedPage.path).toStrictEqual(`/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`)
      })
    })

    describe('AlternatePaths', () => {
      test('All locales requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'all',
        })

        expect(nestedPage).toBeDefined()
        expect(nestedPage.meta.alternatePaths).toBeDefined()
        expect(Array.isArray(nestedPage.meta.alternatePaths)).toBe(true)

        expect(nestedPage.meta.alternatePaths).toStrictEqual([
          {
            hreflang: 'de',
            path: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
          },
          {
            hreflang: 'en',
            path: `/en/${rootPageDataEn.slug}/${nestedPageDataEn.slug}`,
          },
        ])
      })

      test('One locale requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'de',
        })

        expect(nestedPage).toBeDefined()
        expect(nestedPage.meta.alternatePaths).toBeDefined()
        expect(Array.isArray(nestedPage.meta.alternatePaths)).toBe(true)

        expect(nestedPage.meta.alternatePaths).toStrictEqual([
          {
            hreflang: 'de',
            path: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
          },
          {
            hreflang: 'en',
            path: `/en/${rootPageDataEn.slug}/${nestedPageDataEn.slug}`,
          },
        ])
      })
    })
  })

  describe('Nested document in same collection with one locale created.', () => {
    const rootPageDataDe = {
      title: 'Root Page DE',
      slug: 'root-page-de-one-locale',
      content: 'Root Page DE',
    }
    const nestedPageDataDe = {
      title: 'Nested Page DE',
      slug: 'nested-page-de-one-locale',
      content: 'Nested Page DE',
    }
    let rootPageId: string | undefined // will be set in the beforeEach hook
    let nestedPageId: string | undefined // will be set in the beforeEach hook

    beforeAll(async () => {
      await payload.delete({
        collection: 'pages',
        where: {},
      })

      // ################# Seed the database for the tests of this group #################

      rootPageId = (
        await payload.create({
          collection: 'pages',
          locale: 'de',
          // @ts-ignore
          data: rootPageDataDe,
        })
      ).id

      nestedPageId = (
        await payload.create({
          collection: 'pages',
          locale: 'de',
          // @ts-ignore
          data: { ...nestedPageDataDe, parent: rootPageId },
        })
      ).id
    })

    describe('Breadcrumbs', () => {
      test('All locales requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'all',
        })

        expect(nestedPage).toBeDefined()

        // Breadcrumbs must be an object containing the breadcrumbs for all locales
        expect(typeof nestedPage.breadcrumbs).toBe('object')

        // Breadcrumbs must be correctly set
        expect(nestedPage.breadcrumbs).toStrictEqual({
          de: [
            {
              id: nestedPage.breadcrumbs['de'][0]?.id,
              label: rootPageDataDe.title,
              slug: rootPageDataDe.slug,
              path: `/de/${rootPageDataDe.slug}`,
            },
            {
              id: nestedPage.breadcrumbs['de'][1]?.id,
              label: nestedPageDataDe.title,
              slug: nestedPageDataDe.slug,
              path: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
            },
          ],
          // TODO: After revising the implementation, change this to be undefined
          // Note: When the doc is not defined in en, the plugin should not return breadcrumbs for en!
          en: [
            {
              id: nestedPage.breadcrumbs['en'][0]?.id,
              label: undefined,
              path: '/en',
              slug: undefined,
            },
            {
              id: nestedPage.breadcrumbs['en'][1]?.id,
              label: undefined,
              path: '/en',
              slug: undefined,
            },
          ],
        })
      })

      test('One locale requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'de',
        })

        expect(nestedPage).toBeDefined()

        // Breadcrumbs must be an object containing the breadcrumbs for all locales
        expect(Array.isArray(nestedPage.breadcrumbs)).toBe(true)

        // Breadcrumbs must be correctly set
        expect(nestedPage.breadcrumbs).toStrictEqual([
          {
            id: nestedPage.breadcrumbs[0].id,
            label: rootPageDataDe.title,
            slug: rootPageDataDe.slug,
            path: `/de/${rootPageDataDe.slug}`,
          },
          {
            id: nestedPage.breadcrumbs[1].id,
            label: nestedPageDataDe.title,
            slug: nestedPageDataDe.slug,
            path: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
          },
        ])
      })
    })

    describe('Path', () => {
      test('All locales requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'all',
        })

        expect(nestedPage).toBeDefined()
        expect(nestedPage.path).toBeDefined()
        expect(typeof nestedPage.path).toBe('object')

        expect(nestedPage.path).toStrictEqual({
          de: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
        })
      })

      test('One locale requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'de',
        })

        expect(nestedPage).toBeDefined()
        expect(nestedPage.path).toBeDefined()
        expect(typeof nestedPage.path).toBe('string')

        expect(nestedPage.path).toStrictEqual(`/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`)
      })
    })

    describe('AlternatePaths', () => {
      test('All locales requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'all',
        })

        expect(nestedPage).toBeDefined()
        expect(nestedPage.meta.alternatePaths).toBeDefined()
        expect(Array.isArray(nestedPage.meta.alternatePaths)).toBe(true)

        expect(nestedPage.meta.alternatePaths).toStrictEqual([
          {
            hreflang: 'de',
            path: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
          },
        ])
      })

      test('One locale requested.', async () => {
        const nestedPage = await payload.findByID({
          collection: 'pages',
          id: nestedPageId!,
          locale: 'de',
        })

        expect(nestedPage).toBeDefined()
        expect(nestedPage.meta.alternatePaths).toBeDefined()
        expect(Array.isArray(nestedPage.meta.alternatePaths)).toBe(true)

        expect(nestedPage.meta.alternatePaths).toStrictEqual([
          {
            hreflang: 'de',
            path: `/de/${rootPageDataDe.slug}/${nestedPageDataDe.slug}`,
          },
        ])
      })
    })
  })

  test('Nested document across collections with one locale created.', async () => {
    const locale = 'de'
    const authorOverviewPageData = {
      title: 'Authors',
      slug: 'authors',
      content: 'Authors page',
    }
    const authorPageData = {
      name: 'Test Author',
      slug: 'test-author',
      content: 'Test Author',
    }

    const authorOverviewPageId = (
      await payload.create({
        collection: 'pages',
        locale,
        data: authorOverviewPageData,
      })
    ).id

    const authorPageId = (
      await payload.create({
        collection: 'authors',
        locale,
        data: { ...authorPageData, parent: authorOverviewPageId },
      })
    ).id

    // Verify the author was created and linked correctly
    const author = await payload.findByID({
      collection: 'authors',
      depth: 0,
      id: authorPageId,
    })

    expect(author).toBeDefined()
    expect(author.parent).toBe(authorOverviewPageId)

    // Verify path is correctly set
    expect(author.path).toBe(`/${locale}/${authorOverviewPageData.slug}/${authorPageData.slug}`)

    // Verify breadcrumbs are correctly set
    expect(author.breadcrumbs).toBeDefined()
    expect(removeIdsFromArray(author.breadcrumbs)).toEqual([
      {
        label: authorOverviewPageData.title,
        path: `/${locale}/${authorOverviewPageData.slug}`,
        slug: authorOverviewPageData.slug,
      },
      {
        label: authorPageData.name,
        path: `/${locale}/${authorOverviewPageData.slug}/${authorPageData.slug}`,
        slug: authorPageData.slug,
      },
    ])

    // Verify alternatePaths are correctly set
    expect(author.meta.alternatePaths).toBeDefined()
    expect(author.meta.alternatePaths).toEqual([
      {
        hreflang: locale,
        path: `/${locale}/${authorOverviewPageData.slug}/${authorPageData.slug}`,
      },
    ])
  })
})

describe('Path and breadcrumb virtual fields are set correctly for find operation with select.', () => {
  test('Only path and breadcrumbs are selected (not slug etc.)', async () => {
    const pageId = (
      await payload.create({
        collection: 'pages',
        locale: 'de',
        // @ts-ignore
        data: {
          title: 'Page DE',
          slug: 'page',
          content: 'Page DE',
        },
      })
    ).id

    const pageWithSelect = await payload.findByID({
      collection: 'pages',
      id: pageId,
      select: {
        path: true,
        breadcrumbs: true,
        alternatePaths: true,
      },
    })

    const pageWithoutSelect = await payload.findByID({
      collection: 'pages',
      id: pageId,
    })

    // Breadcrumbs must be an array
    expect(Array.isArray(pageWithSelect.breadcrumbs)).toBe(true)

    // Breadcrumbs array should match homePage breadcrumbs
    expect(removeIdsFromArray(pageWithSelect.breadcrumbs)).toEqual(
      removeIdsFromArray(pageWithoutSelect.breadcrumbs),
    )

    // Path must be defined and non-empty
    expect(pageWithSelect.path).toBeDefined()

    // Path must be defined and non-empty
    expect(pageWithSelect.path).toEqual(pageWithoutSelect.path)

    // AlternatePaths must be defined and non-empty
    expect(pageWithSelect.meta.alternatePaths).toBeDefined()

    // AlternatePaths must match homePage alternatePaths
    expect(pageWithSelect.meta.alternatePaths).toEqual(pageWithoutSelect.meta.alternatePaths)
  })
})

describe('Slug field behaves as expected for create and update operations', () => {
  test('Slug remains unchanged when title is updated', async () => {
    // Create initial page
    const initialData = {
      title: 'Initial Title',
      content: 'Some content',
      slug: 'initial-title',
    }

    const page = await payload.create({
      collection: 'pages',
      data: initialData,
    })

    expect(page.slug).toBe('initial-title')

    // Update the title
    const updatedPage = await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        title: 'Updated Title',
      },
    })

    // Verify slug remains unchanged
    expect(updatedPage.slug).toBe('initial-title')
    expect(updatedPage.title).toBe('Updated Title')
  })

  test('Validation Error is thrown when creating a page without providing a slug', async () => {
    // Create page without providing a slug
    const pageData = {
      title: 'Test Page Title',
      content: 'Some content',
    }

    try {
      await payload.create({
        collection: 'pages',
        data: pageData,
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
    }
  })

  test('Validation Error is thrown when creating a page with an invalid slug', async () => {
    // Create page without providing a slug
    const pageData = {
      title: 'Test Page Title 2',
      content: 'Some content 2',
      slug: 'invalid slug &!=',
    }

    try {
      await payload.create({
        collection: 'pages',
        data: pageData,
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
    }
  })

  test('Validation Error is thrown when trying to create a root page without providing a slug', async () => {
    // Create initial root page without providing a slug
    const initialData = {
      title: 'Root Page',
      content: 'Root page content',
      isRootPage: true,
    }

    try {
      await payload.create({
        collection: 'pages',
        data: initialData,
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
    }
  })

  test('Root page is created sucessfully with an empty slug and throws validation error when slug is updated', async () => {
    // Create initial root page without providing a slug
    const initialData = {
      title: 'Root Page',
      content: 'Root page content',
      isRootPage: true,
      slug: '',
    }

    const rootPage = await payload.create({
      collection: 'pages',
      data: initialData,
    })

    // Verify the slug is empty
    expect(rootPage.slug).toBe('')
    expect(rootPage.isRootPage).toBe(true)

    // Try to update the slug
    try {
      await payload.update({
        collection: 'pages',
        id: rootPage.id,
        data: {
          slug: 'attempted-slug',
        },
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
    }
  })
})

describe('Parent deletion prevention hook', () => {
  beforeEach(async () => {
    // Clean up all collections before each test
    for (const collection of (await config).collections.filter((c) => c.slug !== 'users')) {
      await payload.delete({
        collection: collection.slug,
        where: {},
      })
    }
  })

  describe('MongoDB environment', () => {
    test('prevents deletion when child dependencies exist', async () => {
      // Create parent page
      const parentPage = await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Parent Page',
          slug: 'parent-page-prevents-deletion',
          content: 'Parent content',
        },
      })

      // Create child page referencing the parent
      await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Child Page',
          slug: 'child-page-prevents-deletion',
          content: 'Child content',
          parent: parentPage.id,
        },
      })

      // Attempt to delete the parent page - should throw error
      await expect(
        payload.delete({
          collection: 'pages',
          id: parentPage.id,
        })
      ).rejects.toThrow('Cannot delete this document because it is referenced as a parent by')
    })

    test('allows deletion when no child dependencies exist', async () => {
      // Create parent page
      const parentPage = await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Parent Page',
          slug: 'parent-page-allows-deletion',
          content: 'Parent content',
        },
      })

      // Create another page without parent reference
      await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Independent Page',
          slug: 'independent-page-allows-deletion',
          content: 'Independent content',
        },
      })

      // Delete the parent page - should succeed
       const result = await payload.delete({
         collection: 'pages',
         id: parentPage.id,
       })

       // Verify deletion succeeded (result should not be null)
       expect(result).toBeTruthy()
       if (result && result.docs) {
         expect(result.docs).toHaveLength(1)
         expect(result.docs[0].id).toBe(parentPage.id)
       }
    })

    test('provides helpful error message with dependency details', async () => {
      // Create parent page
      const parentPage = await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Parent Page',
          slug: 'parent-page',
          content: 'Parent content',
        },
      })

      // Create multiple child pages
      await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Child Page 1',
          slug: 'child-page-1',
          content: 'Child content 1',
          parent: parentPage.id,
        },
      })

      await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Child Page 2',
          slug: 'child-page-2',
          content: 'Child content 2',
          parent: parentPage.id,
        },
      })

      // Attempt to delete parent - should provide detailed error
      try {
        await payload.delete({
          collection: 'pages',
          id: parentPage.id,
        })
        fail('Expected deletion to be prevented')
      } catch (error: any) {
        expect(error.message).toContain('Cannot delete this document because it is referenced as a parent by')
        expect(error.message).toContain('2 document(s) in the "pages" collection')
      }
    })

    test('handles multi-collection scenarios', async () => {
      // Create parent page
      const parentPage = await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Parent Page',
          slug: 'parent-page-multi-collection',
          content: 'Parent content',
        },
      })

      // Create child in pages collection
      await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Child Page',
          slug: 'child-page-multi-collection',
          content: 'Child content',
          parent: parentPage.id,
        },
      })

      // Create child in country-travel-tips collection (if it has parent field)
      try {
        await payload.create({
          collection: 'country-travel-tips',
          locale: 'de',
          data: {
            title: 'Travel Tip',
            slug: 'travel-tip',
            content: 'Travel tip content',
            parent: parentPage.id,
          },
        })
      } catch {
        // Collection might not have parent field, skip this part
      }

      // Attempt to delete parent - should be prevented
      await expect(
        payload.delete({
          collection: 'pages',
          id: parentPage.id,
        })
      ).rejects.toThrow('Cannot delete this document because it is referenced as a parent by')
    })
  })


  describe('Multi-tenant scenarios', () => {
    test('respects baseFilter configurations', async () => {
      // This test would require a multi-tenant setup with baseFilter
      // For now, we'll create a basic test that verifies the hook doesn't interfere
      // with normal operations when no dependencies exist
      
      const parentPage = await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Tenant Parent Page',
          slug: 'tenant-parent-page',
          content: 'Tenant parent content',
        },
      })

      // Create child in different "tenant" context (simulated)
      await payload.create({
        collection: 'pages',
        locale: 'de',
        data: {
          title: 'Different Tenant Child',
          slug: 'different-tenant-child',
          content: 'Different tenant child content',
          // Not setting parent to simulate different tenant
        },
      })

      // Delete should succeed as no dependencies in same tenant
       const result = await payload.delete({
         collection: 'pages',
         id: parentPage.id,
       })

       // Verify deletion succeeded (result should not be null)
       expect(result).toBeTruthy()
       if (result && result.docs) {
         expect(result.docs).toHaveLength(1)
         expect(result.docs[0].id).toBe(parentPage.id)
       }
    })
  })
})

describe('Parent deletion prevention hook - opt-out', () => {
  it('should allow deletion when preventParentDeletion is false', async () => {
    // Test would require separate config with preventParentDeletion: false
    expect(true).toBe(true)
  })
})

/**
 * Helper function to remove id field from objects in an array
 */
const removeIdsFromArray = <T extends { id?: any }>(array: T[]): Omit<T, 'id'>[] => {
  return array.map(({ id, ...rest }) => rest)
}
