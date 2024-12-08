# JHB Software - Payload Cloudinary Plugin

[![NPM Version](https://img.shields.io/npm/v/%40jhb.software%2Fpayload-cloudinary-plugin)](https://www.npmjs.com/package/@jhb.software/payload-cloudinary-plugin)

Seamlessly integrate Cloudinary with Payload CMS for professional media asset management. This plugin enables direct uploading your media files through Cloudinary's powerful platform.

## Setup

Add the plugin to your payload config as follows:

```ts
plugins: [payloadCloudinaryPlugin({})]
```

### Environment variables

The following environment variables are required:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

## Usage

To add Cloudinary support to a media collection, just wrap its `CollectionConfig` with the `createMediaCollectionConfig` function. This adds all necessary fields and hooks to the collection.

This is the most minimal configuration:

```ts
import { createMediaCollectionConfig } from '@jhb.software/payload-cloudinary-plugin'

const mediaCollection = createMediaCollectionConfig({
  slug: 'media',
})
```

The following example shows that you can also add additional fields to the collection:

```ts
import { createMediaCollectionConfig } from '@jhb.software/payload-cloudinary-plugin'

const imagesCollection = createMediaCollectionConfig({
  slug: 'images',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  uploads: {
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
})
```

## Roadmap

> ⚠️ **Warning**: This plugin is actively evolving and may undergo significant changes. While it is functional, please thoroughly test before using in production environments.

Have a suggestion for the plugin? Any feedback is welcome!

## Contributing

We welcome contributions! Please open an issue to report bugs or suggest improvements, or submit a pull request with your changes.
