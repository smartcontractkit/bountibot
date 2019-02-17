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
const self = 'dimroc'

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
  if (body.sender.login === self) {
    return
  }

  switch (body.action) {
    case 'created':
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
    //.then(doc => {
      //if (doc.exists && isPresent(doc.data().payee)) {
        //console.log('Payee was set by PR creator', doc.data().payee)
        //return doc.data().payee
      //}

      //const match = pr.description.match(addressRegex)
      //if (match && isPresent(match[1])) {
        //console.log('Payee was found in PR description', match[1])
        //return match[1]
      //}

      //return null
    //})
    //.catch(err => console.error(`Error obtaining PR state via FB: ${err}`))
}

const setPRState = (pr, data) => {
  return collection
    .doc(prStateKey(pr))
    .set(data)
    //.catch(err => console.error(`Error setting PR state via FB: ${err}`))
}

const createComment = ({ repositoryOwner, repository, issueNumber }, { lang }, comment) => {
  const ghComment = {
    owner: repositoryOwner,
    repo: repository,
    number: issueNumber,
    body: l18nComment(lang, ...comment)
  }

  console.debug('Posting GH comment', ghComment)
  return octokit.issues.createComment(ghComment)
}

const createNoAddressComment = (pr, state) => {
  const { fullRepoName } = pr
  return createComment(pr, state, ['noAddressComment', fullRepoName])
}

const createRewardableComment = (pr, state, address) => {
  const { sender } = pr
  return createComment(pr, state, ['thankyou', sender, address])
}

const createUnrecognizedCommandComment = (pr, state, command) => {
  return createComment(pr, state, ['unrecognized', command])
}

const createRewardedComment = (pr, state, address) => {
  const { sender } = pr
  return createComment(pr, state, ['paid', sender])
}

const createRewardClaimedCommnt = (pr, state) => {
  return createComment(pr, state, ['claimed'])
}

const postReward = async (pr, payee) => {
  // TODO: determine if it was actually approved and merged
  return 
}

const setLanguage = async (pr, language) => {
  console.log('setting language to', language)
  eetPRState(pr, { language })
}

const setPayee = async (pr, payee) => {
  console.log('setting payee to', payee)
  setPRState(pr, { payee })
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

  getPRState(pr)
    .then(doc => {
      let state = doc.data()

      const match = (body.comment.body || '').match(commandRegex)
      if (match) {
        console.log('body.comment.body', body.comment.body)
        console.log('match', match)
        switch (match[1]) {
          case 'pay':
            if (isPresent(match[3])) {
              setPayee(pr, match[3])
            } else {
              createComment(pr, ['missingPayAddress'])
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
            createUnrecognizedCommandComment(pr, state, match[1])
            break
        }
      } else {
        createNoAddressComment(pr)
      }
    })
}

const openedIssue = async body => {
  const pr = pullRequest(body)
  console.log('openedIssue', pr)

  getPRState(pr)
    .then(doc => {
      let state = {
        title: body.pull_request.title,
        id: body.pull_request.number,
        description: body.pull_request.body,
        paidTo: null
      }
      if (doc.exists) {
        state = _.assign({}, state, doc.data())
      }

      const match = body.pull_request.body.match(addressRegex)
      if (match && isPresent(match[1])) {
        console.log('Payee was found in PR description', match[1])

        state.payee = match[1]

        console.log('Creating rewardable comment', match[1])
        createRewardableComment(pr, state, match[1])
          .then(response => setPRState(pr, _.assign({}, state, { rewardableCommentID: response.data.id })))
        return
      }

      if (isBlank(state.noAddressCommentID)) {
        console.log('Creating no address comment')
        createNoAddressComment(pr, state)
            .then(response => setPRState(pr, _.assign({}, state, { noAddressCommentID: response.data.id })))
      }
    })
}

const editedIssue = async body => {
  const pr = pullRequest(body)
  console.log('editedIssue', pr)

  getPRState(pr)
    .then(doc => {
      let state = doc.data()

      const match = body.pull_request.body.match(addressRegex)
      if (match && isPresent(match[1])) {
        console.log('Payee was found in PR description', match[1])

        if (state.payee !== match[1]) {
          state.payee = match[1]

          console.log('Creating rewardable comment', match[1])
          createRewardableComment(pr, state, match[1])
            .then(response => setPRState(pr, _.assign({}, state, { rewardableCommentID: response.data.id })))
          return
        }
      }

      if (isBlank(state.noAddressCommentID)) {
        console.log('Creating no address comment')
        createNoAddressComment(pr, state)
            .then(response => setPRState(pr, _.assign({}, state, { noAddressCommentID: response.data.id })))
      }
    })
}

const closedIssue = async body => {
  const pr = pullRequest(body) 
  console.log('closedIssue', pr)

  getPRState(pr)
    .then(doc => {
      let state = doc.data()

      if (isPresent(state.payee)) {
        if (isBlank(state.paidTo)) {
          createRewardedComment(pr, state)
            .then(response => setPRState(pr, _.assign({}, state, { paidTo: state.payee })))
        } else if (isBlank(state.rewardClaimedCommentID)) {
          createRewardClaimedCommnt(pr, state)
            .then(response => setPRState(pr, _.assign({}, state, { rewardClaimedCommentID: response.data.id })))
        }
      }
    })
}

module.exports = router
