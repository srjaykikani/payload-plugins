import { asPageCollectionConfigOrThrow } from '../../../collections/PageCollectionConfig.js'
import { PageCollectionConfigAttributes } from '../../../types/PageCollectionConfigAttributes.js'
import { useCollectionConfig } from './useCollectionConfig.js'

export function usePageCollectionConfigAttributes(): PageCollectionConfigAttributes {
  const collection = useCollectionConfig()

  return asPageCollectionConfigOrThrow(collection).page
}
