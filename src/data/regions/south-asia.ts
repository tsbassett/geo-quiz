import type { Region } from '../types'

export const southAsia: Region = {
  slug: 'south-asia',
  name: 'South Asia',
  bbox: { west: 60, south: 2, east: 98, north: 38 },
  items: [
    // Countries
    { id: 'bangladesh', label: 'Bangladesh', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Bangladesh' } },
    { id: 'bhutan', label: 'Bhutan', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Bhutan' } },
    { id: 'india', label: 'India', type: 'country', geometry: { kind: 'country', worldAtlasName: 'India' } },
    { id: 'nepal', label: 'Nepal', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Nepal' } },
    { id: 'pakistan', label: 'Pakistan', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Pakistan' } },
    { id: 'sri-lanka', label: 'Sri Lanka', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Sri Lanka' } },

    // Cities
    { id: 'delhi', label: 'Delhi', type: 'city', geometry: { kind: 'point', lonLat: [77.21, 28.61] } },
    { id: 'dhaka', label: 'Dhaka', type: 'city', geometry: { kind: 'point', lonLat: [90.41, 23.81] } },
    { id: 'karachi', label: 'Karachi', type: 'city', geometry: { kind: 'point', lonLat: [67.01, 24.86] } },
    { id: 'kolkata', label: 'Kolkata', type: 'city', accept: ['Calcutta'], geometry: { kind: 'point', lonLat: [88.36, 22.57] } },
    { id: 'lahore', label: 'Lahore', type: 'city', geometry: { kind: 'point', lonLat: [74.33, 31.55] } },
    { id: 'mumbai', label: 'Mumbai', type: 'city', accept: ['Bombay'], geometry: { kind: 'point', lonLat: [72.88, 19.08] } },

    // Rivers
    {
      id: 'brahmaputra',
      label: 'Brahmaputra River',
      type: 'river',
      // The number goes on one of the river's own points in the Assam valley, where it is
      // usually labeled (its halfway point is up in the far eastern bend).
      markerLonLat: [91.8, 26.2],
      geometry: {
        kind: 'line',
        coords: [[82.0, 30.4], [85.5, 29.5], [88.5, 29.3], [92.0, 29.3], [94.8, 28.5], [95.3, 27.7], [94.0, 26.9], [91.8, 26.2], [89.7, 25.8], [89.6, 24.5], [90.3, 23.8], [90.6, 22.9]],
      },
    },
    {
      id: 'ganges',
      label: 'Ganges River',
      type: 'river',
      geometry: {
        kind: 'line',
        coords: [[78.9, 30.1], [80.3, 28.9], [82.0, 27.5], [83.9, 25.8], [85.1, 25.6], [87.0, 25.3], [88.1, 24.5], [88.4, 23.5], [89.5, 23.0], [90.4, 22.4]],
      },
    },
    {
      id: 'indus',
      label: 'Indus River',
      type: 'river',
      geometry: {
        kind: 'line',
        coords: [[81.2, 31.5], [78.0, 33.5], [75.0, 34.5], [72.9, 34.0], [71.5, 32.5], [71.0, 30.0], [70.5, 28.0], [69.0, 26.5], [68.3, 25.4], [67.6, 24.2]],
      },
    },

    // Mountains, plateaus, and deserts
    {
      id: 'himalayas',
      label: 'Himalayan Mountains',
      type: 'mountains',
      accept: ['Himalayas', 'Himalaya'],
      geometry: {
        kind: 'polygon',
        coords: [[73.5, 34.8], [78.0, 32.5], [82.0, 30.5], [86.0, 28.6], [89.5, 28.2], [92.5, 28.2], [95.0, 28.8], [94.5, 27.6], [91.5, 26.9], [88.0, 27.2], [84.5, 28.2], [80.5, 29.3], [76.5, 31.8], [73.0, 33.8]],
      },
    },
    {
      id: 'karakoram',
      label: 'Karakoram Mountains',
      type: 'mountains',
      accept: ['Karakoram'],
      geometry: {
        kind: 'polygon',
        coords: [[74.0, 36.5], [76.5, 36.2], [78.5, 35.5], [79.5, 34.8], [78.0, 34.5], [76.0, 35.2], [74.0, 35.8]],
      },
    },
    {
      id: 'deccan',
      label: 'Deccan Plateau',
      type: 'plateau',
      geometry: {
        kind: 'polygon',
        coords: [[73.5, 19.5], [77.5, 20.0], [80.5, 19.0], [81.0, 16.0], [79.0, 13.0], [76.5, 12.5], [74.5, 14.5], [73.5, 17.0]],
      },
    },
    {
      id: 'thar',
      label: 'Great Thar Desert',
      type: 'desert',
      accept: ['Thar Desert', 'Thar'],
      geometry: {
        kind: 'polygon',
        coords: [[69.5, 28.8], [72.0, 29.2], [74.0, 28.5], [74.5, 26.5], [73.0, 25.0], [70.8, 24.8], [69.3, 26.0], [68.8, 27.5]],
      },
    },

    // Seas
    { id: 'arabian-sea', label: 'Arabian Sea', type: 'sea', geometry: { kind: 'point', lonLat: [64.0, 16.0] } },
    { id: 'bay-of-bengal', label: 'Bay of Bengal', type: 'sea', geometry: { kind: 'point', lonLat: [88.0, 15.0] } },
  ],
}
