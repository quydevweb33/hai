export type RiskTier = "green" | "yellow" | "red"

export type Invoice = {
  id: string
  buyer: string
  amountUSD: number
  maturity: string
  risk: RiskTier
  nftId: string
  ftId: string
  fileIds: string[]
  topicId: string
  status: "LISTED" | "FUNDED" | "ACKED" | "PAID" | "CLOSED"
  fundedUSD: number
  advanceRate: number
  bondHbar?: number
  investors: { account: string; amount: number }[]
}

export type HcsEvent = {
  type: string
  ts: string
  [k: string]: any
}

export type Policy = {
  bondPolicy: { percentOfInvoice: number; baseHbar: number; minHbar: number; maxHbar: number }
  slashingPolicy: {
    fraud: number
    noBuyerAck: number
    latePaymentDays: { gt?: number; lte?: number; slash: number }[]
  }
  advanceRatePolicy: {
    default: number
    byEvidence: { hasPO?: number; hasBOLorGR?: number; buyerAck?: number }
    capsByRisk: Record<RiskTier, number>
  }
  feesPolicy: {
    htsCustomFixedFeeHbar: number
    platformPct: number
    feeSplit: { treasury: number; insurancePool: number; community: number }
  }
  attesterPolicy: { minBondHbar: number; slashOnBadSign: number; minAttestersForHighRisk: number }
}
