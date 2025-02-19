# JHB Software - Payload Cloudinary Plugin

[![NPM Version](https://img.shields.io/npm/v/%40jhb.software%2Fpayload-cloudinary-plugin)](https://www.npmjs.com/package/@jhb.software/payload-cloudinary-plugin)

Seamlessly integrate Cloudinary with Payload CMS for professional media asset management. This plugin enables direct uploading your media files to Cloudinary's powerful platform.

## Setup

Add the plugin to your payload config as follows. Specify the slugs of all upload collections you want to integrate with Cloudinary in the `uploadCollections` option.

```ts
plugins: [
  payloadCloudinaryPlugin({
    uploadCollections: ['images', 'videos'],
    credentials: {
      apiKey: process.env.CLOUDINARY_API_KEY!,
      apiSecret: process.env.CLOUDINARY_API_SECRET!,
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    },
  }),
]
```

These are the minimum required plugin options. See the [Additional plugin options](#additional-plugin-options) section for further options.

### Usage

The plugin automatically adds all necessary fields and hooks to the collections specified in the `uploadCollections` option.

If you need to extend the collection with additional fields (e.g. an alt field), you can do so:

```ts
import { CollectionConfig } from 'payload'

export const Images: CollectionConfig = {
  slug: 'images',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  upload: {
    mimeTypes: ['image/*'],
  },
  fields: [
    // The other fields are automatically added by the plugin.
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
```

### Additional plugin options

The following options are optional:

- `uploadOptions`
  - `useFilename`: Whether to use the filename of the uploaded file as the public ID. Defaults to `false`.
  - `chunkSize`: The size of the chunks to upload the file in.
- `cloudinary`
  - `folder`: The folder to upload the files to.

See the [CloudinaryPluginConfig](https://github.com/jhb-software/payload-plugins/blob/main/cloudinary/src/types/CloudinaryPluginConfig.ts) type for more details.

## Roadmap

> ⚠️ **Warning**: This plugin is actively evolving and may undergo significant changes. While it is functional, please thoroughly test before using in production environments.

Have a suggestion for the plugin? Any feedback is welcome!

## Contributing

We welcome contributions! Please open an issue to report bugs or suggest improvements, or submit a pull request with your changes.
