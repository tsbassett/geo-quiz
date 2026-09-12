// The shapes that every region data file must follow.

/** A spot on the globe: [longitude, latitude] in degrees. */
export type LonLat = [number, number]

export type ItemType = 'country' | 'city' | 'river' | 'mountains' | 'desert' | 'plateau' | 'sea'

/** How an item is drawn on the map. */
export type ItemGeometry =
  | { kind: 'country'; worldAtlasName: string } // shape comes from the world-atlas package
  | { kind: 'point'; lonLat: LonLat } // cities and seas
  | { kind: 'line'; coords: LonLat[] } // rivers
  | { kind: 'polygon'; coords: LonLat[] } // mountains, deserts, plateaus

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
  city: 'City',
  river: 'River',
  mountains: 'Mountain range',
  desert: 'Desert',
  plateau: 'Plateau',
  sea: 'Sea',
}

export const TYPE_PLURALS: Record<ItemType, string> = {
  country: 'Countries',
  city: 'Cities',
  river: 'Rivers',
  mountains: 'Mountains',
  desert: 'Deserts',
  plateau: 'Plateaus',
  sea: 'Seas',
}

/** The order types are listed in on screen. */
export const TYPE_ORDER: ItemType[] = ['country', 'city', 'river', 'mountains', 'desert', 'plateau', 'sea']
