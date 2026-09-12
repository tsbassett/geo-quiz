import type { Region } from '../types'

export const latinAmerica: Region = {
  slug: 'latin-america',
  name: 'Latin America',
  bbox: { west: -120, south: -58, east: -30, north: 34 },
  items: [
    // Countries (the tiny ones also get a diamond marker, like Singapore)
    { id: 'argentina', label: 'Argentina', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Argentina' } },
    { id: 'bolivia', label: 'Bolivia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Bolivia' } },
    { id: 'brazil', label: 'Brazil', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Brazil' } },
    { id: 'chile', label: 'Chile', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Chile' } },
    { id: 'colombia', label: 'Colombia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Colombia' } },
    { id: 'cuba', label: 'Cuba', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Cuba' } },
    {
      id: 'dominican-republic',
      label: 'Dominican Republic',
      type: 'country',
      geometry: { kind: 'country', worldAtlasName: 'Dominican Rep.', dotLonLat: [-70.2, 18.8] },
    },
    { id: 'ecuador', label: 'Ecuador', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Ecuador' } },
    { id: 'haiti', label: 'Haiti', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Haiti', dotLonLat: [-72.4, 19.0] } },
    { id: 'jamaica', label: 'Jamaica', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Jamaica', dotLonLat: [-77.3, 18.1] } },
    { id: 'mexico', label: 'Mexico', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Mexico' } },
    {
      id: 'panama',
      label: 'Panama',
      type: 'country',
      // Diamond in western Panama, so it doesn't sit on top of the Panama Canal.
      geometry: { kind: 'country', worldAtlasName: 'Panama', dotLonLat: [-81.2, 8.4] },
    },
    { id: 'paraguay', label: 'Paraguay', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Paraguay' } },
    { id: 'peru', label: 'Peru', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Peru' } },
    {
      id: 'puerto-rico',
      label: 'Puerto Rico',
      type: 'country',
      geometry: { kind: 'country', worldAtlasName: 'Puerto Rico', dotLonLat: [-66.5, 18.2] },
    },
    { id: 'venezuela', label: 'Venezuela', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Venezuela' } },
    { id: 'uruguay', label: 'Uruguay', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Uruguay' } },

    // Cities
    { id: 'bogota', label: 'Bogota', type: 'city', geometry: { kind: 'point', lonLat: [-74.07, 4.71] } },
    { id: 'lima', label: 'Lima', type: 'city', geometry: { kind: 'point', lonLat: [-77.04, -12.05] } },
    { id: 'mexico-city', label: 'Mexico City', type: 'city', geometry: { kind: 'point', lonLat: [-99.13, 19.43] } },
    { id: 'port-au-prince', label: 'Port-au-Prince', type: 'city', geometry: { kind: 'point', lonLat: [-72.34, 18.54] } },
    { id: 'rio-de-janeiro', label: 'Rio de Janeiro', type: 'city', geometry: { kind: 'point', lonLat: [-43.2, -22.91] } },
    { id: 'santiago', label: 'Santiago', type: 'city', geometry: { kind: 'point', lonLat: [-70.67, -33.45] } },
    { id: 'santo-domingo', label: 'Santo Domingo', type: 'city', geometry: { kind: 'point', lonLat: [-69.93, 18.49] } },
    { id: 'sao-paulo', label: 'Sao Paulo', type: 'city', geometry: { kind: 'point', lonLat: [-46.63, -23.55] } },

    // Rivers
    {
      id: 'amazon',
      label: 'Amazon River',
      type: 'river',
      accept: ['Amazon'],
      geometry: {
        kind: 'line',
        coords: [[-73.5, -4.5], [-70.0, -4.2], [-66.0, -3.5], [-62.0, -3.3], [-58.5, -3.2], [-55.0, -2.6], [-51.8, -1.9], [-49.5, -1.5]],
      },
    },
    {
      id: 'orinoco',
      label: 'Orinoco River',
      type: 'river',
      accept: ['Orinoco'],
      geometry: {
        kind: 'line',
        coords: [[-66.0, 2.5], [-67.5, 4.0], [-67.8, 6.2], [-66.5, 8.0], [-64.5, 8.4], [-62.5, 8.4], [-61.0, 8.8]],
      },
    },
    {
      id: 'parana',
      label: 'Parana River',
      type: 'river',
      accept: ['Paraná', 'Parana'],
      geometry: {
        kind: 'line',
        coords: [[-51.0, -20.0], [-52.5, -22.5], [-54.5, -25.0], [-56.5, -27.5], [-58.2, -30.0], [-58.5, -32.5], [-58.4, -34.0]],
      },
    },

    // Canals
    {
      id: 'panama-canal',
      label: 'Panama Canal',
      type: 'canal',
      geometry: { kind: 'line', coords: [[-79.92, 9.36], [-79.75, 9.15], [-79.62, 8.98]] },
    },

    // Mountains
    {
      id: 'andes',
      label: 'Andes Mountains',
      type: 'mountains',
      accept: ['Andes'],
      geometry: {
        kind: 'polygon',
        coords: [[-71.5, 10.0], [-73.5, 5.0], [-77.0, -2.0], [-78.5, -9.0], [-70.5, -16.0], [-68.0, -22.0], [-69.5, -30.0], [-70.5, -38.0], [-72.0, -45.0], [-73.5, -52.0], [-71.5, -52.0], [-70.0, -45.0], [-68.5, -38.0], [-67.5, -30.0], [-65.5, -22.0], [-67.5, -16.0], [-75.5, -9.0], [-74.5, -2.0], [-71.0, 5.0], [-69.5, 10.0]],
      },
    },

    // Seas
    { id: 'caribbean-sea', label: 'Caribbean Sea', type: 'sea', geometry: { kind: 'point', lonLat: [-75.0, 15.0] } },
  ],
}
