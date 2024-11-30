import { CollectionSlug } from 'payload'
import { Locale } from '../types/Locale'

/** Recursively get all parent documents of a document. */
export const getParents = async (
  req: any,
  locale: Locale | 'all',
  parentField: string,
  collection: CollectionSlug,
  doc: Record<string, unknown>,
  docs: Array<Record<string, unknown>> = [],
): Promise<Array<Record<string, unknown>>> => {
  const parent = doc[parentField]
  let retrievedParent

  if (parent) {
    // If not auto-populated, and we have an ID
    if (typeof parent === 'string' || typeof parent === 'number') {
      retrievedParent = req
        ? await req.payload.findByID({
            id: parent,
            collection: collection,
            depth: 0,
            disableErrors: true,
            locale: locale,
            // TODO: use select here to improve performance
            // IMPORTANT: do not pass the req here, otherwise there will be issues with the locale flattening
          })
        : await fetchPayloadRestApi(`/${collection}/${parent}`, {
            depth: 0,
            locale: locale,
          })
    }

    // If auto-populated
    if (typeof parent === 'object') {
      retrievedParent = parent
    }

    if (retrievedParent) {
      if (retrievedParent.parent) {
        return getParents(req, locale, 'parent', 'pages', retrievedParent, [
          retrievedParent,
          ...docs,
        ])
      }

      return [retrievedParent, ...docs]
    }
  }

  return docs
}

/** Fetches a document via the Payload REST API. This should only be used if the local API is not available. */
async function fetchPayloadRestApi(path: string, options: Record<string, any>) {
  const response = await fetch('/api' + path + '?' + new URLSearchParams(options), {
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
