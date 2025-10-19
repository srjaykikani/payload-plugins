# AI Alt Text Generation Plugin for Payload CMS

Generate AI-powered alt text for images using OpenAI's Vision API.

## Installation

```bash
pnpm add @jhb.software/payload-ai-alt-text-plugin
```

## Setup

### 1. Add plugin to Payload config

```typescript
import { payloadAiAltTextPlugin } from '@jhb.software/payload-ai-alt-text-plugin'

export default buildConfig({
  plugins: [
    payloadAiAltTextPlugin({}),
  ],
})
```

### 2. Environment Variables

```bash
# Required
OPENAI_API_KEY=your-openai-api-key

# Optional (with defaults)
NEXT_PUBLIC_CMS_URL=https://your-cms-url.com  # For image URL generation
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini          # Options: gpt-4o-mini, gpt-4o-2024-08-06 (default: gpt-4o-mini)
OPENAI_CONCURRENCY=16                          # Max concurrent requests for bulk generation (default: 16)
```

### 3. Add field to media collection

```typescript
import { aiAltTextField, injectBulkGenerateButton } from '@jhb.software/payload-ai-alt-text-plugin'

const Media = injectBulkGenerateButton({
  slug: 'media',
  upload: true,
  fields: [
    aiAltTextField({
      localized: true,
    }),
    // other fields
  ],
})
```

## Usage

**Single Generation:**
1. Edit an image document
2. Click "AI-Generate" button next to alt text field
3. Review and save

**Bulk Generation:**
1. Go to media list view
2. Select multiple images
3. Click "AI-Generate for X images"

## Configuration

### Plugin Options

```typescript
payloadAiAltTextPlugin({
  enabled: true,                           // Enable/disable the plugin (default: true)
  defaultModel: 'gpt-4o-mini',            // Default OpenAI model (default: 'gpt-4o-mini')
  maxConcurrency: 16,                      // Max concurrent requests for bulk operations (default: 16)
  models: ['gpt-4o-mini', 'gpt-4o-2024-08-06'], // Allowed models (default: both)
})
```

**Configuration Priority:**
1. Environment variables (highest priority)
   - `NEXT_PUBLIC_OPENAI_MODEL` - Overrides `defaultModel`
   - `OPENAI_CONCURRENCY` - Overrides `maxConcurrency`
2. Plugin config options
3. Built-in defaults (lowest priority)

### Field Options

```typescript
aiAltTextField({
  label: 'Image Description',
  required: true,
  localized: true,
})
```

### Runtime Configuration

Configure behavior via environment variables:

- `NEXT_PUBLIC_OPENAI_MODEL` - Choose between `gpt-4o-mini` (faster, cheaper) or `gpt-4o-2024-08-06` (more accurate)
- `OPENAI_CONCURRENCY` - Adjust concurrent requests for bulk operations (higher = faster but more API load)

## License

MIT
