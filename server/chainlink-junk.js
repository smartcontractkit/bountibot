const BN = require('bn.js')
const request = require('request-promise').defaults({ jar: true })

// Used to authenticate to the chainlink API
const chainlinkCredentials = {
  email: 'notreal@fakeemail.ch',
  password: 'twochains'
}

const chainlinkNodeURL = 'http://localhost:6688'
const chainlinkAuthenticationURL = `${chainlinkNodeURL}/sessions`
const jobSpecURL = `${chainlinkNodeURL}/v2/specs`

// Google "Ropsten LINK contract address", and pull it out of etherscan
const LINKContractAddress = '0x20fe562d797a42dcb3399062ae9546cd06f63280'

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
        address: LINKContractAddress,
        functionSelector: 'transfer(address,uint256)',
        functionSelector: 'sendLINKTo(bytes32)',
        format: 'bytes'
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

const setupChainlink = async () => {
  await authenticateToChainlink()
  await specifyPaymentJob()
}

// payLink(address, amount) requests that the chainlink node pay amount
// LINK to address
const payLink = async (address, amount) => {
  await setupChainlink()
  let amountAsUint256 = new BN(amount).toString(16)
  if (amountAsUint256.length > 64) {
    throw Error(`amount too large: ${amountAsUint256}`)
  }
  amountAsUint256 = '0'.repeat(64 - amountAsUint256.length) + amountAsUint256
  // paddedAddress = '0'.repeat(24) + address
  const createJobURL = `${jobSpecURL}/${paymentJob.data.id}/runs`
  const serializedFunctionArguments = amountAsUint256
  const resp = await request.post(createJobURL, {
    json: { value: serializedFunctionArguments }
  })
  return resp
}

payLink('0x20fe562d797a42dcb3399062ae9546cd06f63280', 1).then(a =>
  console.log('result', a)
)
