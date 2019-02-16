import * as firebase from "firebase/app"

const windowDefined = typeof window !== 'undefined'

const clientFirebase = () => {
  if (windowDefined) {
    // Initialize Firebase
    const config = {
      apiKey: process.env.BB_API_KEY,
      authDomain: process.env.BB_AUTH_DOMAIN,
      databaseURL: process.env.BB_DATABASE_URL,
      projectId: process.env.BB_PROJECT_ID,
      storageBucket: process.env.BB_STORAGE_BUCKET,
      messagingSenderId: process.env.BB_MESSAGING_SENDER_ID
    };
    return firebase.initializeApp(config);
  }
  return null
}

const seed = (component) => {
  return component
}

export default seed
