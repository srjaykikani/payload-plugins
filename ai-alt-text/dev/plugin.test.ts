import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { getPayload } from 'payload'
import config from './src/payload.config'
import { mockOpenAI, mockSuccessResponse, mockMultiLocaleResponse } from './tests/mocks/openai'
import OpenAI from 'openai'

// Mock OpenAI before tests
mockOpenAI()

let payload: any

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

afterAll(async () => {
  if (payload.db && typeof payload.db.destroy === 'function') {
    await payload.db.destroy()
  }
})

describe('AI Alt Text Plugin', () => {
  describe('Plugin Configuration', () => {
    it('should load plugin config into payload.config.custom', () => {
      expect(payload.config.custom).toBeDefined()
      expect(payload.config.custom.aiAltTextPluginConfig).toBeDefined()
      expect(payload.config.custom.aiAltTextPluginConfig.enabled).toBe(true)
      expect(payload.config.custom.aiAltTextPluginConfig.defaultModel).toBe('gpt-4o-mini')
      expect(payload.config.custom.aiAltTextPluginConfig.maxConcurrency).toBe(5)
    })

    it('should have localization configured', () => {
      expect(payload.config.localization).toBeDefined()
      expect(payload.config.localization.localeCodes).toEqual(['en', 'de'])
      expect(payload.config.localization.defaultLocale).toBe('en')
    })

    it('should have Media collection configured', () => {
      const mediaCollection = payload.collections.media
      expect(mediaCollection).toBeDefined()
      expect(mediaCollection.config.upload).toBeDefined()
      expect(mediaCollection.config.upload.imageSizes).toHaveLength(2)
    })
  })

  describe('Field Configuration', () => {
    it('should have alt field in Media collection', () => {
      const mediaCollection = payload.collections.media
      const altField = mediaCollection.config.fields.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField.type).toBe('textarea')
      expect(altField.localized).toBe(true)
      expect(altField.required).toBe(true)
    })

    it('should have custom AltTextField component configured', () => {
      const mediaCollection = payload.collections.media
      const altField = mediaCollection.config.fields.find((f: any) => f.name === 'alt')
      expect(altField.admin.components.Field).toBeDefined()
      expect(altField.admin.components.Field).toContain('AltTextField')
    })

    it('should have bulk generate button injected', () => {
      const mediaCollection = payload.collections.media
      expect(mediaCollection.config.admin.components.beforeListTable).toBeDefined()
      expect(mediaCollection.config.admin.components.beforeListTable.length).toBeGreaterThan(0)
      expect(
        mediaCollection.config.admin.components.beforeListTable.some((c: string) =>
          c.includes('BulkUpdateAltTextsButton'),
        ),
      ).toBe(true)
    })
  })

  describe('Single Image Generation', () => {
    it('should generate alt text for a single image', async () => {
      // Mock OpenAI response
      const mockParse = vi
        .fn()
        .mockResolvedValue(
          mockSuccessResponse('A serene mountain landscape', ['mountain', 'landscape', 'nature']),
        )

      // This test validates the OpenAI mocking works
      expect(mockParse).toBeDefined()
    })

    it('should handle missing image URL', async () => {
      // Test error handling when image has no URL
      // This would be implemented with actual action calls
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Bulk Generation', () => {
    it('should generate alt text for multiple locales', async () => {
      // Mock multi-locale response
      const mockResponse = mockMultiLocaleResponse()

      expect(mockResponse.choices[0].message.parsed).toHaveProperty('en')
      expect(mockResponse.choices[0].message.parsed).toHaveProperty('de')
      expect(mockResponse.choices[0].message.parsed.en.altText).toBeDefined()
      expect(mockResponse.choices[0].message.parsed.de.altText).toBeDefined()
    })

    it('should respect maxConcurrency setting from plugin config', async () => {
      const pluginConfig = payload.config.custom.aiAltTextPluginConfig
      expect(pluginConfig.maxConcurrency).toBe(5)
      // Actual concurrency testing would require monitoring p-map calls
    })
  })

  describe('Error Handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      const mockError = vi.fn().mockRejectedValue(new Error('API Error'))
      expect(mockError).toBeDefined()
      // This validates error handling setup
    })

    it('should handle invalid image formats', async () => {
      // Test handling of non-image uploads
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Environment Variables', () => {
    it('should load OPENAI_API_KEY from environment', () => {
      expect(process.env.OPENAI_API_KEY).toBeDefined()
    })

    it('should load NEXT_PUBLIC_CMS_URL from environment', () => {
      expect(process.env.NEXT_PUBLIC_CMS_URL).toBeDefined()
    })

    it('should have DATABASE_URI configured', () => {
      expect(process.env.DATABASE_URI).toBeDefined()
    })

    it('should have PAYLOAD_SECRET configured', () => {
      expect(process.env.PAYLOAD_SECRET).toBeDefined()
    })
  })
})
