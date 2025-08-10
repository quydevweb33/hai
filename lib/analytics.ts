"use client"

export type AnalyticsEvent =
  | "connect_wallet"
  | "disconnect_wallet"
  | "kyc_completed"
  | "invoice_created"
  | "bond_posted"
  | "invoice_listed"
  | "invest_opened"
  | "invest_confirmed"
  | "buyer_ack"
  | "milestone_signed"
  | "payout_received"

export async function track(name: AnalyticsEvent, props?: Record<string, any>) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, props, ts: new Date().toISOString() }),
    })
  } catch {
    // noop in demo
  }
}
