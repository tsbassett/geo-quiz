import type { Region } from '../types'

export const middleEastNorthAfrica: Region = {
  slug: 'middle-east-north-africa',
  name: 'Middle East and North Africa',
  bbox: { west: -18, south: 8, east: 78, north: 45 },
  items: [
    // Countries
    { id: 'afghanistan', label: 'Afghanistan', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Afghanistan' } },
    { id: 'algeria', label: 'Algeria', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Algeria' } },
    { id: 'egypt', label: 'Egypt', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Egypt' } },
    { id: 'iran', label: 'Iran', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Iran' } },
    { id: 'iraq', label: 'Iraq', type: 'country', accept: ['Irag'], geometry: { kind: 'country', worldAtlasName: 'Iraq' } },
    {
      id: 'israel',
      label: 'Israel',
      type: 'country',
      // Israel's center falls inside the West Bank (a separate shape in the map data),
      // so its number goes in the northern Negev, where Israel is widest.
      markerLonLat: [34.8, 30.8],
      geometry: { kind: 'country', worldAtlasName: 'Israel' },
    },
    { id: 'jordan', label: 'Jordan', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Jordan' } },
    { id: 'kuwait', label: 'Kuwait', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Kuwait' } },
    { id: 'libya', label: 'Libya', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Libya' } },
    { id: 'lebanon', label: 'Lebanon', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Lebanon' } },
    { id: 'morocco', label: 'Morocco', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Morocco' } },
    { id: 'oman', label: 'Oman', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Oman' } },
    { id: 'qatar', label: 'Qatar', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Qatar' } },
    { id: 'saudi-arabia', label: 'Saudi Arabia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Saudi Arabia' } },
    { id: 'syria', label: 'Syria', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Syria' } },
    { id: 'turkey', label: 'Turkey', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Turkey' } },
    { id: 'tunisia', label: 'Tunisia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Tunisia' } },
    {
      id: 'uae',
      label: 'United Arab Emirates',
      type: 'country',
      accept: ['UAE'],
      geometry: { kind: 'country', worldAtlasName: 'United Arab Emirates' },
    },
    { id: 'yemen', label: 'Yemen', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Yemen' } },

    // Cities
    { id: 'baghdad', label: 'Baghdad', type: 'city', geometry: { kind: 'point', lonLat: [44.36, 33.31] } },
    { id: 'cairo', label: 'Cairo', type: 'city', geometry: { kind: 'point', lonLat: [31.24, 30.04] } },
    { id: 'dubai', label: 'Dubai', type: 'city', geometry: { kind: 'point', lonLat: [55.27, 25.2] } },
    { id: 'istanbul', label: 'Istanbul', type: 'city', geometry: { kind: 'point', lonLat: [28.98, 41.01] } },
    { id: 'jerusalem', label: 'Jerusalem', type: 'city', geometry: { kind: 'point', lonLat: [35.21, 31.77] } },
    { id: 'tehran', label: 'Tehran', type: 'city', geometry: { kind: 'point', lonLat: [51.39, 35.69] } },

    // Rivers
    {
      id: 'nile',
      label: 'Nile River',
      type: 'river',
      geometry: {
        kind: 'line',
        coords: [[32.6, 15.6], [32.5, 18.0], [31.3, 20.5], [30.6, 23.0], [32.9, 24.1], [32.9, 26.5], [31.8, 28.5], [31.2, 30.0], [31.0, 31.4]],
      },
    },
    {
      // One path for both rivers (an item can only have one line).
      id: 'tigris-euphrates',
      label: 'Tigris and Euphrates Rivers',
      type: 'river',
      accept: ['Tigris and Euphrates', 'Tigris', 'Euphrates', 'Tigris River', 'Euphrates River'],
      geometry: {
        kind: 'line',
        coords: [[38.7, 38.3], [39.8, 36.9], [40.5, 35.5], [42.4, 34.3], [43.8, 32.9], [45.3, 31.6], [46.5, 30.9], [47.4, 30.4]],
      },
    },

    // Mountains and deserts
    {
      id: 'hindu-kush',
      label: 'Hindu Kush Mountains',
      type: 'mountains',
      accept: ['Hindu Kush'],
      geometry: {
        kind: 'polygon',
        coords: [[65.5, 34.0], [68.0, 34.8], [70.5, 35.8], [71.5, 36.5], [70.0, 36.8], [67.5, 36.0], [65.0, 35.0]],
      },
    },
    {
      id: 'sahara',
      label: 'Sahara Desert',
      type: 'desert',
      accept: ['Sahara'],
      geometry: {
        kind: 'polygon',
        coords: [[-12.0, 27.0], [-5.0, 30.0], [5.0, 31.0], [15.0, 30.5], [25.0, 29.0], [32.0, 27.0], [33.0, 21.0], [25.0, 17.5], [15.0, 16.0], [5.0, 16.0], [-5.0, 17.5], [-14.0, 21.0]],
      },
    },
  ],
}
