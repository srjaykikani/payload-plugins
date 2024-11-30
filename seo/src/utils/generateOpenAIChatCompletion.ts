import OpenAI from 'openai'

/** Calls OpenAI and returns the text response. */
export async function generateOpenAIChatCompletion(body: OpenAI.Chat.ChatCompletionCreateParams) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('No OPENAI_API_KEY provided')
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const chatCompletion = (await openai.chat.completions.create(body, {
    stream: false,
  })) as unknown as OpenAI.Chat.ChatCompletion

  if (chatCompletion.choices.length === 0) {
    console.log(chatCompletion)
    throw new Error('No choices returned from OpenAI')
  }

  const message = chatCompletion.choices[0].message

  if (!message.content) {
    console.log(chatCompletion)
    throw new Error('No content returned from OpenAI')
  }

  console.log(
    JSON.stringify(
      {
        input: body,
        output: chatCompletion,
      },
      null,
      2,
    ),
  )

  return message.content
}
