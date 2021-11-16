import { createSelector } from 'reselect'
import { GeoJSONSourceRaw } from 'mapbox-gl'
import { TransitLinesState, TRANSIT_LINES_KEY } from './transit-lines.reducer'
import { RootState } from 'store'

export namespace fromTransitLines {
  export const transitLinesState = (state: RootState): TransitLinesState => state[TRANSIT_LINES_KEY]

  export const lines = createSelector([transitLinesState], (state) => state.lines)

  export const selectedStopId = createSelector([transitLinesState], (state: TransitLinesState) => state.selectedStopId)

  export const linesList = createSelector([lines], (stateLines) =>
    Object.entries(stateLines).map(([id, line]) => ({ lineId: id, numberOfStops: line.length, stops: line }))
  )

  export const allStops = createSelector([lines], (stateLines) =>
    Object.values(stateLines).reduce((acc, line) => [...acc, ...line], [])
  )

  export const selectedStop = createSelector([selectedStopId, allStops], (selStopId, stops) =>
    stops.find((stop) => stop.stopId === selStopId)
  )

  /**
   * Mapbox source for the locations
   */
  export const stopsPointGeoJson = createSelector(
    [allStops],
    (stops) =>
      ({
        type: 'geojson',
        promoteId: '_id',
        data: {
          type: 'FeatureCollection',
          features: stops.map((stop) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [stop.lng, stop.lat] },
            properties: {
              peopleOn: stop.peopleOn,
              peopleOff: stop.peopleOff,
              reachablePopulationBike: stop.reachablePopulationBike,
              reachablePopulationWalk: stop.reachablePopulationWalk,
              _id: stop.stopId,
            },
          })),
        },
      } as GeoJSONSourceRaw)
  )

  export const selectedStopPointGeoJson = createSelector([selectedStop], (selectedStop) => {
    if (!selectedStop) return null
    return {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [selectedStop.lng, selectedStop.lat],
        },
      },
    } as GeoJSONSourceRaw
  })

  // Issue https://github.com/targomo/typescript-challenge-frontend/issues/1
  export const stopsLinesGeoJson = createSelector(lines, (stateLines) => {
    const lines = Object.values(stateLines) ?? []
    const result = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: lines.map((line) => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: line.map((p) => [p.lng, p.lat]),
          },
          properties: {},
        })),
      },
    } as GeoJSONSourceRaw
    return result
  })
}
