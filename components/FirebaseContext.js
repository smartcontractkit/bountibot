import * as firebase from 'firebase/app'
import { createContext } from 'react'

export const FirebaseContext = createContext(null)

const windowDefined = typeof window !== 'undefined'

let singleton
export const clientSideFirebase = config => {
  if (!singleton && windowDefined) {
    singleton = firebase.initializeApp(config)
  }
  return singleton
}
