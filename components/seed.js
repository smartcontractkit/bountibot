import * as firebase from "firebase/app"

// Initialize Firebase
var config = {
  apiKey: process.env.BB_API_KEY,
  authDomain: process.env.BB_AUTH_DOMAIN,
  databaseURL: process.env.BB_DATABASE_URL,
  projectId: process.env.BB_PROJECT_ID,
  storageBucket: process.env.BB_STORAGE_BUCKET,
  messagingSenderId: process.env.BB_MESSAGING_SENDER_ID
};
firebase.initializeApp(config);

const seed = (component) => {
  return component
}

export default seed
