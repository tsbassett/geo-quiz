// The shapes that every region data file must follow.

/** A spot on the globe: [longitude, latitude] in degrees. */
export type LonLat = [number, number]

export type ItemType =
  | 'country'
  | 'province'
  | 'city'
  | 'river'
  | 'canal'
  | 'mountains'
  | 'desert'
  | 'plateau'
  | 'lake'
  | 'reef'
  | 'sea'

/** How an item is drawn on the map. */
export type ItemGeometry =
  // Shape comes from the world-atlas package. For a country too small to see (like
  // Singapore), dotLonLat also draws a diamond marker there so it can be found.
  | { kind: 'country'; worldAtlasName: string; dotLonLat?: LonLat }
  // A Canadian province or territory: shape comes from src/data/canada-provinces.json,
  // matched by its name there (for example "Québec"). Works just like a country.
  | { kind: 'province'; provinceName: string; dotLonLat?: LonLat }
  | { kind: 'point'; lonLat: LonLat } // cities and seas
  | { kind: 'line'; coords: LonLat[] } // rivers and canals
  | { kind: 'polygon'; coords: LonLat[] } // mountains, deserts, plateaus, lakes, reefs

export interface Item {
  id: string
  label: string
  type: ItemType
  geometry: ItemGeometry
  /** Other spellings that also count as correct when typing an answer. */
  accept?: string[]
  /** Optional: put the number marker here instead of the automatic spot. */
  markerLonLat?: LonLat
}

export interface Region {
  slug: string
  name: string
  /** The part of the world the map shows, in degrees. */
  bbox: { west: number; south: number; east: number; north: number }
  items: Item[]
}

/** Friendly names for each type, shown to the student. */
export const TYPE_NAMES: Record<ItemType, string> = {
  country: 'Country',
  province: 'Province or territory',
  city: 'City',
  river: 'River',
  canal: 'Canal',
  mountains: 'Mountain range',
  desert: 'Desert',
  plateau: 'Plateau',
  lake: 'Lake',
  reef: 'Reef',
  sea: 'Sea',
}

export const TYPE_PLURALS: Record<ItemType, string> = {
  country: 'Countries',
  province: 'Provinces and territories',
  city: 'Cities',
  river: 'Rivers',
  canal: 'Canals',
  mountains: 'Mountains',
  desert: 'Deserts',
  plateau: 'Plateaus',
  lake: 'Lakes',
  reef: 'Reefs',
  sea: 'Seas',
}

/** The order types are listed in on screen. */
export const TYPE_ORDER: ItemType[] = [
  'country',
  'province',
  'city',
  'river',
  'canal',
  'mountains',
  'desert',
  'plateau',
  'lake',
  'reef',
  'sea',
]
