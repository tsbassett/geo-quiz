import type { Region } from '../types'

export const africa: Region = {
  slug: 'africa',
  name: 'Africa',
  bbox: { west: -20, south: -37, east: 52, north: 38 },
  items: [
    // Countries
    { id: 'angola', label: 'Angola', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Angola' } },
    { id: 'botswana', label: 'Botswana', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Botswana' } },
    { id: 'cameroon', label: 'Cameroon', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Cameroon' } },
    {
      id: 'congo',
      label: 'Congo',
      type: 'country',
      accept: ['Republic of the Congo', 'Congo Republic'],
      geometry: { kind: 'country', worldAtlasName: 'Congo' }, // the map data's name for the Republic of the Congo
    },
    {
      id: 'dr-congo',
      label: 'Democratic Republic of the Congo',
      type: 'country',
      accept: ['DRC', 'DR Congo', 'Congo-Kinshasa'],
      geometry: { kind: 'country', worldAtlasName: 'Dem. Rep. Congo' },
    },
    { id: 'ethiopia', label: 'Ethiopia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Ethiopia' } },
    { id: 'ghana', label: 'Ghana', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Ghana' } },
    { id: 'kenya', label: 'Kenya', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Kenya' } },
    { id: 'liberia', label: 'Liberia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Liberia' } },
    { id: 'madagascar', label: 'Madagascar', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Madagascar' } },
    { id: 'mali', label: 'Mali', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Mali' } },
    { id: 'mozambique', label: 'Mozambique', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Mozambique' } },
    { id: 'niger', label: 'Niger', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Niger' } },
    { id: 'nigeria', label: 'Nigeria', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Nigeria' } },
    { id: 'rwanda', label: 'Rwanda', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Rwanda' } },
    { id: 'somalia', label: 'Somalia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Somalia' } },
    { id: 'south-africa', label: 'South Africa', type: 'country', geometry: { kind: 'country', worldAtlasName: 'South Africa' } },
    { id: 'sudan', label: 'Sudan', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Sudan' } },
    { id: 'tanzania', label: 'Tanzania', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Tanzania' } },
    { id: 'uganda', label: 'Uganda', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Uganda' } },
    { id: 'zambia', label: 'Zambia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Zambia' } },
    { id: 'zimbabwe', label: 'Zimbabwe', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Zimbabwe' } },

    // Cities
    { id: 'johannesburg', label: 'Johannesburg', type: 'city', geometry: { kind: 'point', lonLat: [28.05, -26.2] } },
    { id: 'kinshasa', label: 'Kinshasa', type: 'city', geometry: { kind: 'point', lonLat: [15.31, -4.32] } },
    { id: 'lagos', label: 'Lagos', type: 'city', geometry: { kind: 'point', lonLat: [3.38, 6.52] } },
    { id: 'luanda', label: 'Luanda', type: 'city', geometry: { kind: 'point', lonLat: [13.23, -8.84] } },
    { id: 'nairobi', label: 'Nairobi', type: 'city', geometry: { kind: 'point', lonLat: [36.82, -1.29] } },

    // Rivers
    {
      id: 'congo-river',
      label: 'Congo River',
      type: 'river',
      geometry: {
        kind: 'line',
        coords: [[26.5, -11.0], [25.5, -9.0], [25.2, -6.5], [23.5, -3.5], [21.0, -1.5], [18.3, -2.0], [16.2, -3.3], [15.3, -4.3], [13.4, -5.9], [12.4, -6.1]],
      },
    },
    {
      id: 'niger-river',
      label: 'Niger River',
      type: 'river',
      geometry: {
        kind: 'line',
        coords: [[-10.5, 11.0], [-8.0, 12.5], [-5.5, 13.8], [-3.0, 15.2], [0.0, 16.3], [2.0, 15.0], [3.0, 12.5], [4.0, 10.0], [6.0, 7.8], [6.5, 5.5], [6.4, 4.5]],
      },
    },

    // Lakes (drawn as a light-blue shape; the number sits at its center)
    {
      id: 'lake-victoria',
      label: 'Lake Victoria',
      type: 'lake',
      geometry: {
        kind: 'polygon',
        coords: [[31.6, -0.4], [32.9, 0.4], [33.9, 0.1], [34.2, -1.1], [33.6, -2.3], [32.5, -2.7], [31.7, -2.2], [31.5, -1.2]],
      },
    },
  ],
}
