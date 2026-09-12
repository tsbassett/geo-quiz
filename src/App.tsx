import { regions } from './data/regions'
import { useHashRoute } from './hooks/useHashRoute'
import { FullTestScreen } from './screens/FullTestScreen'
import { HomeScreen } from './screens/HomeScreen'
import { RegionScreen } from './screens/RegionScreen'

// Picks the screen from the address: "#/" is Home, "#/region/<slug>" is a region,
// and "#/full-test" is the Full Test.
export default function App() {
  const [page, slug] = useHashRoute()

  if (page === 'region') {
    const region = regions.find((r) => r.slug === slug)
    if (region) return <RegionScreen key={region.slug} region={region} />
  }
  if (page === 'full-test') return <FullTestScreen />
  return <HomeScreen />
}
