const express = require('express')
const { parse } = require('url')
const next = require('next')
const bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const { storage, config } = require('./server/firebase')
const githubController = require('./server/githubController')
const loginController = require('./server/loginController')
const { payLink } = require('./server/payment')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000
const app = next({ dev })
const handle = app.getRequestHandler()

const filteredEnvs = Object.keys(process.env).filter(k => k.startsWith('BB_'))
console.log('PROCESS ENV:')
filteredEnvs.forEach(k => console.log(k, '=', process.env[k]))


app.prepare().then(() => {
  const server = express()

  server.use(bodyParser.json())
  server.use(
    session({
      secret: 'thar be bounti here, yaarr',
      saveUninitialized: true,
      store: new FileStore({ path: '/tmp/sessions', secret: 'thar be bounti here, yaarr' }),
      resave: false,
      rolling: true,
      httpOnly: true,
      cookie: { maxAge: 604800000 } // week
    })
  )

  server.use(githubController)
  server.use(loginController)

  server.get('/config', (req, res) => {
    res.json(config)
  })

  server.get('/testing_firebase', async (_, res) => {
    await storage.collection('dimitris_jokes').add({
      message: 'serenity is the greatest sci fi movie ever, dont @ me'
    })
    res.json({ status: 'OK' })
  })

  server.get('/jokes', async (_, res) => {
    const snapshot = await storage.collection('dimitris_jokes').get()
    const jokes = []
    snapshot.forEach(j => {
      jokes.push(j.data())
    })
    res.json({ jokes })
  })

  server.get('/paya', async (_, res) => {
    const reply = await payLink('bf52b37ab2eb7d6c48fe3c35d5e27f8e3959e7a0')
    res.json(reply)
  })

  server.get('/prs', async (_, res) => {
    const snapshot = await storage
      .collection('bountibotState')
      .doc('smartcontractkit')
      .collection('bountibot')
      .get()

    const prs = []
    snapshot.forEach(j => {
      prs.push(j.data())
    })
    res.json({ prs })
  })

  // catch all sends to nextjs
  server
    .get('*', (req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })
    .listen(port, err => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })
})
