const url = require('url')
const BN =  require('BN')
const request = require('request-promise').defaults({ jar: true })

const chainlinkCredentials = { // Used to authenticate to the chainlink API
  email: 'alx@mit.edu',
  password: 'passme11'
}

const chainlinkNodeURL = 'http://localhost:6688'
const chainlinkAuthenticationURL = `${chainlinkNodeURL}/sessions`
const jobSpecURL = `${chainlinkNodeURL}/v2/specs`

// Google "Ropsten LINK contract address", and pull it out of etherscan
const LINKContractAddress = '0x20fe562d797a42dcb3399062ae9546cd06f63280'

let authenticatedToChainlink = false
const authenticateToChainlink = async () => {
  if (!authenticatedToChainlink) {
    await request.post(chainlinkAuthenticationURL, chainlinkCredentials)
  }
}

const paymentJobSpec = {
  'initiators': [{ 'type': 'web' }],
  'tasks': [
    {
      'type': 'ethtx',
      'confirmations': 0,
      'params': {
        'address': LINKContractAddress, // This should be a chainlink contract.
        'functionSelector': 'transfer(address,uint256)',
        'format': 'bytes'
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
  authenticateToChainlink()
  specifyPaymentJob()
}

// payLink(address, amount) requests that the chainlink node pay amount
// LINK to address
export const payLink = async (address, amount) => {
  await setupChainlink()
  const amountAsUint256 = BN(amount).toArray('be', 32)
  const createJobURL = `${jobSpecURL}/{paymentJob.data.id}/runs`
  const serializedFunctionArguments = hexToBytes(address).concat(amountAsUint256)
  await request.post(createJobURL, serializedFunctionArguments)
}

const hexToBytes = (hex) => {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2)
  }
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16))
  }
  return bytes
}
