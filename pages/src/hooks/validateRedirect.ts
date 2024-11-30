import { CollectionBeforeValidateHook } from 'payload'
import { AdminPanelError } from '../utils/AdminPanelError'

/** Hook which validates the redirect data before it is saved to ensure that no infinite redirect loops are created. */
export const validateRedirect: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  // When the fields of a redirect are edited via the local API, the sourcePath and destinationPath fields might be undefined,
  // therefore fallback to the originalDoc values in this case.
  let sourcePath = data?.sourcePath ?? originalDoc?.sourcePath
  let destinationPath = data?.destinationPath ?? originalDoc?.destinationPath

  // Check if there's already a redirect for the source path
  const existingRedirect = await req.payload.find({
    collection: 'redirects',
    where: {
      sourcePath: { equals: sourcePath },
      id: originalDoc?.id ? { not_equals: originalDoc.id } : [], // Exclude current document if editing
    },
  })

  if (existingRedirect.docs.length > 0) {
    throw new AdminPanelError('A redirect for this source path already exists.', 409)
  }

  // Check for opposite redirects to prevent infinite redirect loops
  const oppositeRedirectStart = await req.payload.find({
    collection: 'redirects',
    where: {
      // NOTE: To also account for transitive redirects, check both directions separately using the "or" clause
      or: [
        { sourcePath: { equals: destinationPath } },
        { destinationPath: { equals: sourcePath } },
      ],
      id: originalDoc?.id ? { not_equals: originalDoc.id } : [], // Exclude current document if editing
    },
  })

  // because of the "or" clause, we need to check if the length is >= 2 instead of > 0
  if (oppositeRedirectStart.docs.length >= 2) {
    throw new AdminPanelError(
      'A redirect in the opposite direction already exists. Therefore this redirect would create an infinite redirect loop.',
      409,
    )
  }

  return data
}
