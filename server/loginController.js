const express = require('express')
const { firebase } = require('./firebase')

const admins = [
  'dimroc@gmail.com',
  'alex+git@rival-studios.com' // left off others for testing
]

const isAdmin = decodedToken => {
  return admins.includes(decodedToken.email) // questionable security, aarrr!
}

const router = express.Router()

router.post('/api/login', (req, res) => {
  if (!req.body) return res.sendStatus(400)

  const { token } = req.body
  return firebase
    .auth()
    .verifyIdToken(token)
    .then(decodedToken => {
      // https://github.com/zeit/next.js/issues/5654#issuecomment-449856204
      const vettedUser = decodedToken
      vettedUser.displayName = decodedToken.name // mapping name to displayName
      vettedUser.admin = isAdmin(decodedToken)
      req.session.user = vettedUser
      return vettedUser
    })
    .then(user => res.json({ status: true, user }))
    .catch(error => {
      console.error('post api login got error:', error)
      res.json({ error })
    })
})

router.post('/api/logout', (req, res) => {
  req.session.decodedToken = null
  req.session.admin = null
  res.json({ status: true })
})

module.exports = router
