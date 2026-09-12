import type { Region } from '../types'

export const eastAsia: Region = {
  slug: 'east-asia',
  name: 'East Asia',
  bbox: { west: 73, south: 18, east: 146, north: 54 },
  items: [
    // Countries
    { id: 'china', label: 'China', type: 'country', geometry: { kind: 'country', worldAtlasName: 'China' } },
    { id: 'japan', label: 'Japan', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Japan' } },
    { id: 'mongolia', label: 'Mongolia', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Mongolia' } },
    { id: 'north-korea', label: 'North Korea', type: 'country', geometry: { kind: 'country', worldAtlasName: 'North Korea' } },
    { id: 'south-korea', label: 'South Korea', type: 'country', geometry: { kind: 'country', worldAtlasName: 'South Korea' } },
    { id: 'taiwan', label: 'Taiwan', type: 'country', geometry: { kind: 'country', worldAtlasName: 'Taiwan' } },

    // Cities
    { id: 'beijing', label: 'Beijing', type: 'city', geometry: { kind: 'point', lonLat: [116.4, 39.9] } },
    { id: 'chongqing', label: 'Chongqing', type: 'city', geometry: { kind: 'point', lonLat: [106.55, 29.56] } },
    { id: 'guangzhou', label: 'Guangzhou', type: 'city', geometry: { kind: 'point', lonLat: [113.26, 23.13] } },
    { id: 'hong-kong', label: 'Hong Kong', type: 'city', geometry: { kind: 'point', lonLat: [114.17, 22.32] } },
    { id: 'seoul', label: 'Seoul', type: 'city', geometry: { kind: 'point', lonLat: [126.98, 37.57] } },
    { id: 'shanghai', label: 'Shanghai', type: 'city', geometry: { kind: 'point', lonLat: [121.47, 31.23] } },
    { id: 'taipei', label: 'Taipei', type: 'city', geometry: { kind: 'point', lonLat: [121.57, 25.03] } },
    { id: 'tokyo', label: 'Tokyo', type: 'city', geometry: { kind: 'point', lonLat: [139.69, 35.68] } },

    // Rivers
    {
      id: 'amur',
      label: 'Amur River',
      type: 'river',
      geometry: { kind: 'line', coords: [[121.5, 53.3], [127.5, 50.3], [132.0, 47.8], [135.1, 48.5], [139.5, 50.5], [141.0, 52.9]] },
    },
    {
      id: 'huang-he',
      label: 'Huang He River',
      type: 'river',
      accept: ['Yellow River', 'Huang He'],
      geometry: {
        kind: 'line',
        coords: [[96.0, 35.0], [103.8, 36.1], [106.2, 38.5], [107.4, 40.8], [111.0, 40.6], [110.5, 37.0], [110.3, 34.6], [113.6, 34.9], [117.0, 36.7], [119.2, 37.8]],
      },
    },
    {
      id: 'yangtze',
      label: 'Yangtze River',
      type: 'river',
      accept: ['Yangtze', 'Chang Jiang'],
      geometry: {
        kind: 'line',
        coords: [[91.0, 33.0], [97.0, 31.0], [100.0, 26.5], [104.6, 28.8], [106.6, 29.6], [111.3, 30.7], [114.3, 30.6], [118.8, 32.1], [121.9, 31.4]],
      },
    },
    {
      id: 'xi',
      label: 'Xi River',
      type: 'river',
      accept: ['Xi Jiang', 'Pearl River'],
      geometry: { kind: 'line', coords: [[104.0, 25.5], [106.5, 24.5], [109.5, 23.5], [111.3, 23.1], [113.0, 22.9], [113.5, 22.5]] },
    },

    // Deserts, mountains, and plateaus
    {
      id: 'gobi',
      label: 'Gobi Desert',
      type: 'desert',
      geometry: { kind: 'polygon', coords: [[98, 42], [106, 44.5], [112, 44], [115, 42], [110, 40], [100, 40]] },
    },
    {
      id: 'kunlun-shan',
      label: 'Kunlun Shan Mountains',
      type: 'mountains',
      accept: ['Kunlun Mountains', 'Kunlun Shan'],
      geometry: { kind: 'polygon', coords: [[76, 37], [85, 36.8], [92, 36.8], [98, 36.2], [98, 35], [92, 35.2], [85, 35.2], [76, 35.6]] },
    },
    {
      id: 'tibet',
      label: 'Plateau of Tibet',
      type: 'plateau',
      accept: ['Tibetan Plateau'],
      geometry: { kind: 'polygon', coords: [[79, 32], [82, 34.5], [88, 35.5], [96, 34.5], [100, 31], [95, 28.5], [88, 28.5], [82, 29.5]] },
    },

    // Seas
    { id: 'east-china-sea', label: 'East China Sea', type: 'sea', geometry: { kind: 'point', lonLat: [125.0, 28.0] } },
    { id: 'sea-of-japan', label: 'Sea of Japan', type: 'sea', geometry: { kind: 'point', lonLat: [135.0, 40.0] } },
    { id: 'yellow-sea', label: 'Yellow Sea', type: 'sea', geometry: { kind: 'point', lonLat: [123.0, 35.5] } },
  ],
}
