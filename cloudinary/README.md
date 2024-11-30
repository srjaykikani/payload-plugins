# JHB Software - Payload Cloudinary Plugin

[![NPM Version](https://img.shields.io/npm/v/%40jhb.software%2Fpayload-cloudinary-plugin)](https://www.npmjs.com/package/@jhb.software/payload-cloudinary-plugin)

Seamlessly integrate Cloudinary with Payload CMS for professional media asset management. This plugin enables direct uploading your media files through Cloudinary's powerful platform.

## Setup

The following environment variables are required:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

## Usage

Use the `createMediaCollectionConfig` function to create a collection config for the Media collection. This adds all necessary fields and hooks to the collection. You can use the `overrides` parameter to customize the collection config. Additionally, you can specify the `labels` and `access` parameters.

```ts
import { createMediaCollectionConfig } from '@jhb.software/payload-cloudinary-plugin'

const mediaCollection = createMediaCollectionConfig({
  slug: 'media',
})
```
