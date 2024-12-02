'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import { SelectFieldClientComponent } from 'payload'
import GooglePlacesAutocomplete, {
  geocodeByPlaceId,
  getLatLng,
} from 'react-google-places-autocomplete'

/**
 * A custom client component that shows the Google Places Autocomplete component and
 * fills the point and geodata fields with the received data from the Google Places API.
 */
export const GeocodingFieldComponent: SelectFieldClientComponent = ({ field, path }) => {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const pointFieldPath = path.replace('_geodata', '')

  const { value: geoData, setValue: setGeoData } = useField<string>({
    path: path,
  })
  const { setValue: setPoint } = useField<Array<number>>({ path: pointFieldPath })

  return (
    <div style={{ width: '100%' }}>
      <FieldLabel path={path} label={field.label} />
      <GooglePlacesAutocomplete
        apiKey={API_KEY}
        selectProps={{
          value: geoData as any,
          onChange: async (geoData) => {
            if (!geoData) return

            const placeId = geoData?.value.place_id
            const geocode = (await geocodeByPlaceId(placeId)).at(0)

            if (!geocode) return
            const latLng = await getLatLng(geocode)

            setPoint([latLng.lng, latLng.lat])
            setGeoData(geoData)
          },
        }}
      />
    </div>
  )
}
