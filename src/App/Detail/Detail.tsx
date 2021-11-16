import React from 'react'
import './Detail.scss'

import { IconButton, Button } from '@mui/material'
import { Clear as ClearIcon } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'

import { fromTransitLines } from 'store/transit-lines/transit-lines.selectors'
import { TransitLineActions } from 'store/transit-lines/transit-lines.actions'

function Detail() {
  const dispatch = useDispatch()
  const selectedStop = useSelector(fromTransitLines.selectedStop)

  const clearSelection = (): void => {
    dispatch(TransitLineActions.SelectStop(null))
  }

  const deleteStop = (): void => {
    dispatch(TransitLineActions.DeleteStop('u9', selectedStop.stopId))
  }

  const addStopAfter = () => {
    dispatch(TransitLineActions.AddStopAfter('u9', selectedStop.stopId))
  }

  return (
    <div className="detail">
      <div className="detail-header">
        <h1 className="title">{selectedStop?.name || 'No selection'}</h1>
        <IconButton className="button" onClick={clearSelection}>
          <ClearIcon className="icon" />
        </IconButton>
      </div>

      <span>Its very empty here (ಠ_ಠ)</span>

      {/*TODO add more info about the stop*/}
      <Button variant="outlined" className="button" onClick={addStopAfter}>
        Add new stop after
      </Button>
      <Button variant="outlined" className="button" onClick={deleteStop} color="error">
        Delete Stop
      </Button>
    </div>
  )
}

export default Detail
