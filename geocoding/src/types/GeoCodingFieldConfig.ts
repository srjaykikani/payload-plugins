import { JSONField, PointField } from 'payload'

/** Configuration for the geocoding fields. */
export type GeoCodingFieldConfig = {
  pointField: PointField
  geoDataFieldOverride?: {
    label?: string
    access?: JSONField['access']
    admin?: JSONField['admin']
  }
}
