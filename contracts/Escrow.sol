//// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
  Escrow for invoice factoring payouts on Hedera Smart Contract Service (EVM).
  Notes:
  - This is a skeleton for hackathon and audit later.
  - Token settlement is expected via HTS precompile or wrapped interfaces.
*/

interface IHTS {
  // Minimal interface placeholders for HTS precompile calls if used.
  // In production, integrate Hedera Token Service precompile as per docs.
}

contract Escrow {
  address public owner;
  address public bondManager;
  address public insurancePool;

  struct InvestorShare {
    address account;
    uint256 amount; // FT units, decimals per token
  }

  struct InvoiceData {
    address ftToken; // FT representing fractional claim
    uint256 totalEscrowed;
    bool closed;
  }

  mapping(bytes32 => InvoiceData) public invoices; // key = keccak256(invoiceId string)
  mapping(bytes32 => InvestorShare[]) public positions;

  event Deposited(bytes32 indexed invKey, address indexed investor, uint256 amount, string invoiceId);
  event Payout(bytes32 indexed invKey, uint256 paid, string invoiceId);
  event Closed(bytes32 indexed invKey, string invoiceId);

  modifier onlyOwner() {
    require(msg.sender == owner, "not owner");
    _;
  }

  constructor(address _bondManager, address _insurancePool) {
    owner = msg.sender;
    bondManager = _bondManager;
    insurancePool = _insurancePool;
  }

  function deposit(string calldata invoiceId, address investor, address ftToken, uint256 amount) external {
    bytes32 k = keccak256(bytes(invoiceId));
    InvoiceData storage inv = invoices[k];
    require(!inv.closed, "closed");
    if (inv.ftToken == address(0)) {
      inv.ftToken = ftToken;
    }
    inv.totalEscrowed += amount;
    positions[k].push(InvestorShare({account: investor, amount: amount}));
    emit Deposited(k, investor, amount, invoiceId);
  }

  function payout(string calldata invoiceId, uint256 amountPaid) external onlyOwner {
    bytes32 k = keccak256(bytes(invoiceId));
    InvoiceData storage inv = invoices[k];
    require(!inv.closed, "closed");
    // In production:
    // - transfer tokens (HBAR/USDC) to investors pro-rata
    // - call BondManager.refund(invoiceId) or slash on failure
    emit Payout(k, amountPaid, invoiceId);
  }

  function close(string calldata invoiceId) external onlyOwner {
    bytes32 k = keccak256(bytes(invoiceId));
    InvoiceData storage inv = invoices[k];
    require(!inv.closed, "closed");
    inv.closed = true;
    emit Closed(k, invoiceId);
  }
}
