import type { Region } from '../types'

export const easternEurope: Region = {
  slug: 'eastern-europe',
  name: 'Eastern Europe',
  bbox: { west: 10, south: 33, east: 70, north: 72 },
  items: [
    // Countries
    { id: 'albania', label: 'Albania', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Albania' } },
    { id: 'belarus', label: 'Belarus', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Belarus' } },
    {
      id: 'bosnia-herzegovina',
      label: 'Bosnia-Herzegovina',
      type: 'country',
      accept: ['Bosnia and Herzegovina', 'Bosnia'],
      geometry: { kind: 'country', worldAtlasName: 'Bosnia and Herz.' },
    },
    { id: 'bulgaria', label: 'Bulgaria', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Bulgaria' } },
    { id: 'croatia', label: 'Croatia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Croatia' } },
    {
      id: 'czech-republic',
      label: 'Czech Republic',
      type: 'country',
      accept: ['Czechia'],
      geometry: { kind: 'country', worldAtlasName: 'Czechia' },
    },
    { id: 'estonia', label: 'Estonia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Estonia' } },
    { id: 'greece', label: 'Greece', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Greece' } },
    { id: 'hungary', label: 'Hungary', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Hungary' } },
    { id: 'latvia', label: 'Latvia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Latvia' } },
    { id: 'lithuania', label: 'Lithuania', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Lithuania' } },
    { id: 'poland', label: 'Poland', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Poland' } },
    { id: 'romania', label: 'Romania', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Romania' } },
    {
      id: 'russia',
      label: 'Russia',
      type: 'country',
      // Russia's center is in Siberia, far off this map, so its number goes in European Russia.
      markerLonLat: [47.0, 61.5],
      geometry: { kind: 'country', worldAtlasName: 'Russia' },
    },
    { id: 'serbia', label: 'Serbia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Serbia' } },
    { id: 'ukraine', label: 'Ukraine', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Ukraine' } },

    // Capitals
    { id: 'prague', label: 'Prague', type: 'city', geometry: { kind: 'point', lonLat: [14.42, 50.09] } },
    { id: 'athens', label: 'Athens', type: 'city', geometry: { kind: 'point', lonLat: [23.73, 37.98] } },
    { id: 'budapest', label: 'Budapest', type: 'city', geometry: { kind: 'point', lonLat: [19.04, 47.5] } },
    { id: 'moscow', label: 'Moscow', type: 'city', geometry: { kind: 'point', lonLat: [37.62, 55.76] } },
    { id: 'kiev', label: 'Kiev', type: 'city', accept: ['Kyiv'], geometry: { kind: 'point', lonLat: [30.52, 50.45] } },

    // Rivers
    {
      id: 'danube',
      label: 'Danube River',
      type: 'river',
      accept: ['Danube'],
      geometry: {
        kind: 'line',
        coords: [[8.6, 48.1], [10.9, 48.7], [13.4, 48.6], [16.4, 48.1], [18.8, 47.8], [19.0, 46.2], [20.3, 44.8], [22.6, 44.6], [25.4, 43.7], [27.9, 44.0], [28.7, 45.2]],
      },
    },
    {
      id: 'volga',
      label: 'Volga River',
      type: 'river',
      accept: ['Volga'],
      geometry: {
        kind: 'line',
        coords: [[32.5, 57.2], [35.9, 57.6], [39.4, 57.8], [43.0, 56.3], [46.0, 56.3], [48.4, 55.7], [49.2, 53.5], [47.5, 51.5], [45.0, 48.7], [46.3, 46.4], [47.6, 46.0]],
      },
    },

    // Seas
    { id: 'baltic-sea', label: 'Baltic Sea', type: 'sea', geometry: { kind: 'point', lonLat: [19.5, 57.5] } },
    { id: 'black-sea', label: 'Black Sea', type: 'sea', geometry: { kind: 'point', lonLat: [34.0, 43.3] } },
    { id: 'aegean-sea', label: 'Aegean Sea', type: 'sea', geometry: { kind: 'point', lonLat: [25.0, 38.5] } },
    { id: 'adriatic-sea', label: 'Adriatic Sea', type: 'sea', geometry: { kind: 'point', lonLat: [16.0, 42.5] } },
  ],
}
