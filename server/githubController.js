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

const createComment = async ({fullRepoName, owner, sender, issueNumber}, body) => {
  const collection = storage.collection('bountibotState')

  const key = `${fullRepoName}/${sender}.${issueNumber}`
  console.debug(`Looking for key ${key}`)

  const ghComment = { owner, repo: owner, number: issueNumber, body }
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
          .catch(err => console.error(`Error updating PR comment from GH: ${err}`))
        return
      }

      // Create comment
      octokit.issues
        .createComment(ghComment)
        .then(response => {
          // Record that we commented
          collection
            .doc(key)
            .set({ comment_id: response.data.id })
            .catch(err => console.error(`Error setting PR comment from FB: ${err}`))
        })
        .catch(err => console.error(`Error creating PR comment from GH: ${err}`))
    })
    .catch(err => console.error(`Error obtaining existing PR comment from FB: ${err}`))
}

const createNoAddressComment = async ({fullRepoName, owner, sender, issueNumber}, body) => {
  createComment(fullRepoName, owner, sender, issueNumber, l18nComment('noAddressComment', fullRepoName))
}

const createRewardableComment = async ({fullRepoName, owner, sender, issueNumber}, body, address) => {
  createComment(fullRepoName, owner, sender, issueNumber, l18nComment('thankyou', owner, address))
}

const createUnrecognizedCommandComment = async ({fullRepoName, owner, sender, issueNumber}, body, command) => {
  createComment(fullRepoName, owner, sender, issueNumber, l18nComment('unrecognized', command))
}

const postReward = async body => {
  // TODO: determine if it was actually approved and merged
  const match = (body.pull_request.body || '').match(addressRegex)
  if (match) {
    // TODO: Load payee from firebase
    reward(match[1], rewardAmount)
  }
}

const setPayee = async ({fullRepoName, owner, sender, issueNumber}, payee) => {
  const collection = storage.collection('bountibotState')

  const key = `${fullRepoName}/${sender}.${issueNumber}`
  console.debug(`Looking for key ${key}`)

  console.log('setting payee to', payee)

  collection
    .doc(key)
    .set({ payee })
    .catch(err => console.error(`Error setting payee via FB: ${err}`))
    .then(() => createRewardableComment(fullRepoName, owner, sender, issueNumber, payee))
}

const getPayee = async (pr, pullRequestDescription) => {
  // TODO: First look against the FB record, then the pull request description, then the sender's bio
  const match = (pullRequestDescription || '').match(addressRegex)
  if (match && match[1] != '') {
    return match[1]
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
        setPayee(body.repository.full_name, body.repository.owner.login, body.sender.login, body.issue.number, match[3])
        break
      case 'update':
        // TODO: poll for address in description / bio
        break
      case '🏴‍☠️':
        // TODO: save language preference to firebase
        break
      default:
        createUnrecognizedCommandComment(body.repository.full_name, body.repository.owner.login, body.sender.login, body.issue.number, match[1])
        break
    }
  }
}

const pullRequest = async body = {
  return {
    fullName: body.repository.full_name,
    owner: body.repository.owner.login,
    sender: body.sender.login,
    number: body.pull_request.numberr,
  }
}

const openedIssue = async body => {
  const pr = pullRequest(body)
  const payee = getPayee(pr, body.pull_request.body)

  if (payee) {
    createRewardableComment(pr, payee)
  } else {
    createNoAddressComment(pr)
  }
}

const closedIssue = async body => {
  const pr = pullRequest(body)
  const payee = getPayee(pr, body.pull_request.body)

  if (payee) {
    postReward(pr, match[1])
  } else {
    createNoAddressComment(pr)
  }
}

const editedIssue = async body => {
  const pr = pullRequest(body)
  const payee = getPayee(pr, body.pull_request.body)

  if (payee) {
    createRewardableComment(pr, match[1])
  } else {
    createNoAddressComment(pr)
  }
}

module.exports = router
