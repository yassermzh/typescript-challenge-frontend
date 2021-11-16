import { TransitLine } from 'types/line'
import { AnyAction, Dispatch } from 'redux'
import { requestService } from 'services/request'
import { RootState } from 'store'
import { fromTransitLines } from './transit-lines.selectors'

export enum TransitLinesActionTypes {
  ADD_LINE = '[TRANSIT LINE ACTIONS] Add line',
  SELECT_STOP = '[TRANSIT LINE ACTIONS] Select stop',
}

export namespace TransitLineActions {
  export const AddLine = (lineId: string, line: TransitLine): AnyAction => ({
    type: TransitLinesActionTypes.ADD_LINE,
    payload: { lineId, line },
  })

  export const SelectStop = (selectedStopId: string): AnyAction => ({
    type: TransitLinesActionTypes.SELECT_STOP,
    payload: { selectedStopId },
  })

  export const FetchLine = (lineId: string) => {
    return (dispatch: Dispatch) => {
      const endPoint = `/transit-lines/${lineId}`
      requestService.sendRequest('GET', endPoint).then((line) => {
        dispatch(AddLine(lineId, line))
      })
    }
  }

  export const AddStopAfter = (lineId: string, stopId: string) => {
    return (dispatch: Dispatch, getState: () => RootState) => {
      const endPoint = `/transit-lines/${lineId}/stops`
      requestService.sendRequest('POST', endPoint, { currentStopId: stopId }).then((newLine) => {
        dispatch(AddLine(lineId, newLine))
        // auto select newly create stop
        const state = getState()
        const newStopId = fromTransitLines.selectedStop(state).nextStopId
        dispatch(TransitLineActions.SelectStop(newStopId))
      })
    }
  }

  export const DeleteStop = (lineId: string, stopId: string) => {
    return (dispatch: Dispatch) => {
      const endPoint = `/transit-lines/${lineId}/stops/${stopId}`
      requestService.sendRequest('DELETE', endPoint).then((newLine) => {
        dispatch(TransitLineActions.SelectStop(null))
        dispatch(AddLine(lineId, newLine))
      })
    }
  }
}
