'use server'

import type { BasePayload } from 'payload'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

/** Gets the currently authenticated user from request headers. */
export async function getUserFromHeaders({ payload }: { payload?: BasePayload }) {
  const headersList = await headers()

  if (!payload) {
    payload = await getPayload({ config: await import('@payload-config') })
  }

  const { user } = await payload.auth({ headers: headersList })

  return user
}
