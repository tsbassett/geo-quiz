import type { Region } from '../types'

export const southeastAsiaOceania: Region = {
  slug: 'southeast-asia-oceania',
  name: 'Southeast Asia and Oceania',
  // The east edge (182°) is just past the 180° line, so the map reaches a little beyond it.
  bbox: { west: 90, south: -50, east: 182, north: 30 },
  items: [
    // Countries
    { id: 'australia', label: 'Australia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Australia' } },
    { id: 'cambodia', label: 'Cambodia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Cambodia' } },
    { id: 'indonesia', label: 'Indonesia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Indonesia' } },
    { id: 'laos', label: 'Laos', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Laos' } },
    { id: 'malaysia', label: 'Malaysia', type: 'country', accept: ['Malasia'], geometry: { kind: 'country', worldAtlasName: 'Malaysia' } },
    { id: 'myanmar', label: 'Myanmar', type: 'country', accept: ['Burma'], geometry: { kind: 'country', worldAtlasName: 'Myanmar' } },
    { id: 'new-zealand', label: 'New Zealand', type: 'country', geometry: { kind: 'country', worldAtlasName: 'New Zealand' } },
    {
      id: 'papua-new-guinea',
      label: 'Papua New Guinea',
      type: 'country',
      accept: ['Papau New Guinea'],
      geometry: { kind: 'country', worldAtlasName: 'Papua New Guinea' },
    },
    { id: 'philippines', label: 'Philippines', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Philippines' } },
    {
      id: 'singapore',
      label: 'Singapore',
      type: 'country',
      // Too small to see as a shape, so a diamond marker is drawn here too.
      geometry: { kind: 'country', worldAtlasName: 'Singapore', dotLonLat: [103.82, 1.35] },
    },
    { id: 'thailand', label: 'Thailand', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Thailand' } },
    { id: 'vietnam', label: 'Vietnam', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Vietnam' } },

    // Cities
    { id: 'bangkok', label: 'Bangkok', type: 'city', geometry: { kind: 'point', lonLat: [100.5, 13.75] } },
    { id: 'hanoi', label: 'Hanoi', type: 'city', geometry: { kind: 'point', lonLat: [105.85, 21.03] } },
    {
      id: 'ho-chi-minh-city',
      label: 'Ho Chi Minh City',
      type: 'city',
      accept: ['Saigon'],
      geometry: { kind: 'point', lonLat: [106.63, 10.82] },
    },
    { id: 'jakarta', label: 'Jakarta', type: 'city', geometry: { kind: 'point', lonLat: [106.85, -6.21] } },
    { id: 'kuala-lumpur', label: 'Kuala Lumpur', type: 'city', geometry: { kind: 'point', lonLat: [101.69, 3.14] } },
    { id: 'manila', label: 'Manila', type: 'city', accept: ['Manilla'], geometry: { kind: 'point', lonLat: [120.98, 14.6] } },
    { id: 'melbourne', label: 'Melbourne', type: 'city', geometry: { kind: 'point', lonLat: [144.96, -37.81] } },
    { id: 'sydney', label: 'Sydney', type: 'city', geometry: { kind: 'point', lonLat: [151.21, -33.87] } },
    {
      id: 'yangon',
      label: 'Yangon',
      type: 'city',
      accept: ['Yangoon', 'Rangoon'],
      geometry: { kind: 'point', lonLat: [96.16, 16.87] },
    },

    // Rivers
    {
      id: 'mekong',
      label: 'Mekong River',
      type: 'river',
      accept: ['Mekong'],
      geometry: {
        kind: 'line',
        coords: [[98.0, 24.0], [100.2, 21.8], [100.9, 20.3], [102.1, 18.2], [103.8, 16.5], [105.0, 15.0], [105.8, 13.5], [105.3, 12.0], [106.0, 10.8], [106.5, 9.8]],
      },
    },

    // Reefs
    {
      id: 'great-barrier-reef',
      label: 'Great Barrier Reef',
      type: 'reef',
      geometry: {
        kind: 'polygon',
        coords: [[145.3, -14.5], [146.5, -16.5], [148.0, -18.5], [149.8, -20.5], [151.5, -22.5], [152.6, -23.5], [151.5, -23.0], [149.5, -21.0], [147.5, -19.0], [146.0, -17.0], [144.8, -14.8]],
      },
    },

    // Seas
    { id: 'coral-sea', label: 'Coral Sea', type: 'sea', geometry: { kind: 'point', lonLat: [153.0, -18.0] } },
    { id: 'south-china-sea', label: 'South China Sea', type: 'sea', geometry: { kind: 'point', lonLat: [114.0, 13.0] } },
  ],
}
