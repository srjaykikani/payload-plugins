# Changelog

## 0.2.0

### Breaking Changes

- **BREAKING**: Google Maps API key is now required as a plugin configuration option instead of environment variable

### Migration from v0.1.x

If you're upgrading from a version that used environment variables directly:

```ts
// Before (old version):
plugins: [payloadGeocodingPlugin({})]
// Required NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env

// After (new version):
plugins: [
  payloadGeocodingPlugin({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })
]
// API key passed directly to plugin
```

## 0.1.6

- fix: display asterisk for required geodata fields in UI ([87413ba](https://github.com/jhb-software/payload-plugins/commit/87413bac8c3f03ec257ac47de979413930816ee8))

## 0.1.0

- Initial release
