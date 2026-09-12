// Study mode: every item is labeled. Tap one to highlight it and read about it.

import { useMemo, useState } from 'react'
import { TYPE_NAMES, TYPE_ORDER, TYPE_PLURALS, type Region } from '../data/types'
import { RegionMap, type MarkerState } from '../map/RegionMap'

export function StudyMode({ region }: { region: Region }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = region.items.find((i) => i.id === selectedId)

  const labels = useMemo(() => Object.fromEntries(region.items.map((i) => [i.id, i.label])), [region])
  const markerStates: Record<string, MarkerState> = selectedId ? { [selectedId]: 'selected' } : {}

  // Tapping the selected item again clears the selection.
  const toggle = (id: string) => setSelectedId((current) => (current === id ? null : id))

  return (
    <div className="mode-body">
      <div className="map-pane">
        <RegionMap
          region={region}
          markedItems={region.items}
          markerText={labels}
          markerStates={markerStates}
          highlightId={selectedId}
          onItemTap={toggle}
          tapShapes
        />
      </div>

      <aside className="side-pane">
        <div className="info-card">
          {selected ? (
            <>
              <div className="info-name">{selected.label}</div>
              <div className="info-type">{TYPE_NAMES[selected.type]}</div>
              {selected.accept && selected.accept.length > 0 && (
                <div className="info-also">Also called: {selected.accept.join(', ')}</div>
              )}
            </>
          ) : (
            <div className="info-hint">Tap anything on the map, or a name below, to learn about it.</div>
          )}
        </div>

        {TYPE_ORDER.map((type) => {
          const ofType = region.items.filter((i) => i.type === type)
          if (ofType.length === 0) return null
          return (
            <section key={type} className="type-group">
              <h3>{TYPE_PLURALS[type]}</h3>
              <div className="chips">
                {ofType.map((item) => (
                  <button
                    key={item.id}
                    className={`chip ${item.id === selectedId ? 'chip-selected' : ''}`}
                    onClick={() => toggle(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </aside>
    </div>
  )
}
