# CashHash Demo (Hedera-Native RWA Invoice Factoring)

This is a full-stack demo running entirely in-browser (Next.js). It simulates:
- Hedera File Service (FS): fileIds from names
- Hedera Consensus Service (HCS): events array
- Hedera Token Service (HTS): NFT/FT IDs + custom fixed fee (HBAR) splits
- Smart Contracts (Escrow/Bond/Insurance): Solidity skeletons in /contracts

Pages:
- / — Marketplace + Event Feed
- /exporter — Create invoice, Post Bond, Events
- /attesters — Post BUYER_ACK/PICKUP
- /demo — One-click 7-minute script steps

APIs:
- POST /api/invoices — create & list (mint NFT/FT, publish LISTED)
- GET /api/invoices — list invoices
- POST /api/bond/post — post HBAR bond
- POST /api/invoices/[id]/invest — invest (FT ➜ escrow, HCS INVESTED, fee split)
- POST /api/attesters/[id]/sign — attester milestones (BUYER_ACK, ...)
- POST /api/invoices/[id]/payout — payout pro-rata, refund/slash, close

Config:
- /config/policy.json — bond, slashing, advance-rate, fees, attester

Deploy:
- Use "Deploy" in v0, then wire real Hedera SDK + precompiles and env vars.
