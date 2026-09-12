import type { Region } from '../types'

// North America quizzes Canada's provinces and territories (from src/data/canada-provinces.json)
// rather than countries. "provinceName" is the name as spelled in that file.
export const northAmerica: Region = {
  slug: 'north-america',
  name: 'North America',
  bbox: { west: -172, south: 14, east: -52, north: 75 },
  items: [
    // Provinces and territories of Canada
    { id: 'alberta', label: 'Alberta', type: 'province', geometry: { kind: 'province', provinceName: 'Alberta' } },
    {
      id: 'british-columbia',
      label: 'British Columbia',
      type: 'province',
      geometry: { kind: 'province', provinceName: 'British Columbia' },
    },
    { id: 'manitoba', label: 'Manitoba', type: 'province', geometry: { kind: 'province', provinceName: 'Manitoba' } },
    {
      id: 'new-brunswick',
      label: 'New Brunswick',
      type: 'province',
      geometry: { kind: 'province', provinceName: 'New Brunswick' },
    },
    {
      id: 'newfoundland',
      label: 'Newfoundland',
      type: 'province',
      accept: ['Newfoundland and Labrador'],
      geometry: { kind: 'province', provinceName: 'Newfoundland and Labrador' },
    },
    {
      id: 'northwest-territories',
      label: 'Northwest Territories',
      type: 'province',
      geometry: { kind: 'province', provinceName: 'Northwest Territories' },
    },
    { id: 'nova-scotia', label: 'Nova Scotia', type: 'province', geometry: { kind: 'province', provinceName: 'Nova Scotia' } },
    { id: 'nunavut', label: 'Nunavut', type: 'province', geometry: { kind: 'province', provinceName: 'Nunavut' } },
    { id: 'ontario', label: 'Ontario', type: 'province', geometry: { kind: 'province', provinceName: 'Ontario' } },
    {
      id: 'prince-edward-island',
      label: 'Prince Edward Island',
      type: 'province',
      // Too small to see as a shape, so a diamond marker is drawn here too.
      geometry: { kind: 'province', provinceName: 'Prince Edward Island', dotLonLat: [-63.2, 46.4] },
    },
    { id: 'quebec', label: 'Quebec', type: 'province', geometry: { kind: 'province', provinceName: 'Québec' } },
    { id: 'saskatchewan', label: 'Saskatchewan', type: 'province', geometry: { kind: 'province', provinceName: 'Saskatchewan' } },
    {
      id: 'yukon',
      label: 'Yukon Territory',
      type: 'province',
      accept: ['Yukon'],
      geometry: { kind: 'province', provinceName: 'Yukon' },
    },

    // Cities
    { id: 'atlanta', label: 'Atlanta', type: 'city', geometry: { kind: 'point', lonLat: [-84.39, 33.75] } },
    { id: 'boston', label: 'Boston', type: 'city', geometry: { kind: 'point', lonLat: [-71.06, 42.36] } },
    { id: 'chicago', label: 'Chicago', type: 'city', geometry: { kind: 'point', lonLat: [-87.63, 41.88] } },
    { id: 'dallas', label: 'Dallas', type: 'city', geometry: { kind: 'point', lonLat: [-96.8, 32.78] } },
    { id: 'houston', label: 'Houston', type: 'city', geometry: { kind: 'point', lonLat: [-95.37, 29.76] } },
    { id: 'los-angeles', label: 'Los Angeles', type: 'city', geometry: { kind: 'point', lonLat: [-118.24, 34.05] } },
    { id: 'montreal', label: 'Montreal', type: 'city', geometry: { kind: 'point', lonLat: [-73.57, 45.5] } },
    { id: 'new-york', label: 'New York', type: 'city', geometry: { kind: 'point', lonLat: [-74.01, 40.71] } },
    { id: 'ottawa', label: 'Ottawa', type: 'city', geometry: { kind: 'point', lonLat: [-75.7, 45.42] } },
    {
      id: 'san-francisco',
      label: 'San Francisco',
      type: 'city',
      accept: ['San Fransico'],
      geometry: { kind: 'point', lonLat: [-122.42, 37.77] },
    },
    { id: 'seattle', label: 'Seattle', type: 'city', geometry: { kind: 'point', lonLat: [-122.33, 47.61] } },
    { id: 'toronto', label: 'Toronto', type: 'city', geometry: { kind: 'point', lonLat: [-79.38, 43.65] } },
    { id: 'vancouver', label: 'Vancouver', type: 'city', geometry: { kind: 'point', lonLat: [-123.12, 49.28] } },
    {
      id: 'washington-dc',
      label: 'Washington DC',
      type: 'city',
      accept: ['Washington, D.C.', 'Washington'],
      geometry: { kind: 'point', lonLat: [-77.04, 38.91] },
    },

    // Rivers
    {
      id: 'mississippi',
      label: 'Mississippi River',
      type: 'river',
      accept: ['Mississippi'],
      geometry: {
        kind: 'line',
        coords: [[-95.1, 47.2], [-94.0, 45.0], [-91.5, 43.5], [-91.2, 41.5], [-90.6, 38.8], [-89.5, 36.5], [-90.5, 34.5], [-91.2, 32.3], [-91.3, 30.5], [-89.4, 29.2]],
      },
    },
    {
      id: 'missouri',
      label: 'Missouri River',
      type: 'river',
      accept: ['Missouri'],
      geometry: {
        kind: 'line',
        coords: [[-111.5, 45.8], [-109.0, 47.5], [-105.0, 48.0], [-101.5, 47.5], [-100.8, 45.5], [-97.0, 43.0], [-96.0, 40.5], [-94.5, 39.2], [-90.6, 38.8]],
      },
    },
    {
      id: 'yukon-river',
      label: 'Yukon River',
      type: 'river',
      accept: ['Yukon'],
      geometry: {
        kind: 'line',
        coords: [[-134.5, 60.2], [-137.0, 62.0], [-139.5, 63.5], [-143.5, 64.8], [-148.0, 65.0], [-152.0, 64.8], [-157.0, 63.5], [-161.5, 62.5], [-164.5, 62.6]],
      },
    },

    // Mountains
    {
      id: 'appalachians',
      label: 'Appalachian Mountains',
      type: 'mountains',
      accept: ['Appalachians'],
      geometry: {
        kind: 'polygon',
        coords: [[-84.2, 34.4], [-83.2, 35.5], [-82.0, 36.4], [-80.5, 37.6], [-79.0, 38.8], [-77.5, 40.0], [-76.0, 41.2], [-74.2, 42.4], [-72.8, 43.6], [-71.5, 44.8], [-70.2, 45.8], [-69.5, 45.4], [-70.8, 44.2], [-72.2, 43.0], [-73.8, 41.8], [-75.5, 40.6], [-77.0, 39.4], [-78.5, 38.2], [-80.0, 37.0], [-81.5, 35.8], [-83.0, 34.6], [-83.9, 33.8]],
      },
    },
    {
      id: 'rockies',
      label: 'Rocky Mountains',
      type: 'mountains',
      accept: ['Rockies'],
      geometry: {
        kind: 'polygon',
        coords: [[-106.5, 35.5], [-106.0, 38.5], [-106.2, 41.0], [-109.0, 44.0], [-111.5, 46.5], [-114.0, 49.0], [-116.0, 52.0], [-119.0, 55.5], [-122.0, 58.5], [-124.5, 60.5], [-127.0, 60.0], [-124.0, 57.0], [-121.0, 54.0], [-118.0, 51.0], [-116.0, 48.5], [-113.0, 45.5], [-110.5, 42.5], [-109.0, 39.0], [-109.5, 35.5]],
      },
    },

    // Water
    {
      id: 'lake-superior',
      label: 'Lake Superior',
      type: 'lake',
      geometry: {
        kind: 'polygon',
        coords: [[-92.1, 46.7], [-90.5, 46.7], [-88.0, 46.6], [-85.5, 46.6], [-84.4, 46.5], [-84.6, 47.3], [-86.5, 48.3], [-89.0, 48.5], [-91.0, 48.0], [-92.0, 47.4]],
      },
    },
    {
      id: 'gulf-of-america',
      label: 'Gulf of America',
      type: 'sea',
      accept: ['Gulf of Mexico'],
      geometry: { kind: 'point', lonLat: [-90.0, 25.0] },
    },
    { id: 'hudson-bay', label: 'Hudson Bay', type: 'sea', geometry: { kind: 'point', lonLat: [-85.0, 59.0] } },
  ],
}
