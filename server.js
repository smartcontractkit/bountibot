// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
// See https://github.com/zeit/next.js/issues/1245 for discussions on Universal Webpack or universal Babel
const express = require('express')
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fb = require('./server/firebase')
const bodyParser = require('body-parser')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use(bodyParser.json())

  server.post('/gh_webhooks', (req, res) => {
    console.log('got webook', req.body)
  })

  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
