const admin = require('firebase-admin')
const Firestore = require('@google-cloud/firestore')

const config = {
  apiKey: process.env.BB_API_KEY,
  authDomain: process.env.BB_AUTH_DOMAIN,
  databaseURL: process.env.BB_DATABASE_URL,
  projectId: process.env.BB_PROJECT_ID,
  storageBucket: process.env.BB_STORAGE_BUCKET,
  messagingSenderId: process.env.BB_MESSAGING_SENDER_ID,
  keyFilename: './bountibot-development-2a0f154f120e.json'
}

const firestore = new Firestore(config)

// this should only be included once...
// do note that admin apps bypass all security rules.
module.exports = {
  firebase: admin,
  storage: firestore,
  config
}
