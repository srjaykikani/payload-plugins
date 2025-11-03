import type { ClientComponentProps, FieldPaths, ServerComponentProps } from 'payload'

import React from 'react'

import { GeocodingFieldComponent } from './GeocodingFieldComponent'

/**
 * Server component wrapper that reads the Google Maps API key from payload.config.custom
 * and passes it to the client component.
 */
export const GeocodingFieldServer: React.FC<
  ClientComponentProps & Pick<FieldPaths, 'path'> & ServerComponentProps
> = (props) => {
  const { clientField, path, payload } = props

  // Read API key from config.custom
  const googleMapsApiKey = payload.config.custom?.payloadGeocodingPlugin?.googleMapsApiKey as
    | string
    | undefined

  if (!googleMapsApiKey) {
    throw new Error(
      'Geocoding plugin API key not configured. Ensure payloadGeocodingPlugin is added to your Payload config with a googleMapsApiKey.',
    )
  }

  return (
    <GeocodingFieldComponent field={clientField} path={path} googleMapsApiKey={googleMapsApiKey} />
  )
}
