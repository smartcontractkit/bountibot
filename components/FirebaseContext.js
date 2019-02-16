import * as firebase from 'firebase/app'
import { createContext } from 'react'

export const FirebaseContext = createContext(null)

const windowDefined = typeof window !== 'undefined'

let singleton
export const clientSideFirebase = () => {
  if (!singleton && windowDefined) {
    const config = {
      apiKey: process.env.BB_API_KEY,
      authDomain: process.env.BB_AUTH_DOMAIN,
      databaseURL: process.env.BB_DATABASE_URL,
      projectId: process.env.BB_PROJECT_ID,
      storageBucket: process.env.BB_STORAGE_BUCKET,
      messagingSenderId: process.env.BB_MESSAGING_SENDER_ID
    }
    singleton = firebase.initializeApp(config)
  }
  return singleton
}
