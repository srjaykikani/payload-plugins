import type { CollectionConfig } from 'payload'
import afterDeleteHook from '../hooks/afterDelete'
import beforeChangeHook from '../hooks/beforeChange'

/** A collection config with additional attributes for media collections. */
type MediaCollectionConfig = {
  slug: string
  labels?: CollectionConfig['labels']
  access?: CollectionConfig['access']
  fields?: CollectionConfig['fields']
  hooks?: CollectionConfig['hooks']
  admin?: CollectionConfig['admin']
  uploads?: {
    mimeTypes?: string[]
  }
}

/**
 * Creates the `CollectionConfig` for a Media collection with all hooks and fields needed for Cloudinary integration.
 */
export const createMediaCollectionConfig = ({
  slug,
  labels,
  access,
  fields,
  hooks,
  admin,
  uploads,
}: MediaCollectionConfig): CollectionConfig => ({
  slug,
  labels,
  admin: {
    defaultColumns: ['filename', 'createdAt'],
    listSearchableFields: ['filename'],
    ...admin,
  },
  disableDuplicate: true,
  access: access ?? {},
  hooks: {
    ...hooks,
    beforeChange: [...(hooks?.beforeChange ?? []), beforeChangeHook],
    afterDelete: [...(hooks?.afterDelete ?? []), afterDeleteHook],
  },
  fields: [
    {
      // This field is needed to delete and update cloudinary files.
      name: 'cloudinaryPublicId',
      type: 'text',
      required: true,
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        // hide the field before the file is uploaded and the id is generated:
        condition: (data) => Boolean(data?.cloudinaryPublicId),
      },
    },
    // Payload automatically adds a `url` field to media collections.
    // To override its value to match the Cloudinary URL, we need to define it here. Otherwise updates to the media document would fail.
    {
      name: 'url',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ data }) => {
            return data?.cloudinaryURL
          },
        ],
      },
      label: 'URL',
    },
    {
      name: 'cloudinaryURL',
      label: 'Cloudinary URL',
      type: 'text',
      required: true,
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        // hide the field before the file is uploaded and the URL is generated:
        condition: (data) => Boolean(data?.cloudinaryURL),
      },
    },
    ...(fields ?? []),
  ],
  upload: {
    ...uploads,
    disableLocalStorage: true,
    crop: false,
    adminThumbnail: ({ doc }) =>
      `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_300,c_fill/f_auto,q_auto,dpr_auto/${doc.cloudinaryPublicId}`,
  },
})
