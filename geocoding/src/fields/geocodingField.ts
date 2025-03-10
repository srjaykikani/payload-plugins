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
    admin: {
      position: config.pointField.admin?.position ?? undefined,
    },
    fields: [
      {
        name: config.pointField.name + '_googlePlacesData',
        type: 'json',
        label: config.geoDataFieldOverride?.label ?? 'Location',
        access: config.geoDataFieldOverride?.access ?? {},
        required: config.geoDataFieldOverride?.required,

        admin: {
          // overridable props:
          readOnly: true,

          ...config.geoDataFieldOverride?.admin,

          // non-overridable props:
          components: {
            Field: '@jhb.software/payload-geocoding-plugin/client#GeocodingFieldComponent',
          },
        },
      },
      // Inject two hooks to normalize the point field:
      // 1. Before change: If no value is provided, default to [0, 0]
      // 2. After read: If the value is [0, 0], return null
      config.normalizeUndefinedPoint
        ? {
            ...config.pointField,
            hooks: {
              ...config.pointField.hooks,
              beforeChange: [
                ...(config.pointField.hooks?.beforeChange ?? []),
                ({ value }) => (!value ? [0, 0] : value),
              ],
              afterRead: [
                ...(config.pointField.hooks?.afterRead ?? []),
                ({ value }) =>
                  !value || (Array.isArray(value) && value[0] === 0 && value[1] === 0)
                    ? null
                    : value,
              ],
            },
          }
        : config.pointField,
    ],
  }
}
