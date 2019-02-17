const request = require('request-promise').defaults({ jar: true })

// Used to authenticate to the chainlink API
const chainlinkCredentials = {
  email: process.env.BB_CHAINLINK_EMAIL,
  password: process.env.BB_CHAINLINK_PASSWORD
}

const chainlinkNodeURL = process.env.BB_CHAINLINK_NODE_URL
const chainlinkAuthenticationURL = `${chainlinkNodeURL}/sessions`
const jobSpecURL = `${chainlinkNodeURL}/v2/specs`

// All hardcoded to ropsten
const LINKContractAddress = '0x20fe562d797a42dcb3399062ae9546cd06f63280'
const ShimContractAddress = '0xCBa58C719d2468Ff03bB6406294cA6E24B79a053'

// payLink(recipientAddress, amount) requests that the chainlink node pay amount
// LINK to recipientAddress
const payLink = async recipientAddress => {
  await setupChainlink()
  const paddedAddress = '0'.repeat(24) + recipientAddress
  const createJobURL = `${jobSpecURL}/${paymentJob.data.id}/runs`
  const resp = await request.post(createJobURL, {
    json: { result: paddedAddress }
  })
  return { chainlink: resp, recipientAddress }
}

const setupChainlink = async () => {
  await authenticateToChainlink()
  await specifyPaymentJob()
}

let authenticatedToChainlink = false
const authenticateToChainlink = async () => {
  if (!authenticatedToChainlink) {
    await request.post(chainlinkAuthenticationURL, { json: chainlinkCredentials })
    authenticatedToChainlink = true
  }
}

const paymentJobSpec = {
  initiators: [{ type: 'web' }],
  tasks: [
    {
      type: 'ethtx',
      confirmations: 0,
      params: {
        address: ShimContractAddress,
        functionSelector: 'reward(bytes32)'
      }
    }
  ]
}

let paymentJob
const specifyPaymentJob = async () => {
  if (paymentJob === undefined) {
    paymentJob = await request.post(jobSpecURL, { json: paymentJobSpec })
  }
}

module.exports = {
  payLink
}
