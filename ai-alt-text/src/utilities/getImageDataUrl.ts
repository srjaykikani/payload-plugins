/**
 * Fetches an image and converts it to a base64 data URL.
 * This is used for local development when the image URL is http://localhost
 * which OpenAI cannot access directly.
 */
export async function getImageDataUrl(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return `data:${contentType};base64,${base64}`
  } catch (error) {
    throw new Error(
      `Failed to convert image to base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
