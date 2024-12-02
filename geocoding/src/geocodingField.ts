import { Field } from 'payload'
import { GeoCodingFieldConfig } from './types/GeoCodingFieldConfig'

export const geocodingField = (config: GeoCodingFieldConfig): Field => {
  return {
    type: 'row',
    fields: [
      {
        name: 'address',
        type: 'text',
        admin: {
          width: '100%',
        },
      },
      config.pointField,
    ],
  }
}
