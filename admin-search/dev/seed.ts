import type { CollectionSlug, Payload } from 'payload'

import { devUser } from './helpers/credentials.js'

export const seed = async (payload: Payload) => {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: {
      email: {
        equals: devUser.email,
      },
    },
  })

  if (!totalDocs) {
    await payload.create({
      collection: 'users',
      data: devUser,
    })
  }

  // Seed sample authors, pages, and posts if not present
  const { docs: existingAuthors } = await payload.find({
    collection: 'authors' as CollectionSlug,
    depth: 0,
    pagination: false,
    where: { name: { equals: 'John Doe' } },
  })
  let authorId: number | string
  if (!existingAuthors.length) {
    const author = await payload.create({
      collection: 'authors' as CollectionSlug,
      data: {
        name: 'John Doe',
        bio: 'Example author seeded for testing.',
      } as any,
    })
    authorId = author.id
  } else {
    authorId = existingAuthors[0].id
  }

  // Seed a page
  const { totalDocs: pageCount } = await payload.count({
    collection: 'pages' as CollectionSlug,
  })
  if (!pageCount) {
    await payload.create({
      collection: 'pages' as CollectionSlug,
      data: {
        slug: 'home',
        content: {},
        title: 'Home',
      } as any,
    })
  }

  // Seed a post
  const { totalDocs: postCount } = await payload.count({
    collection: 'posts' as CollectionSlug,
  })
  if (!postCount) {
    await payload.create({
      collection: 'posts' as CollectionSlug,
      data: {
        slug: 'first-post',
        author: authorId,
        content: {},
        title: 'First Post',
      } as any,
    })
  }
}
