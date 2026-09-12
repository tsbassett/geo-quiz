// One-time build step: makes src/data/canada-provinces.json, the outlines of
// Canada's 13 provinces and territories, bundled into the app like world-atlas.
//
// Source: Natural Earth "Admin 1 - States, Provinces", version 4.1.0, 1:50m scale
// (the same edition and scale world-atlas uses for countries, so the borders line up).
// Natural Earth is public domain: https://www.naturalearthdata.com/about/terms-of-use/
//
// Run with:  npm run build:provinces
// (Only needed to regenerate the file; the app never downloads anything while running.)

import { writeFileSync } from 'node:fs'
import { geoArea } from 'd3-geo'
import { topology } from 'topojson-server'

const SOURCE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v4.1.0/geojson/ne_50m_admin_1_states_provinces.geojson'
const OUTPUT = new URL('../src/data/canada-provinces.json', import.meta.url)

const response = await fetch(SOURCE)
if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`)
const all = await response.json()

const provinces = all.features
  .filter((f) => f.properties.adm0_a3 === 'CAN')
  .map((f) => {
    const feature = { type: 'Feature', properties: { name: f.properties.name }, geometry: f.geometry }
    // d3 expects each outline to run clockwise. If an outline runs the other way, d3 reads it
    // as "the whole world except this shape", so flip it. (Real provinces are far smaller than half the globe.)
    if (geoArea(feature) > 2 * Math.PI) {
      const flip = (polygon) => polygon.map((ring) => [...ring].reverse())
      const g = feature.geometry
      g.coordinates = g.type === 'Polygon' ? flip(g.coordinates) : g.coordinates.map(flip)
    }
    return feature
  })

if (provinces.length !== 13) throw new Error(`Expected 13 provinces and territories, found ${provinces.length}`)

// TopoJSON with rounded ("quantized") coordinates, the same compact format world-atlas uses.
const topo = topology({ provinces: { type: 'FeatureCollection', features: provinces } }, 1e5)
writeFileSync(OUTPUT, JSON.stringify(topo))
console.log(`Wrote ${provinces.length} provinces and territories to src/data/canada-provinces.json`)
for (const p of provinces) console.log(`  ${p.properties.name}: ${(geoArea(p) * 6371 * 6371).toFixed(0)} sq km`)
