// Loads country outlines from the world-atlas package, and Canada's province and
// territory outlines from src/data/canada-provinces.json. Both are bundled into
// the app, so nothing is downloaded while the app runs.

import { feature } from 'topojson-client'
import { geoBounds } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import worldAtlas from 'world-atlas/countries-50m.json'
import canadaProvinces from '../data/canada-provinces.json'
import type { ItemGeometry, Region } from '../data/types'

/** A named outline (a country, province, or territory) that d3 can draw. */
export type CountryFeature = Feature<Geometry, { name: string }>

const topology = worldAtlas as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>

/** Every country in the world, as shapes d3 can draw. */
export const countries: CountryFeature[] = feature(topology, topology.objects.countries).features

const countriesByName = new Map(countries.map((c) => [c.properties.name, c]))

export function findCountry(name: string): CountryFeature | undefined {
  return countriesByName.get(name)
}

// Canada's 13 provinces and territories (made by scripts/build-canada-provinces.mjs
// from Natural Earth, the same source world-atlas uses).
const provinceTopology = canadaProvinces as unknown as Topology<{ provinces: GeometryCollection<{ name: string }> }>
const provinces: CountryFeature[] = feature(provinceTopology, provinceTopology.objects.provinces).features
const provincesByName = new Map(provinces.map((p) => [p.properties.name, p]))

export function findProvince(name: string): CountryFeature | undefined {
  return provincesByName.get(name)
}

/** The outline for a country or province item (nothing for other kinds). */
export function findShape(geometry: ItemGeometry): CountryFeature | undefined {
  if (geometry.kind === 'country') return findCountry(geometry.worldAtlasName)
  if (geometry.kind === 'province') return findProvince(geometry.provinceName)
  return undefined
}

// Each country's outer edges, worked out the first time they're needed and then remembered.
const boundsCache = new Map<CountryFeature, ReturnType<typeof geoBounds>>()
function boundsOf(country: CountryFeature) {
  let bounds = boundsCache.get(country)
  if (!bounds) boundsCache.set(country, (bounds = geoBounds(country)))
  return bounds
}

/** Only the countries that touch a map area (drawing fewer shapes is faster). */
export function countriesNear(bbox: Region['bbox']): CountryFeature[] {
  const margin = 5
  const overlapsEastWest = (west: number, east: number) => east >= bbox.west - margin && west <= bbox.east + margin
  return countries.filter((c) => {
    const [[west, south], [east, north]] = boundsOf(c)
    if (west > east) return true // shape crosses the 180° line; just keep it
    if (north < bbox.south - margin || south > bbox.north + margin) return false
    // Also try the country shifted by 360°, for maps that reach past the 180° line
    // (a country at -175° longitude sits at 185° on such a map).
    return overlapsEastWest(west, east) || overlapsEastWest(west + 360, east + 360)
  })
}
