import * as firebase from 'firebase/app'
import { createContext } from 'react'

export const FirebaseContext = createContext(null)

export const windowDefined = typeof window !== 'undefined'

let singleton
export const clientSideFirebase = config => {
  if (!singleton && windowDefined) {
    console.log('-------- initializing firebase app for client')
    singleton = firebase.initializeApp(config)
  }
  return singleton
}
