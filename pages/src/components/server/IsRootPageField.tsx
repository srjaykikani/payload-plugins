import { CheckboxFieldServerComponent, serverProps, Where } from 'payload'
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
  req,
  // @ts-expect-error: TODO: extend the CheckboxFieldServerComponent type to allow passing the baseFilter
  baseFilter,
}) => {
  const baseFilterWhere: Where | undefined =
    typeof baseFilter === 'function' ? baseFilter({ req }) : undefined

  const response = await payload.count({
    collection: collectionSlug,
    where: {
      and: [{ isRootPage: { equals: true } }, { ...baseFilterWhere }],
    },
  })

  const hasRootPage = response.totalDocs > 0

  return (
    <IsRootPageStatus
      field={clientField}
      path={(path as string | undefined) ?? field?.name!}
      hasRootPage={hasRootPage}
    />
  )
}
