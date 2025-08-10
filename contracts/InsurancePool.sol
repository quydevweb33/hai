//// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
  Insurance Pool:
  - Receives slashed bonds and HTS fee shares (if routed).
  - Governance TBD.
*/

contract InsurancePool {
  event Funded(address indexed from, uint256 amount);

  receive() external payable {
    emit Funded(msg.sender, msg.value);
  }
}
