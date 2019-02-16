const admin = require('firebase-admin')
const fs = require('fs')

const config = {
  apiKey: process.env.BB_API_KEY,
  authDomain: process.env.BB_AUTH_DOMAIN,
  databaseURL: process.env.BB_DATABASE_URL,
  projectId: process.env.BB_PROJECT_ID,
  storageBucket: process.env.BB_STORAGE_BUCKET,
  messagingSenderId: process.env.BB_MESSAGING_SENDER_ID
}

const serviceAccountJSONPath = './bountibot-development-2a0f154f120e'
if (fs.existsSync(serviceAccountJSONPath)) {
  const serviceAccount = require(serviceAccountJSONPath)
  config.credential = admin.credential.cert(serviceAccount)
}

// this should only be included once...
// do note that admin apps bypass all security rules.
const firebase = admin.initializeApp(config)
module.exports = {
  firebase,
  storage: firebase.firestore(),
  config
}
