import React, { useRef, useEffect, useState } from 'react'
import './App.scss'

import { Map, MapMouseEvent, PointLike, GeoJSONSource, GeoJSONSourceRaw } from 'mapbox-gl'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { TransitLineActions } from 'store/transit-lines/transit-lines.actions'
import { fromTransitLines } from 'store/transit-lines/transit-lines.selectors'

import { MARKER_PAINT, SELECTED_MARKER_PAINT } from 'constants/marker-paint'
import { LINE_PAINT } from 'constants/line-paint'

import Home from './Home'
import Detail from './Detail'
import { requestService } from 'services/request'

function App() {
  const STOPS_SOURCE_ID = 'stops-source'
  const STOPS_LAYER_ID = 'stops-layer'

  const SELECTED_STOP_SOURCE_ID = 'selected-stop-source'
  const SELECTED_STOP_LAYER_ID = 'selected-stop-layer'

  const LINES_SOURCE_ID = 'lines-source'
  const LINES_LAYER_ID = 'lines-layer'

  const CLICK_ON_MAP_QUERY_BOX = { width: 5, height: 5 }

  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<Map>(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const stopsSource = useSelector(fromTransitLines.stopsPointGeoJson)
  const linesSource = useSelector(fromTransitLines.stopsLinesGeoJson)
  const selectedStopSource = useSelector(fromTransitLines.selectedStopPointGeoJson)

  const selectedStopId = useSelector(fromTransitLines.selectedStopId)

  const [isMapLoaded, setIsMapLoadedValue] = useState<boolean>(false)

  const fetchU9Line = () => {
      dispatch(TransitLineActions.FetchLine('u9'))
  }

  useEffect(() => {
    fetchU9Line()
  }, [])

  useEffect(() => {
    map.current = new Map({
      container: mapContainer.current,
      style: 'https://maps.targomo.com/styles/positron-gl-style.json',
      center: { lat: 52.52, lng: 13.4 },
      zoom: 10,
    })

    map.current.on('load', () => setIsMapLoadedValue(true))

    map.current.on('click', (e: MapMouseEvent) => {
      const { width, height } = CLICK_ON_MAP_QUERY_BOX
      const clickedAt = e.point
      const q: [PointLike, PointLike] = [
        [clickedAt.x - width / 2, clickedAt.y - height / 2],
        [clickedAt.x + width / 2, clickedAt.y + height / 2],
      ]
      const features = map.current.queryRenderedFeatures(q, { layers: [STOPS_LAYER_ID] })
      if (features.length > 0) {
        const feature = features[0]
        dispatch(TransitLineActions.SelectStop(feature.properties._id))
      }
    })

    return () => setIsMapLoadedValue(false)
  }, [dispatch])

  useEffect(() => {
    if (!map.current.isStyleLoaded()) {
      return
    }

    const existingStopsSource = map.current.getSource(STOPS_SOURCE_ID) as GeoJSONSource
    const existingLinesSource = map.current.getSource(LINES_SOURCE_ID) as GeoJSONSource
    if (existingStopsSource) {
      existingStopsSource.setData(stopsSource.data)

      if (existingLinesSource) {
        existingLinesSource.setData(linesSource.data)
      }
    } else {
      map.current.addSource(STOPS_SOURCE_ID, stopsSource)
      map.current.addLayer({ type: 'circle', source: STOPS_SOURCE_ID, id: STOPS_LAYER_ID, paint: MARKER_PAINT })

      map.current.addSource(LINES_SOURCE_ID, linesSource)
      map.current.addLayer({ type: 'line', source: LINES_SOURCE_ID, id: LINES_LAYER_ID, paint: LINE_PAINT })
    }
  }, [stopsSource, isMapLoaded])

  useEffect(() => {
    navigate(selectedStopId ? '/detail' : '/home')
  }, [selectedStopId, navigate])

  useEffect(() => {
    const existingSource = map.current.getSource(SELECTED_STOP_SOURCE_ID)
    if (existingSource) {
      map.current.removeLayer(SELECTED_STOP_LAYER_ID)
      map.current.removeSource(SELECTED_STOP_SOURCE_ID)
    }
    if (!selectedStopSource) return

    map.current.addSource(SELECTED_STOP_SOURCE_ID, selectedStopSource)
    map.current.addLayer({
      type: 'circle',
      source: SELECTED_STOP_SOURCE_ID,
      id: SELECTED_STOP_LAYER_ID,
      paint: SELECTED_MARKER_PAINT,
    })
  }, [selectedStopSource])

  return (
    <div>
      <Box boxShadow={5} className="sidebar">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/detail" element={<Detail />} />
        </Routes>
      </Box>

      <div ref={mapContainer} className="map" />
    </div>
  )
}

export default App
