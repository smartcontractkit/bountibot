// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
// See https://github.com/zeit/next.js/issues/1245 for discussions on Universal Webpack or universal Babel
const express = require('express')
const { parse } = require('url')
const next = require('next')
const bodyParser = require('body-parser')
const Octokit = require('@octokit/rest')
const fb = require('./server/firebase')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_KEY}`
  })

  server.use(bodyParser.json())

  server.post('/gh_webhooks', async (req, _res) => {
    console.log('got webhook action', req.body.action)
    if (req.body.action !== 'opened') {
      return
    }

    console.log('posting comment on issue', req.body.pull_request.number)
    const result = await octokit.issues.createComment({
      owner: req.body.repository.owner.login,
      repo: req.body.repository.name,
      number: req.body.pull_request.number,
      body: `Yaaaargh, I see you've made a PR on ${req.body.repository.name}. We are offering rewards of 100 LINK to all PRs that get merged to this repository. To claim your LINK, place an EIP155 Address in your PR's description, like so: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3].`
    })
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
