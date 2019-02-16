const Octokit = require('@octokit/rest')
const express = require('express')
const _ = require('lodash')
const { storage } = require('./firebase')

const router = express.Router()
const addressRegex = new RegExp(/\[bounty: (0x[a-f0-9]+)\]/, 'i')
const rewardAmount = 100

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_KEY}`
})

const botName = 'bountibot'
const lang = 'en'

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

const comments = {
  en: {
    noAddressComment: body =>
      `Greetings, my name is ${botName} 🤖.
    
We are offering rewards of ${rewardAmount} for contributions to ${body.repository.name}.

If you add a LINK address to your Github Bio or PR description, like so: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3]. We will send you ${rewardAmount} LINK when this PR is accepted!

${l18nComment('commandsAndOptionsText')}`,
    thankyou: (body, address) =>
      `Thanks for adding your Ethereum address ${
        body.repository.owner.login
      }! When this PR is approved and merged we will be sending ${rewardAmount} LINK to ${address}.`,
    commandsAndOptionsText: () => `---

<details>
<summary>${botName} commands and options</summary>
<br />

You can trigger ${botName} actions by commenting on this PR:
- \`@${botName} update\` look for the bounty address again
- \`@${botName} 🏴‍☠️\` respond to further actions in pirate mode

Finally, you can contact us by mentioning @${botName}.

</details>`
  },
  sp: {
    noAddressComment: body => `Aloha! Yo soy ${botName} 🤖.
    
Estamos ofreciendo ${rewardAmount} for contributions to ${body.repository.name}.

If you add a LINK address to your Github Bio or PR description, like so: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3]. We will send you ${rewardAmount} LINK when this PR is accepted!

${l18nComment('commandsAndOptionsText')}`
  },
  pirate: {
    noAddressComment: () => `Yaaaargh! I'm ${botName} ⛵️
    
We are offering booty to the value of ${rewardAmount} dubloons for contributions to this scurvy repository.

If you add a LINK address to your Github Bio or PR description, like so: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3]. We will send you ${rewardAmount} dubloons when this PR is accepted!

${l18nComment('commandsAndOptionsText')}`
  }
}

const l18nComment = (key, ...args) => {
  let comment = comments[lang][key]
  if (comment == null) {
    console.debug(`No comment for language '${lang}' falling back to en`)
    comment = comments.en[key]
  }
  return comment(...args)
}

const createComment = async comment => {
  const collection = storage.collection('pull_request_comments')

  const key = `${comment.full_repo_name}/${comment.owner}.${comment.number}`

  // Check storage to see if we already commented
  collection
    .get(key)
    .then(doc => {
      if (doc.exists) {
        console.debug('Comment already exists on PR')
        return
      }

      // Create comment
      const ghComment = _.pick(comment, ['owner', 'repo', 'number', 'body'])
      console.debug('posting GH comment', ghComment)
      octokit.issues
        .createComment(ghComment)
        .then(() => {
          // Record that we commented
          collection
            .doc(key)
            .set(comment)
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
