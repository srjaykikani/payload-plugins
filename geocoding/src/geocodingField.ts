import { Field } from 'payload'
import { GeoCodingFieldConfig } from './types/GeoCodingFieldConfig'

export const geocodingField = (config: GeoCodingFieldConfig): Field => {
  return {
    type: 'row',
    fields: [
      {
        name: 'address',
        type: 'select',
        options: [],
        admin: {
          components: {
            Field: 'payload-plugin-template/client#GeocodingFieldComponent',
          },
          width: '100%',
        },
      },
      config.pointField,
    ],
  }
}
