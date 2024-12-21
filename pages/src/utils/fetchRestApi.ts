import { stringify } from 'qs-esm'

/** Fetches a document via the Payload REST API. This should only be used if the local API is not available. */
export async function fetchRestApi(path: string, options: Record<string, any>) {
  const response = await fetch('/api' + path + '?' + stringify(options), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch the requested document via the Payload REST API. ${response.statusText}`,
    )
  }

  return await response.json()
}
