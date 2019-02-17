const Shim = artifacts.require('./Shim.sol')

const owner = '0x9CA9d2D5E04012C9Ed24C0e513C9bfAa4A2dD77f'
const linkContract = '0x20fe562d797a42dcb3399062ae9546cd06f63280'
module.exports = deployer => {
  deployer.deploy(Shim, linkContract, owner)
}
