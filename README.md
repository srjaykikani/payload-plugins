# JHB Software - Payload CMS Plugins

This repository contains a collection of powerful plugins designed to enhance [Payload CMS](https://payloadcms.com/), a headless content management system.

> ⚠️ **Warning**: This repository is actively evolving and may undergo significant changes. While the plugins are functional, please thoroughly test before using in production environments.

## Plugins

### Pages Plugin

[![NPM Version](https://img.shields.io/npm/v/%40jhb.software%2Fpayload-pages-plugin)](https://www.npmjs.com/package/@jhb.software/payload-pages-plugin)

The Pages plugin simplifies website building by adding essential fields to your collections. These fields enable hierarchical page structures and dynamic URL management:

- `slug` - A URL-friendly identifier for the page (e.g., `/software-development`)
- `parent` - Creates page hierarchies by linking to a parent page (e.g., `services` as parent of `software-development`)
- `path` - Auto-generated complete URL path based on the page hierarchy (e.g., `/services/software-development`)
- `breadcrumbs` - Auto-generated navigation trail showing the page's position in the hierarchy (e.g., `Services > Software Development`)
- `alternatePaths` - Auto-generated paths for different language versions, enabling multilingual support

Additionally, the plugin includes a `redirects` collection for managing URL redirects, ensuring smooth user navigation when URLs change.

[Learn more about the Pages plugin →](./pages)

### Cloudinary Plugin

[![NPM Version](https://img.shields.io/npm/v/%40jhb.software%2Fpayload-cloudinary-plugin)](https://www.npmjs.com/package/@jhb.software/payload-cloudinary-plugin)

Seamlessly integrate [Cloudinary](https://cloudinary.com/) with Payload CMS for media asset management. This plugin enables direct uploading your media files through Cloudinary's platform.

[Learn more about the Cloudinary plugin →](./cloudinary)

### SEO Plugin

[![NPM Version](https://img.shields.io/npm/v/%40jhb.software%2Fpayload-seo-plugin)](https://www.npmjs.com/package/@jhb.software/payload-seo-plugin)

Extends the official [SEO plugin](https://payloadcms.com/docs/plugins/seo) with additional features:

- AI-powered meta description generation for compelling search results
- Focus keyword tracking with intelligent warnings when keywords are missing from crucial elements (title, description, content)
- Multi-keyword support with content usage analytics

[Learn more about the SEO plugin →](./seo)
