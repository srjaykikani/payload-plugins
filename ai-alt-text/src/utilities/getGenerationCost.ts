import type OpenAI from 'openai'

type GenerationCost = {
  model: string
  inputCost: number
  outputCost: number
  totalCost: number
  totalTokens: number
}

const MODEL_COSTS = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 }, // per 1M tokens
  'gpt-4o-2024-08-06': { input: 2.5, output: 10 },
} as const

/** Calculates and returns the cost of an OpenAI generation. */
export function getGenerationCost(
  response: OpenAI.Chat.Completions.ChatCompletion,
  model: string,
): GenerationCost {
  const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS] ?? {
    input: 0,
    output: 0,
  }

  const inputTokens = response.usage?.prompt_tokens ?? 0
  const outputTokens = response.usage?.completion_tokens ?? 0
  const totalTokens = response.usage?.total_tokens ?? 0

  const inputCost = (inputTokens / 1_000_000) * costs.input
  const outputCost = (outputTokens / 1_000_000) * costs.output
  const totalCost = inputCost + outputCost

  return {
    model,
    inputCost,
    outputCost,
    totalCost,
    totalTokens,
  }
}
