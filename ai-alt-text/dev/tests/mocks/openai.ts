import { vi } from 'vitest'

/**
 * Creates a successful alt text generation response
 */
export const mockSuccessResponse = (altText: string, keywords: string[]) => ({
  choices: [
    {
      message: {
        parsed: {
          altText,
          keywords,
        },
        role: 'assistant' as const,
        content: null,
      },
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150,
  },
  model: 'gpt-4o-mini',
})

/**
 * Creates a multi-locale response for bulk generation
 */
export const mockMultiLocaleResponse = () => ({
  choices: [
    {
      message: {
        parsed: {
          en: {
            altText: 'A beautiful mountain landscape with snow-capped peaks',
            keywords: ['mountain', 'landscape', 'snow', 'nature'],
          },
          de: {
            altText: 'Eine schöne Berglandschaft mit schneebedeckten Gipfeln',
            keywords: ['Berg', 'Landschaft', 'Schnee', 'Natur'],
          },
        },
        role: 'assistant' as const,
        content: null,
      },
    },
  ],
  usage: {
    prompt_tokens: 150,
    completion_tokens: 80,
    total_tokens: 230,
  },
  model: 'gpt-4o-mini',
})

/**
 * Mocks the OpenAI module globally
 * Call this in beforeAll to prevent real API calls
 */
export const mockOpenAI = () => {
  vi.mock('openai', () => {
    return {
      default: vi.fn().mockImplementation(() => ({
        chat: {
          completions: {
            parse: vi.fn(),
          },
        },
      })),
      APIError: class APIError extends Error {
        constructor(
          public status: number,
          public error: any,
          message: string,
          public headers: any,
        ) {
          super(message)
        }
      },
    }
  })
}
