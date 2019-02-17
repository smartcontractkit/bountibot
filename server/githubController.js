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
  return (_.isEmpty(value) && !_.isNumber(value)) || _.isNaN(value)
}

const isPresent = value => {
  return !isBlank(value)
}

const collection = storage.collection('bountibotState')

router.post('/gh_webhooks', ({ body }) => {
  console.info(`Github Webhook. Action: ${
    body.action}, repository: ${
    body.repository.full_name}, owner: ${
      body.repository.owner.login
    }, sender: ${body.sender.login}.`
  )

  // Guard against infinite recursion
  //if (body.sender.login === self) {
    //return
  //}

  switch (body.action) {
    case 'created':
      if (body.sender.login === self) {
        return
      }
      if ('comment' in body) {
        updatedComment(body)
      }
      break
    case 'opened':
      if ('pull_request' in body) {
        openedIssue(body)
      }
      break
    case 'closed':
      if ('pull_request' in body) {
        closedIssue(body)
      }
      break
    case 'edited':
      if (body.sender.login === self) {
        return
      }
      if ('comment' in body) {
        updatedComment(body)
      } else {
        editedIssue(body)
      }
      break
    default:
      break
  }
})

const prStateKey = ({ fullRepoName, sender, issueNumber }) => {
  return `${fullRepoName}/${sender}.${issueNumber}`
}

const getPRState = pr => {
  return collection
    .doc(prStateKey(pr))
    .get()
    .catch(err => console.error(`Error obtaining PR state via FB: ${err}`))
}

const setPRState = (pr, data) => {
  return collection
    .doc(prStateKey(pr))
    .set(data)
    .catch(err => console.error(`Error setting PR state via FB: ${err}`))
}

const createComment = async (pr, body) => {
  const { repositoryOwner, repository, issueNumber } = pr
  const ghComment = { owner: repositoryOwner, repo: repository, number: issueNumber, body }
  console.debug('posting GH comment', ghComment)

  // Check storage to see if we already commented
  getPRState(pr)
    .then(doc => {
      if (doc.exists) {
        const newGHComment = _.assign({}, ghComment, { comment_id: doc.data().comment_id })
        console.debug('Comment already exists on PR, updating', newGHComment)
        octokit.issues
          .updateComment(newGHComment)
          .catch(err => console.error(`Error updating PR comment from GH: ${err}`))
        return
      }

      // Create comment
      octokit.issues
        .createComment(ghComment)
        .then(response => {
          // Record that we commented
          setPRState({ comment_id: response.data.id })
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
  const { repositoryOwner } = pr
  createComment(pr, l18nComment('thankyou', repositoryOwner, address))
}

const createUnrecognizedCommandComment = async (pr, body, command) => {
  createComment(pr, l18nComment('unrecognized', command))
}

const postReward = async (pr, payee) => {
  // TODO: determine if it was actually approved and merged
  setPRState(pr, { paidTo: payee })
}

const setLanguage = async (pr, language) => {
  console.log('setting language to', language)
  setPRState(pr, { language })
}

const setPayee = async (pr, payee) => {
  console.log('setting payee to', payee)
  setPRState(pr, { payee })
}

const getPayee = async (pr, pullRequestDescription) => {
  return getPRState(pr).then(doc => {
    if (doc.exists && isPresent(doc.data().payee)) {
      console.log('Payee was set by PR creator', doc.data().payee)
      return doc.data().payee
    }

    const match = (pullRequestDescription || '').match(addressRegex)
    if (match && isPresent(match[1])) {
      console.log('Payee was found in PR description', match[1])
      return match[1]
    }

    return null
  })
}

const pullRequest = body => {
  return {
    fullRepoName: body.repository.full_name,
    repository: body.repository.name,
    repositoryOwner: body.repository.owner.login,
    issueOwner: (body.pull_request || body.issue).user.login,
    sender: body.sender.login,
    issueNumber: (body.pull_request || body.issue).number
  }
}

const updatedComment = async body => {
  const pr = pullRequest(body)
  console.log('updatedComment', pr)

  if (body.sender.login !== pr.issueOwner) {
    console.warn(`Rejecting unauthorized bountibot command (${pr.issueOwner} != ${body.sender.login})`)
    return
  }

  console.debug(`Authorized command from PR owner (${pr.issueOwner} != ${body.sender.login})`)

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
        setLanguage(pr, 'pirate')
        break
      case 'lang':
        setLanguage(pr, match[3])
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
