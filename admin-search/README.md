# JHB Software - Payload Admin Search Plugin

[![NPM Version](https://img.shields.io/npm/v/%40jhb.software%2Fpayload-admin-search)](https://www.npmjs.com/package/@jhb.software/payload-admin-search)

A plugin for [Payload CMS](https://payloadcms.com) that adds a search modal to quickly find documents across collections in the admin panel.

## Features

- Global search modal triggered by `Cmd + K` / `Ctrl + K`
- Search across collections in your Payload admin panel
- Search index powered by [@payloadcms/plugin-search](https://www.npmjs.com/package/@payloadcms/plugin-search)
- Real time search results
- Keyboard navigation support
- Clean, minimal UI

## Setup

This plugin requires the official [Payload search plugin](https://payloadcms.com/docs/plugins/search) to be installed. To use this plugin, simply install it and add it to your Payload config.

```ts
import { adminSearchPlugin } from '@jhb.software/payload-admin-search'
import { searchPlugin } from '@payloadcms/plugin-search'

export default {
  plugins: [
    adminSearchPlugin({}),
    searchPlugin({
      collections: ['pages', 'posts', 'authors'],
    }),
  ],
}
```

You can control which collections you can search by adjusting the `collections` option in the search plugin config.

## Contributing

We welcome contributions! Please open an issue to report bugs or suggest improvements, or submit a pull request with your changes.
