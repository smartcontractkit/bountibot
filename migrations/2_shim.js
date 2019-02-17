const Shim = artifacts.require('./Shim.sol')

const owner = '0xB7B3a015bd8089051678Db3144e69c47379C3d95'
const linkContract = '0x20fe562d797a42dcb3399062ae9546cd06f63280'
module.exports = deployer => {
  deployer.deploy(Shim, linkContract, owner)
}
