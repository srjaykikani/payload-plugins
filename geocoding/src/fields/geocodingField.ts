import { Field } from 'payload'
import { GeoCodingFieldConfig } from '../types/GeoCodingFieldConfig'

/**
 * Creates a row field containing:
 * 1. The provided point field for storing the coordinates from the Google Places API
 * 2. A JSON field that stores the raw Google Places API geocoding data
 */
export const geocodingField = (config: GeoCodingFieldConfig): Field => {
  return {
    type: 'row',
    fields: [
      {
        name: config.pointField.name + '_geodata',
        type: 'json',
        label: config.geoDataFieldOverride?.label ?? 'Location',
        access: config.geoDataFieldOverride?.access ?? {},
        admin: {
          // overridable props:
          readOnly: true,

          ...config.geoDataFieldOverride?.admin,

          // non-overridable props:
          components: {
            Field: 'payload-plugin-template/client#GeocodingFieldComponent',
          },
        },
      },
      config.pointField,
    ],
  }
}
