const BN = require('bn.js')
const request = require('request-promise').defaults({ jar: true })

// Used to authenticate to the chainlink API
const chainlinkCredentials = {
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
  authenticateToChainlink()
  specifyPaymentJob()
}

const hexToBytes = hex => {
  const rawHex = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = []
  for (let c = 0; c < rawHex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16))
  }
  return bytes
}

// payLink(address, amount) requests that the chainlink node pay amount
// LINK to address
const payLink = async (address, amount) => {
  await setupChainlink()
  const amountAsUint256 = BN(amount).toArray('be', 32)
  const createJobURL = `${jobSpecURL}/{paymentJob.data.id}/runs`
  const serializedFunctionArguments = hexToBytes(address).concat(amountAsUint256)
  await request.post(createJobURL, serializedFunctionArguments)
}

export { payLink as default }
