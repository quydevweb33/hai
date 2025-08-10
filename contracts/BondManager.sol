//// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
  Bond Manager:
  - Holds exporter bonds in HBAR/HTS token.
  - Refunds on success; slashes to InsurancePool on fraud/late/no-ACK.
*/

interface IInsurancePool {
  function fund(uint256 amount) external;
}

contract BondManager {
  address public owner;
  address public insurancePool;

  struct Bond {
    address exporter;
    uint256 amount;
    bool active;
  }

  mapping(bytes32 => Bond) public bonds; // invKey -> bond

  event BondPosted(bytes32 indexed invKey, address indexed exporter, uint256 amount, string invoiceId);
  event Refunded(bytes32 indexed invKey, uint256 amount, string invoiceId);
  event Slashed(bytes32 indexed invKey, uint256 amount, string reason, string invoiceId);

  modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

  constructor(address _insurancePool) {
    owner = msg.sender;
    insurancePool = _insurancePool;
  }

  function post(string calldata invoiceId, address exporter) external payable {
    bytes32 k = keccak256(bytes(invoiceId));
    require(!bonds[k].active, "exists");
    bonds[k] = Bond({ exporter: exporter, amount: msg.value, active: true });
    emit BondPosted(k, exporter, msg.value, invoiceId);
  }

  function refund(string calldata invoiceId) external onlyOwner {
    bytes32 k = keccak256(bytes(invoiceId));
    Bond storage b = bonds[k];
    require(b.active, "no bond");
    b.active = false;
    (bool ok, ) = b.exporter.call{value: b.amount}("");
    require(ok, "refund fail");
    emit Refunded(k, b.amount, invoiceId);
  }

  function slash(string calldata invoiceId, uint256 pct, string calldata reason) external onlyOwner {
    bytes32 k = keccak256(bytes(invoiceId));
    Bond storage b = bonds[k];
    require(b.active, "no bond");
    b.active = false;
    uint256 slashAmt = (b.amount * pct) / 1e4; // pct in basis points
    uint256 refundAmt = b.amount - slashAmt;
    (bool ok1, ) = insurancePool.call{value: slashAmt}("");
    require(ok1, "pool fund fail");
    (bool ok2, ) = b.exporter.call{value: refundAmt}("");
    require(ok2, "refund fail");
    emit Slashed(k, slashAmt, reason, invoiceId);
  }
}
