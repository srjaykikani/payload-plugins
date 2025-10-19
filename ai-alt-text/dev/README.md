# AI Alt Text Plugin - Development Environment

Test environment for the AI Alt Text plugin.

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Start MongoDB:
   ```bash
   mongod --dbpath /path/to/data
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Generate types:
   ```bash
   pnpm generate:types
   ```

## Development

Start the dev server:
```bash
pnpm dev
```

Visit: http://localhost:3000/admin
- Email: dev@payloadcms.com
- Password: test

## Testing

Run tests with OpenAI mocking:
```bash
pnpm test
```

Watch mode during development:
```bash
pnpm test:watch
```

## Available Commands

- `pnpm dev` - Start Next.js dev server
- `pnpm build` - Build for production
- `pnpm test` - Run tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm generate:types` - Generate TypeScript types
- `pnpm generate:importmap` - Generate import map

## Plugin Testing

The plugin is loaded from `../src/` via workspace reference.
Changes to plugin source code will hot reload in the dev server.

### Manual Testing

1. Upload an image to Media collection
2. Click "AI-Generate" button
3. Verify alt text and keywords are generated
4. Test bulk generation by selecting multiple images

### Automated Testing

Tests mock the OpenAI API to avoid costs:
- No real API calls during tests
- Consistent, predictable responses
- Fast test execution

## Troubleshooting

**MongoDB connection failed**
- Ensure MongoDB is running: `mongod`
- Check DATABASE_URI in .env

**Plugin changes not reflecting**
- Restart dev server
- Clear .next folder: `rm -rf .next`

**Tests failing**
- Ensure .env file exists with required variables
- Check OpenAI mocking is active
- Verify MongoDB is running
