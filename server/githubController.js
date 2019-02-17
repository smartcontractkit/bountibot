const Octokit = require('@octokit/rest')
const express = require('express')
const _ = require('lodash')
const { storage } = require('./firebase')
const { l18nComment } = require('./comments')
const { rewardAmount, botName } = require('./constants')

const router = express.Router()
const addressRegex = new RegExp(/\[bounty: (0x[a-f0-9]+)\]/, 'i')
const commandRegex = new RegExp(`@${botName} (\\w+)(\\s+(\\w+))*`, 'i')

// TODO: would be nice to use GH app instead of my account
const self = 'j16r'

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_KEY}`
})

const isBlank = value => {
  return (_.isEmpty(value) && !_.isNumber(value) || _.isNaN(value))
}

const isPresent = value => {
  return !isBlank(value)
}

router.post('/gh_webhooks', (req, _res) => {
  console.info(`Github Webhook. Action: ${req.body.action}, repository: ${req.body.repository.full_name}, owner: ${req.body.repository.owner.login}, sender: ${req.body.sender.login}.`)

  if (req.body.sender.login === self) {
    return
  }

  switch (req.body.action) {
    case 'created':
      if ('comment' in req.body) {
        createdComment(req.body)
      }
      break
    case 'opened':
      if ('pull_request' in req.body) {
        openedIssue(req.body)
      }
      break
    case 'closed':
      if ('pull_request' in req.body) {
        closedIssue(req.body)
      }
      break
    case 'edited':
      if ('issue' in req.body) {
        editedIssue(req.body)
      }
      break
    default:
      break
  }
})

const createComment = async ({ fullRepoName, repository, owner, sender, issueNumber }, body) => {
  const collection = storage.collection('bountibotState')

  const key = `${fullRepoName}/${sender}.${issueNumber}`

  const ghComment = { owner, repo: repository, number: issueNumber, body }
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

const createNoAddressComment = async pr => {
  const { fullRepoName } = pr
  createComment(pr, l18nComment('noAddressComment', fullRepoName))
}

const createRewardableComment = async (pr, body, address) => {
  const { owner } = pr
  createComment(pr, l18nComment('thankyou', owner, address))
}

const createUnrecognizedCommandComment = async (pr, body, command) => {
  createComment(pr, l18nComment('unrecognized', command))
}

const postReward = async body => {
  // TODO: determine if it was actually approved and merged
  const match = ((body.pull_request || body.issue).body || '').match(addressRegex)
  if (match) {
    // TODO: Load payee from firebase
    reward(match[1], rewardAmount)
  }
}

const setPayee = async ({ fullRepoName, owner, sender, issueNumber }, payee) => {
  const collection = storage.collection('bountibotState')

  const key = `${fullRepoName}/${sender}.${issueNumber}`

  console.log('setting payee to', payee)

  collection
    .doc(key)
    .set({ payee })
    .catch(err => console.error(`Error setting payee via FB: ${err}`))
    .then(() => createRewardableComment(fullRepoName, owner, sender, issueNumber, payee))
}

const getPayee = async ({ fullRepoName, sender, issueNumber }, pullRequestDescription) => {
  const collection = storage.collection('bountibotState')

  const key = `${fullRepoName}/${sender}.${issueNumber}`

  return collection
    .doc(key)
    .get()
    .then(doc => {
      if (doc.exists && isPresent(doc.data().payee)) {
        console.log('Payee was set by PR creator', doc.data().payee)
        return doc.data().payee
      }

      const match = (pullRequestDescription || '').match(addressRegex)
      if (match && isPresent(match[1])) {
        console.log('Payee was found in PR description', match[1])
        return match[1]
      }
    })
    .catch(err => console.error(`Error getting payee via FB: ${err}`))
}

const pullRequest = body => {
  return {
    fullRepoName: body.repository.full_name,
    repository: body.repository.name,
    owner: body.repository.owner.login,
    sender: body.sender.login,
    issueNumber: (body.pull_request || body.issue).number
  }
}

const createdComment = async body => {
  const pr = pullRequest(body)
  console.log('createdComment', pr)

  const match = (body.comment.body || '').match(commandRegex)
  if (match) {
    console.log('body.comment.body', body.comment.body)
    console.log('match', match)
    switch (match[1]) {
      case 'pay':
        if (isPresent(match[3])) {
          setPayee(pr, match[3])
        } else {
          createComment(pr, l18nComment('missingPayAddress'))
        }
        break
      case 'update':
        // TODO: poll for address in description / bio
        break
      case '🏴‍☠️':
        // TODO: save language preference to firebase
        break
      default:
        createUnrecognizedCommandComment(pr, match[1])
        break
    }
  } else {
    createNoAddressComment(pr)
  }
}

const openedIssue = async body => {
  const pr = pullRequest(body)
  console.log('openedIssue', pr)
  const payee = await getPayee(pr, (body.issue || body.pull_request).body)

  if (payee) {
    createRewardableComment(pr, payee)
  } else {
    createNoAddressComment(pr)
  }
}

const closedIssue = async body => {
  const pr = pullRequest(body)
  console.log('closedIssue', pr)
  const payee = await getPayee(pr, (body.issue || body.pull_request).body)
  console.log('payee', payee)

  if (payee) {
    postReward(pr, payee)
  } else {
    createNoAddressComment(pr)
  }
}

const editedIssue = async body => {
  const pr = pullRequest(body)
  console.log('editedIssue', pr)
  const payee = await getPayee(pr, (body.issue || body.pull_request).body)

  if (payee) {
    createRewardableComment(pr, payee)
  } else {
    createNoAddressComment(pr)
  }
}

module.exports = router
