import { asPageCollectionConfigOrThrow } from '../../collections/PageCollectionConfig'
import { PageCollectionConfigAttributes } from '../../types/PageCollectionConfigAttributes'
import { useCollectionConfig } from './useCollectionConfig'

/**
 * Returns the PageCollectionConfigAttributes for the collection of the document.
 */
export function usePageCollectionConfigAttributes(): PageCollectionConfigAttributes {
  const collection = useCollectionConfig()

  return asPageCollectionConfigOrThrow(collection).page
}
