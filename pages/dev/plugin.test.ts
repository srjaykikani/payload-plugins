import payload from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { Breadcrumb } from '../src/types/Breadcrumb'
import config from './src/payload.config'

beforeAll(async () => {
  await payload.init({
    config: config,
  })
  await seed()
})

afterAll(async () => {
  // terminate the connection to the database
  if (typeof payload.db.destroy === 'function') {
    await payload.db.destroy()
  }
})

async function seed() {
  console.log('seeding')

  await payload.delete({
    collection: 'pages',
    where: {},
  })

  const homePage = await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
      content: 'Home Page',

      // @ts-expect-error
      path: undefined,
      // @ts-expect-error
      breadcrumbs: undefined,
    },
  })

  await payload.create({
    collection: 'pages',
    data: {
      title: 'Authors',
      slug: 'authors',
      content: 'Authors Page',

      // @ts-expect-error
      path: undefined,
      // @ts-expect-error
      breadcrumbs: undefined,
    },
  })

  await payload.create({
    collection: 'pages',
    data: {
      title: 'Blog',
      slug: 'blog',
      content: 'Blog Page',

      // @ts-expect-error
      path: undefined,
      // @ts-expect-error
      breadcrumbs: undefined,
    },
  })

  await payload.create({
    collection: 'pages',
    data: {
      title: 'Child',
      slug: 'child',
      content: 'Child Page',
      parent: homePage.id,

      // @ts-expect-error
      path: undefined,
      // @ts-expect-error
      breadcrumbs: undefined,
    },
  })
}

describe('Path and breadcrumb virtual fields are set correctly for normal find operation.', () => {
  test('pages without parent must have the correct breadcrumb and path matching /[lang]/[slug] format', async () => {
    const lang = 'de'

    // Get all pages
    const pages = await payload.find({
      collection: 'pages',
      sort: 'createdAt',
      locale: lang,
      where: {
        parent: {
          equals: null,
        },
      },
    })

    // Ensure we have pages to test
    expect(pages.docs.length).toBeGreaterThan(0)

    // Test each page's path format
    pages.docs.forEach((page) => {
      // Breadcrumbs must be an array
      expect(Array.isArray(page.breadcrumbs)).toBe(true)

      // Breadcrumbs must be correctly set
      expect(page.breadcrumbs).toStrictEqual([
        {
          id: page.breadcrumbs[0].id,
          label: page.title,
          slug: page.slug,
          path: page.path,
        },
      ] satisfies (Breadcrumb & { id: string | null | undefined })[])

      // Path must exist
      expect(page.path).toBeDefined()
      expect(typeof page.path).toBe('string')

      // Path must start with /
      expect(page.path).toMatch(/^\//)

      // Path must match /[lang]/[slug] format
      const pathParts = page.path.split('/').filter(Boolean)
      expect(pathParts).toEqual([lang, page.slug])
    })
  })

  test('child pages must have the correct breadcrumbs and path matching /[lang]/[parent_slug]/[slug] format', async () => {
    const homePage = (
      await payload.find({
        collection: 'pages',
        where: {
          slug: {
            equals: 'home',
          },
        },
      })
    ).docs[0]

    expect(homePage).toBeDefined()

    const childPage = (
      await payload.find({
        collection: 'pages',
        where: {
          slug: {
            equals: 'child',
          },
        },
      })
    ).docs[0]

    // Breadcrumbs must be an array
    expect(Array.isArray(childPage.breadcrumbs)).toBe(true)

    // Verify the child page breadcrumbs
    expect(childPage.breadcrumbs).toStrictEqual([
      {
        id: childPage.breadcrumbs[0].id,
        label: homePage.title,
        slug: homePage.slug,
        path: homePage.path,
      },
      {
        id: childPage.breadcrumbs[1].id,
        label: childPage.title,
        slug: childPage.slug,
        path: childPage.path,
      },
    ])

    // Verify the child page path format
    const pathParts = childPage.path.split('/')
    expect(pathParts).toHaveLength(4) // ['', 'lang', 'parent_slug', 'slug']

    // Path must start with /
    expect(childPage.path).toMatch(/^\//)

    // Language code should be 2-3 characters
    expect(pathParts[1]).toMatch(/^[a-z]{2,3}$/)

    // Parent slug should match home page slug
    expect(pathParts[2]).toBe(homePage.slug)

    // Child slug should be present
    expect(pathParts[3]).toBe(childPage.slug)
    expect(pathParts[3].length).toBeGreaterThan(0)
  })
})

describe('Path and breadcrumb virtual fields are set correctly for find operation with select.', () => {
  test('Only path and breadcrumbs are selected (not slug etc.)', async () => {
    const homePageWithSelect = (
      await payload.find({
        collection: 'pages',
        where: {
          slug: {
            equals: 'home',
          },
        },
        select: {
          path: true,
          breadcrumbs: true,
        },
      })
    ).docs[0]

    const homePage = (
      await payload.find({
        collection: 'pages',
        where: {
          slug: {
            equals: 'home',
          },
        },
      })
    ).docs[0]

    // Breadcrumbs must be an array
    expect(Array.isArray(homePageWithSelect.breadcrumbs)).toBe(true)

    // Breadcrumbs array should match homePage breadcrumbs
    expect(removeIdsFromArray(homePageWithSelect.breadcrumbs)).toEqual(
      removeIdsFromArray(homePage.breadcrumbs),
    )

    // Path must be defined and non-empty
    expect(homePageWithSelect.path).toBeDefined()

    // Path must be defined and non-empty
    expect(homePageWithSelect.path).toEqual(homePage.path)
  })
})

/**
 * Helper function to remove id field from objects in an array
 */
const removeIdsFromArray = <T extends { id?: any }>(array: T[]): Omit<T, 'id'>[] => {
  return array.map(({ id, ...rest }) => rest)
}
