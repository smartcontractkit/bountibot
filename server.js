// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
// See https://github.com/zeit/next.js/issues/1245 for discussions on Universal Webpack or universal Babel
const express = require('express')
const { parse } = require('url')
const next = require('next')
const bodyParser = require('body-parser')
const fb = require('./server/firebase')
const Octokit = require('@octokit/rest')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  const octokit = new Octokit({
    auth: process.env.GITHUB_KEY
  })

  server.use(bodyParser.json())

  server.post('/gh_webhooks', async (req, _res) => {
    console.log('got webhook', req.body)
    const result = await octokit.pulls.createComment({
      owner: req.body.repository.owner.login,
      repository: req.body.repository.name,
      number: 1,
      body: "Yaaaargh, I see you've made a PR on #{bountibot}"
    })
    console.log('result', result)
  })

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
