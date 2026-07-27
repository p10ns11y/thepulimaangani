import { useCallback, useReducer } from 'react'

import {
  readInputRailExpanded,
  writeInputRailExpanded,
} from '#/lib/prosodyLabLayoutPreferences'
import {
  readPaperPhysicsEnabled,
  readTypewriterSoundEnabled,
  writePaperPhysicsEnabled,
  writeTypewriterSoundEnabled,
} from '#/lib/typewriterEditorPreferences'

export type ProsodyLabChromeState = {
  /** Left Learn rail (samples + read-only poem). */
  inputRailExpanded: boolean
  paperPhysicsOn: boolean
  typewriterSoundOn: boolean
}

type ChromeAction =
  | { type: 'rail'; expanded: boolean }
  | { type: 'physics'; on: boolean }
  | { type: 'sound'; on: boolean }

function readInitialChrome(): ProsodyLabChromeState {
  return {
    inputRailExpanded: readInputRailExpanded(),
    paperPhysicsOn: readPaperPhysicsEnabled(),
    typewriterSoundOn: readTypewriterSoundEnabled(),
  }
}

function chromeReducer(state: ProsodyLabChromeState, action: ChromeAction): ProsodyLabChromeState {
  switch (action.type) {
    case 'rail':
      return state.inputRailExpanded === action.expanded
        ? state
        : { ...state, inputRailExpanded: action.expanded }
    case 'physics':
      return state.paperPhysicsOn === action.on ? state : { ...state, paperPhysicsOn: action.on }
    case 'sound':
      return state.typewriterSoundOn === action.on
        ? state
        : { ...state, typewriterSoundOn: action.on }
    default:
      return state
  }
}

/**
 * Lab chrome prefs that always live together: Learn rail, paper physics, typewriter sound.
 * Persistence is written in the public setters (event-handler path), not via open/close effects.
 */
export function useProsodyLabChrome() {
  const [state, dispatch] = useReducer(chromeReducer, undefined, readInitialChrome)

  const setInputRail = useCallback((expanded: boolean) => {
    writeInputRailExpanded(expanded)
    dispatch({ type: 'rail', expanded })
  }, [])

  const setPaperPhysicsOn = useCallback((on: boolean) => {
    writePaperPhysicsEnabled(on)
    dispatch({ type: 'physics', on })
  }, [])

  const setTypewriterSoundOn = useCallback((on: boolean) => {
    writeTypewriterSoundEnabled(on)
    dispatch({ type: 'sound', on })
  }, [])

  return {
    ...state,
    setInputRail,
    setPaperPhysicsOn,
    setTypewriterSoundOn,
  }
}
