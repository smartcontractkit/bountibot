pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./interfaces/LinkTokenInterface.sol";

contract Bountibot is Ownable {
  using SafeMath for uint256;

  address public githubServer;  // Listens to github, reports results there
  mapping(string => uint256) userBalances;  // github username => committed LINK
  mapping(string => bool) seenUser; // True iff the user has been seen
  string[] users; // List of github usernames referenced by the contract
  uint256 withdrawableLINK; // Total LINK balance in the contract
  uint256 committedLINK; // Total LINK committed to payouts
  uint256 payoutAmount = 1; // Amount to payout, when a completed PR is reported

  LinkTokenInterface internal LINK;

  constructor(address _link) Ownable() public {
    LINK = LinkTokenInterface(_link);
  }

  function onTokenTransfer(address _sender, uint256 _amount, bytes _data)
  public onlyLINK {
    withdrawableLINK += _amount;
  }

  function setPayoutAmount(uint256 _amount) public onlyGithubServer {
    payoutAmount = _amount;
  }

  function lINKAvailable() public view returns (uint256) {
    return withdrawableLINK.sub(committedLINK);
  }

  function rewardUser(string _githubUser) public onlyGithubServer returns (uint256){
    if (!seenUser[_githubUser]) {
      seenUser[_githubUser] = true;
      users.push(_githubUser);
    }
    require(lINKAvailable() >= payoutAmount);
    committedLINK = committedLINK.add(payoutAmount);
    userBalances[_githubUser] = userBalances[_githubUser].add(payoutAmount);
  }

  function payUser(string _githubUser, address _to) public onlyGithubServer {
    require(seenUser[_githubUser] && userBalances[_githubUser] > 0,
            "can only pay out to rewarded user");
    uint256 balance = userBalances[_githubUser];
    userBalances[_githubUser] = 0;
    committedLINK = committedLINK.sub(balance);
    withdrawableLINK = withdrawableLINK.sub(balance);
    LINK.transfer(_to, balance);
  }

  modifier onlyLINK() {
    require(msg.sender == address(LINK), "Must use LINK token"); 
    _;
  }

  modifier onlyGithubServer() {
    require(msg.sender == githubServer);
    _;
  }
}
