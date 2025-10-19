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
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_CMS_URL=https://your-cms-url.com
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

```typescript
payloadAiAltTextPlugin({
  enabled: true,
  defaultModel: 'gpt-4o-mini',
  maxConcurrency: 16,
})

aiAltTextField({
  label: 'Image Description',
  required: true,
  localized: true,
})
```

## License

MIT
