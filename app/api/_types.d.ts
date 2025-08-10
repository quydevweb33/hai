// Shared mini types for API docs (optional helper)
export type RegisterAttesterBody = { orgName: string; contact: string; bondHbar: number }
export type BuyerAckBody = { invoiceId: string; byAccountId?: string }
export type AnalyticsBody = { name: string; props?: Record<string, any>; ts: string }
