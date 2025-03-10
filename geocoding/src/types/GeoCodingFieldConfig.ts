import { JSONField, PointField } from 'payload'

/** Configuration for the geocoding field. */
export type GeoCodingFieldConfig = {
  /** Field options for the point field */
  pointField: PointField

  /** Field options for the geocoding data field (with the _googlePlacesData suffix) */
  geoDataFieldOverride?: {
    required?: boolean
    label?: string
    access?: JSONField['access']
    admin?: JSONField['admin']
  }

  /**
   * When enabled, this option normalizes missing or empty geo values by storing them as [0, 0] in the database.
   *
   * This helps prevent saving errors on MongoDB when the field is optional and utilized within an array.
   * For further details, refer to the discussion at https://github.com/payloadcms/payload/discussions/11111.
   */
  normalizeUndefinedPoint?: boolean
}
