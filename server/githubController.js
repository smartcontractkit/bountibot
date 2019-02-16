const Octokit = require('@octokit/rest')
const express = require('express')

const router = express.Router()
const addressRegex = new RegExp(/\[bounty: (0x[a-f0-9]+)\]/, 'i')
const rewardAmount = 100

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_KEY}`
})

router.post('/gh_webhooks', (req, _res) => {
  console.debug('Got Github Webhook', 'action', req.body.action, 'repository', req.body.repository.name, 'owner', req.body.repository.owner.login)

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
      console.log('got webhook action', req.body.action)
      break
  }
})

const createNoAddressComment = async body => {
  const result = await octokit.issues
    .createComment({
      owner: body.repository.owner.login,
      repo: body.repository.name,
      number: body.pull_request.number,
      body: `Yaaaargh, I see you've made a PR on ${
        body.repository.name
      }. We are offering rewards of ${rewardAmount} LINK to all PRs that get merged to this repository. To claim your LINK, place an EIP155 Address in your PR's description, like so: [bounty: 0x356a04bce728ba4c62a30294a55e6a8600a320b3].`
    })
    .catch(console.error)
}

const createRewardableComment = async (body, address) => {
  const result = await octokit.issues
    .createComment({
      owner: body.repository.owner.login,
      repo: body.repository.name,
      number: body.pull_request.number,
      body: `${rewardAmount} LINK has been rewarded to ${address}`
    })
    .catch(console.error)
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
  }
}

module.exports = router
