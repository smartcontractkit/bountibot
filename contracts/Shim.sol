pragma solidity 0.4.24;

import "./interfaces/LinkTokenInterface.sol";

contract Shim {
  uint256 private payoutAmount;
  address private oracle;
  LinkTokenInterface private LINK;

  constructor(address _link, address _oracle) public {
    payoutAmount = 1 ether;
    oracle = _oracle;
    LINK = LinkTokenInterface(_link);
  }

  function reward(bytes32 _recipient) onlyOracle public {
    LINK.transfer(address(_recipient), payoutAmount);
  }

  function setPayoutAmount(uint256 _payoutAmount) onlyOracle public {
    payoutAmount = _payoutAmount;
  }

  modifier onlyOracle() {
    require(msg.sender == oracle, "Can only be run by oracle");
    _;
  }
}
