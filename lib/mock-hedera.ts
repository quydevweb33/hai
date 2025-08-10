import { POLICY } from "./policy"
import type { HcsEvent, Invoice } from "./types"

// In-memory simulation of Hedera FS/HCS/HTS/Contracts for demo
const state = {
  invoices: [] as Invoice[],
  events: [] as HcsEvent[],
  counters: {
    file: 80000,
    token: 120000,
    topic: 70001,
  },
  topicId: "0.0.70001",
  accounts: {
    treasury: "0.0.60001",
    insurancePool: "0.0.60002",
    community: "0.0.60003",
    escrow: "0.0.99999",
  },
  ftBalances: new Map<string, Map<string, number>>() as Map<string, Map<string, number>>,
  bonds: new Map<string, number>(),
  attesterBonds: new Map<string, number>(),
}

function newFileId() {
  state.counters.file += 1
  return `0.0.${state.counters.file}`
}
function newTokenId() {
  state.counters.token += 1
  return `0.0.${state.counters.token}`
}
function publish(event: Omit<HcsEvent, "ts">) {
  const msg = { ...event, ts: new Date().toISOString() }
  state.events.push(msg)
  return msg
}

export function getEvents() {
  return state.events
}
export function listInvoices() {
  return state.invoices
}

export function createInvoice(input: {
  buyer: string
  amountUSD: number
  maturity: string
  risk: "green" | "yellow" | "red"
  fileNames: string[]
}) {
  const id = `INV-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const fileIds = input.fileNames.map(() => newFileId())
  const nftId = newTokenId()
  const ftId = newTokenId()
  state.ftBalances.set(ftId, new Map<string, number>())

  let cap = POLICY.advanceRatePolicy.default
  cap = Math.min(cap + (input.fileNames.includes("po.pdf") ? (POLICY.advanceRatePolicy.byEvidence.hasPO ?? 0) : 0), 1)
  cap = Math.min(
    cap +
      (input.fileNames.some((n) => n.toLowerCase().includes("bol") || n.toLowerCase().includes("gr"))
        ? (POLICY.advanceRatePolicy.byEvidence.hasBOLorGR ?? 0)
        : 0),
    1,
  )
  const capTier = POLICY.advanceRatePolicy.capsByRisk[input.risk] ?? POLICY.advanceRatePolicy.default
  cap = Math.min(cap, capTier)

  const invoice: Invoice = {
    id,
    buyer: input.buyer,
    amountUSD: input.amountUSD,
    maturity: input.maturity,
    risk: input.risk,
    nftId,
    ftId,
    fileIds,
    topicId: state.topicId,
    status: "LISTED",
    fundedUSD: 0,
    advanceRate: cap,
    investors: [],
  }
  state.invoices.unshift(invoice)
  publish({ type: "LISTED", invoiceId: id, risk: input.risk, bondHbar: 0, topicId: state.topicId })
  return invoice
}

export function postBond(invoiceId: string, amountHbar: number) {
  const inv = state.invoices.find((i) => i.id === invoiceId)
  if (!inv) return { ok: false, error: "Invoice not found" }
  inv.bondHbar = amountHbar
  state.bonds.set(invoiceId, amountHbar)
  publish({ type: "BOND_POSTED", invoiceId, bondHbar: amountHbar })
  return { ok: true, invoice: inv }
}

export function investToInvoice(invoiceId: string, amountCents: number, investor: string, txMemo: string) {
  const inv = state.invoices.find((i) => i.id === invoiceId)
  if (!inv) return { ok: false, error: "Invoice not found" }

  // HTS custom fixed fee (HBAR) distribution (simulated)
  const fee = POLICY.feesPolicy.htsCustomFixedFeeHbar
  const split = POLICY.feesPolicy.feeSplit
  publish({
    type: "HTS_FEE_DEDUCTED",
    tokenId: inv.ftId,
    feeHBAR: fee,
    collectors: {
      treasury: fee * split.treasury,
      insurancePool: fee * split.insurancePool,
      community: fee * split.community,
    },
    memo: txMemo,
  })

  // Update escrow FT and funded progress (decimals=2)
  const supply = state.ftBalances.get(inv.ftId)!
  const prev = supply.get(state.accounts.escrow) || 0
  supply.set(state.accounts.escrow, prev + amountCents)

  const usd = amountCents / 100
  inv.fundedUSD = Math.min(inv.fundedUSD + usd, Math.floor(inv.amountUSD * inv.advanceRate))
  if (inv.fundedUSD >= Math.floor(inv.amountUSD * 0.2)) inv.status = "FUNDED"
  inv.investors.push({ account: investor, amount: amountCents })

  publish({ type: "INVESTED", invoiceId, investor, amount: usd, fundedUSD: inv.fundedUSD })
  return { ok: true, invoice: inv }
}

export function attesterSign(attester: string, invoiceId: string, type: string) {
  const inv = state.invoices.find((i) => i.id === invoiceId)
  if (!inv) return { ok: false, error: "Invoice not found" }
  const minBond = POLICY.attesterPolicy.minBondHbar
  if (!state.attesterBonds.has(attester)) {
    state.attesterBonds.set(attester, minBond)
  }
  publish({ type, invoiceId, attester })
  if (type === "BUYER_ACK") inv.status = "ACKED"
  return { ok: true, invoice: inv }
}

export function payoutInvoice(invoiceId: string, amountPaidUSD: number, buyerPaymentTxn: string) {
  const inv = state.invoices.find((i) => i.id === invoiceId)
  if (!inv) return { ok: false, error: "Invoice not found" }
  const supply = state.ftBalances.get(inv.ftId)!
  const totalEscrow = supply.get(state.accounts.escrow) || 0
  const payouts: { account: string; usd: number }[] = []
  if (totalEscrow > 0) {
    const grouped = new Map<string, number>()
    inv.investors.forEach(({ account, amount }) => grouped.set(account, (grouped.get(account) || 0) + amount))
    for (const [account, amount] of grouped.entries()) {
      const share = amount / totalEscrow
      payouts.push({ account, usd: Math.round(amountPaidUSD * share * 100) / 100 })
    }
  }
  supply.set(state.accounts.escrow, 0)
  inv.status = "CLOSED"
  const bond = state.bonds.get(invoiceId) || 0
  state.bonds.delete(invoiceId)

  publish({ type: "PAID", invoiceId, buyerPaymentTxn, amountPaidUSD })
  publish({ type: "PAYOUT", invoiceId, payouts })
  publish({ type: "BOND_REFUND", invoiceId, refundHbar: bond })
  publish({ type: "CLOSED", invoiceId })

  return { ok: true, invoice: inv, payouts, refundHbar: bond }
}

export function getPortfolio(account: string) {
  const positions: { id: string; value: number; estReturn: number; maturity: string }[] = []
  let invested = 0
  let estReturnTotal = 0
  for (const inv of state.invoices) {
    const cents = inv.investors.filter((p) => p.account === account).reduce((s, p) => s + p.amount, 0)
    if (cents > 0) {
      const value = cents / 100
      const est = Math.round(value * 0.025 * 100) / 100 // rough 2.5% demo
      invested += value
      estReturnTotal += est
      positions.push({
        id: inv.id,
        value,
        estReturn: est,
        maturity: new Date(inv.maturity).toISOString().slice(0, 10),
      })
    }
  }
  return {
    positions,
    payoutsToday: 0,
    irr: 0.0,
    delinquency: 0.0,
    defaults: 0.0,
    invested: Math.round(invested * 100) / 100,
    estReturnTotal: Math.round(estReturnTotal * 100) / 100,
  }
}

// New function to register attesters and publish an event
export function registerAttester(input: { orgName: string; contact: string; bondHbar: number }) {
  const attesterId = `0.0.${Math.floor(Math.random() * 90000) + 10000}`
  state.attesterBonds.set(attesterId, input.bondHbar || (POLICY.attesterPolicy.minBondHbar ?? 0))
  publish({
    type: "ATTESTER_REGISTERED",
    attesterId,
    orgName: input.orgName,
    bondHbar: state.attesterBonds.get(attesterId),
  })
  return { ok: true, attesterId }
}

// Helper for Buyer ACK (buyer initiated)
export function buyerAck(invoiceId: string, byAccountId: string) {
  const inv = state.invoices.find((i) => i.id === invoiceId)
  if (!inv) return { ok: false, error: "Invoice not found" }
  inv.status = "ACKED"
  publish({ type: "BUYER_ACK", invoiceId, by: byAccountId })
  return { ok: true, invoice: inv }
}
