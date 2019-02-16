const express = require('express')
const { parse } = require('url')
const next = require('next')
const bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const { config } = require('./server/firebase')
const githubController = require('./server/githubController')
const loginController = require('./server/loginController')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000
const app = next({ dev })
const handle = app.getRequestHandler()

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
