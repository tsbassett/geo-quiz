// Loads country outlines from the world-atlas package (bundled into the app,
// so nothing is downloaded while the app runs).

import { feature } from 'topojson-client'
import { geoBounds } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import worldAtlas from 'world-atlas/countries-50m.json'
import type { Region } from '../data/types'

export type CountryFeature = Feature<Geometry, { name: string }>

const topology = worldAtlas as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>

/** Every country in the world, as shapes d3 can draw. */
export const countries: CountryFeature[] = feature(topology, topology.objects.countries).features

const countriesByName = new Map(countries.map((c) => [c.properties.name, c]))

export function findCountry(name: string): CountryFeature | undefined {
  return countriesByName.get(name)
}

/** Only the countries that touch a region's map area (drawing fewer shapes is faster). */
export function countriesNear(bbox: Region['bbox']): CountryFeature[] {
  const margin = 5
  return countries.filter((c) => {
    const [[west, south], [east, north]] = geoBounds(c)
    if (west > east) return true // shape crosses the 180° line; just keep it
    return (
      east >= bbox.west - margin &&
      west <= bbox.east + margin &&
      north >= bbox.south - margin &&
      south <= bbox.north + margin
    )
  })
}
