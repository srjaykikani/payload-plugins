import { CheckboxFieldServerComponent } from 'payload'
import { IsRootPageStatus } from '../client/IsRootPageStatus.js'

/**
 * Field which fetches the root page and forwards the result to the `IsRootPageStatus` client component.
 */
export const IsRootPageField: CheckboxFieldServerComponent = async ({
  clientField,
  path,
  field,
  collectionSlug,
  payload,
}) => {
  const response = await payload.find({
    limit: 1,
    draft: true,
    pagination: false,
    collection: collectionSlug,
    where: {
      isRootPage: { equals: true },
    },
    select: {
      isRootPage: true,
    },
  })

  const hasRootPage = response.docs.length > 0

  return (
    <IsRootPageStatus
      field={clientField}
      path={(path as string | undefined) ?? field?.name!}
      hasRootPage={hasRootPage}
    />
  )
}
