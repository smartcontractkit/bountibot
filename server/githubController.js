const Octokit = require('@octokit/rest')
const express = require('express')
const _ = require('lodash')
const { storage } = require('./firebase')
const { l18nComment } = require('./comments')
const { rewardAmount, botName } = require('./constants')

const router = express.Router()
const addressRegex = new RegExp(/\[bounty: (0x[a-f0-9]+)\]/, 'i')
const commandRegex = new RegExp(`@${botName} (\\w+)(\\s+(\\w+))*`, 'i')

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_KEY}`
})

router.post('/gh_webhooks', (req, _res) => {
  console.debug('Got Webhook', req.body)
  console.info(`Github Webhook. Action: ${req.body.action}, repository: ${req.body.repository.full_name}, owner: ${req.body.repository.owner.login}.`, req.body)

  switch (req.body.action) {
    case 'created':
      if ('comment' in req.body) {
        createdComment(req.body)
      }
      break
    case 'opened':
      openedIssue(req.body)
      break
    case 'closed':
      closedIssue(req.body)
      break
    case 'edited':
      editedIssue(req.body)
      break
    default:
      break
  }
})

const createComment = async comment => {
  const collection = storage.collection('pull_request_comments')

  const key = `${comment.full_repo_name}/${comment.owner}.${comment.number}`
  console.debug(`Looking for key ${key}`)

  const ghComment = _.pick(comment, ['owner', 'repo', 'number', 'body'])
  console.debug('posting GH comment', ghComment)

  // Check storage to see if we already commented
  collection
    .doc(key)
    .get()
    .then(doc => {
      if (doc.exists) {
        const newGHComment = _.assign({}, ghComment, { comment_id: doc.data().comment_id })
        console.debug('Comment already exists on PR, updating', newGHComment)
        octokit.issues.updateComment(newGHComment)
        return
      }

      // Create comment
      octokit.issues
        .createComment(ghComment)
        .then(response => {
          // Record that we commented
          collection
            .doc(key)
            .set(_.assign({}, ghComment, { comment_id: response.data.id }))
            .catch(err => console.error(`Error setting PR comment from FB: ${err}`))
        })
        .catch(err => console.error(`Error creating PR comment from GH: ${err}`))
    })
    .catch(err => console.error(`Error obtaining existing PR comment from FB: ${err}`))
}

const createNoAddressComment = async body => {
  const comment = {
    owner: body.repository.owner.login,
    repo: body.repository.name,
    full_repo_name: body.repository.full_name,
    number: body.issue.number,
    body: l18nComment('noAddressComment', body)
  }
  createComment(comment)
}

const createRewardableComment = async (body, address) => {
  const comment = {
    owner: body.repository.owner.login,
    repo: body.repository.name,
    full_repo_name: body.repository.full_name,
    number: body.issue.number,
    body: l18nComment('thankyou', body, address)
  }
  createComment(comment)
}

const createUnrecognizedCommandComment = async (body, command) => {
  const comment = {
    owner: body.repository.owner.login,
    repo: body.repository.name,
    full_repo_name: body.repository.full_name,
    number: body.issue.number,
    body: l18nComment('unrecognized', body, command)
  }
  createComment(comment)
}

const postReward = async body => {
  // TODO: determine if it was actually approved and merged
  const match = (body.pull_request.body || '').match(addressRegex)
  if (match) {
    // TODO: Load payee from firebase
    reward(match[1], rewardAmount)
  }
}

const createdComment = async body => {
  console.log('createdComment', body)
  const match = (body.comment.body || '').match(commandRegex)

  console.log('match', match)

  if (match) {
    switch (match[1]) {
      case 'pay':
        // TODO: Save payee address to firebase
        console.log('setting payee to', match[3])
        break
      case 'update':
        // TODO: poll for address in description / bio
        break
      case '🏴‍☠️':
        // TODO: save language preference to firebase
        break
      default:
        createUnrecognizedCommandComment(body, match[1])
        break
    }
  }
}

const openedIssue = async body => {
  const match = (body.pull_request.body || '').match(addressRegex)
  if (match) {
    createRewardableComment(body, match[1])
  } else {
    createNoAddressComment(body)
  }
}

const closedIssue = async body => {
  const match = (body.pull_request.body || '').match(addressRegex)
  if (match) {
    postReward(body, match[1])
  } else {
    createNoAddressComment(body)
  }
}

const editedIssue = async body => {
  const match = (body.pull_request.body || '').match(addressRegex)
  if (match) {
    createRewardableComment(body, match[1])
  } else {
    createNoAddressComment(body)
  }
}

module.exports = router
