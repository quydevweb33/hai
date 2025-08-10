"use server"

export type PublishResult =
  | { ok: true; txId?: string }
  | { ok: false; reason: "not-configured" | "sdk-missing" | "error"; error?: string }

function getEnv() {
  const operatorId = process.env.HEDERA_OPERATOR_ID
  const operatorKey = process.env.HEDERA_OPERATOR_KEY
  const network = process.env.HEDERA_NETWORK || "testnet"
  const topicId = process.env.HCS_TOPIC_ID
  const configured = Boolean(operatorId && operatorKey && topicId)
  return { operatorId, operatorKey, network, topicId, configured }
}

export function isHederaConfigured() {
  return getEnv().configured
}

/**
 * Publish a JSON message to HCS if env vars and SDK are available.
 * Falls back with a graceful "not-configured" when envs are missing.
 */
export async function publishHcsEvent(type: string, payload: Record<string, any> = {}): Promise<PublishResult> {
  const { operatorId, operatorKey, network, topicId, configured } = getEnv()
  if (!configured) return { ok: false, reason: "not-configured" }

  let Client: any
  let TopicMessageSubmitTransaction: any
  try {
    // Dynamic import to avoid bundling SDK when not used.
    const sdk = await import("@hashgraph/sdk")
    Client = sdk.Client
    TopicMessageSubmitTransaction = sdk.TopicMessageSubmitTransaction
  } catch {
    return { ok: false, reason: "sdk-missing" }
  }

  try {
    const client =
      network === "mainnet"
        ? Client.forMainnet().setOperator(operatorId!, operatorKey!)
        : Client.forTestnet().setOperator(operatorId!, operatorKey!)
    const messageObj = { type, ...payload }
    const message = JSON.stringify(messageObj)
    const tx = await new TopicMessageSubmitTransaction({
      topicId,
      message,
    }).execute(client)
    const receipt = await tx.getReceipt(client)
    const txId = tx.transactionId?.toString?.() || ""
    // Optionally return receipt.topicSequenceNumber if needed
    return { ok: true, txId }
  } catch (e: any) {
    return { ok: false, reason: "error", error: e?.message || "Unknown error" }
  }
}
