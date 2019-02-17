const Octokit = require('@octokit/rest')
const express = require('express')
const _ = require('lodash')
const { storage } = require('./firebase')
const { l18nComment } = require('./comments')
const { rewardAmount } = require('./constants')

const router = express.Router()
const addressRegex = new RegExp(/\[bounty: (0x[a-f0-9]+)\]/, 'i')

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_KEY}`
})

router.post('/gh_webhooks', (req, _res) => {
  console.info(`Github Webhook. Action: ${req.body.action}, repository: ${req.body.repository.full_name}, owner: ${req.body.repository.owner.login}.`)

  switch (req.body.action) {
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
    number: body.pull_request.number,
    body: l18nComment('noAddressComment', body)
  }
  createComment(comment)
}

const createRewardableComment = async (body, address) => {
  const comment = {
    owner: body.repository.owner.login,
    repo: body.repository.name,
    full_repo_name: body.repository.full_name,
    number: body.pull_request.number,
    body: l18nComment('thankyou', body, address)
  }
  createComment(comment)
}

const postReward = async body => {
  console.log('posting reward', body.pull_request.number)

  // TODO: determine if it was actually approved and merged
  const match = (body.pull_request.body || '').match(addressRegex)
  if (match) {
    reward(match[1], rewardAmount)
  }
}

const openedIssue = async body => {
  console.log('posting comment on opened issue', body.pull_request.number)

  const match = (body.pull_request.body || '').match(addressRegex)
  if (match) {
    createRewardableComment(body, match[1])
  } else {
    createNoAddressComment(body)
  }
}

const closedIssue = async body => {
  console.log('posting comment on closed issue', body.pull_request.number)

  const match = (body.pull_request.body || '').match(addressRegex)
  if (match) {
    postReward(body, match[1])
  } else {
    createNoAddressComment(body)
  }
}

const editedIssue = async body => {
  console.log('issue edited, seeing if a bounty address was added...', body.pull_request.number)

  const match = (body.pull_request.body || '').match(addressRegex)
  if (match) {
    createRewardableComment(body, match[1])
  } else {
    createNoAddressComment(body)
  }
}

module.exports = router
