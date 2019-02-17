pragma solidity 0.4.24;

import "./interfaces/LinkTokenInterface.sol";

contract Shim {
  uint256 payoutAmount = 1;
  address oracle;
  LinkTokenInterface internal LINK;

  constructor(address _link, address _oracle) public {
    oracle = _oracle;
    LINK = LinkTokenInterface(_link);
  }

  function reward(bytes32 _recipient) onlyOracle public {
    LINK.transfer(address(_recipient), payoutAmount);
  }

  modifier onlyOracle() {
    require(msg.sender == oracle, "Can only be run by oracle");
    _;
  }
}
