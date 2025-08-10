"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type MirrorMsg = {
  consensus_timestamp: string
  message?: string // base64
  running_hash?: string
  sequence_number?: number
  payer_account_id?: string
  topic_id?: string
}

type ParsedItem = {
  ts: string
  seq: number
  type?: string
  invoiceId?: string
  raw: any
}

function decodeBase64(b64?: string): string {
  if (!b64) return ""
  try {
    // atob may throw for unicode; decode as UTF-8
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return new TextDecoder("utf-8").decode(bytes)
  } catch {
    try {
      return atob(b64)
    } catch {
      return ""
    }
  }
}

export default function MirrorEventFeed() {
  const [topicId, setTopicId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ParsedItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // restore saved topic
    const saved = localStorage.getItem("cashhash:mirrorTopic")
    if (saved) setTopicId(saved)
  }, [])

  useEffect(() => {
    let timer: any
    const tick = async () => {
      if (!topicId) return
      setLoading(true)
      setError(null)
      try {
        const url = `/api/mirror/topics/${encodeURIComponent(topicId)}/messages?order=desc&limit=50`
        const res = await fetch(url, { cache: "no-store" })
        const data = await res.json()
        const messages: MirrorMsg[] = Array.isArray(data?.messages) ? data.messages : []
        const parsed = messages.map((m) => {
          const text = decodeBase64(m.message)
          let obj: any = null
          try {
            obj = JSON.parse(text)
          } catch {
            obj = { text }
          }
          return {
            ts: m.consensus_timestamp,
            seq: m.sequence_number ?? 0,
            type: obj?.type,
            invoiceId: obj?.invoiceId,
            raw: obj,
          } as ParsedItem
        })
        setItems(parsed)
      } catch (e: any) {
        setError("Failed to fetch from Mirror Node.")
      } finally {
        setLoading(false)
      }
    }
    tick()
    timer = setInterval(tick, 3000)
    return () => clearInterval(timer)
  }, [topicId])

  const prettyTopic = useMemo(() => (topicId ? topicId : "—"), [topicId])

  const save = () => {
    localStorage.setItem("cashhash:mirrorTopic", topicId)
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Mirror Node Topic ID (testnet)</label>
          <Input
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            placeholder="e.g. 0.0.123456 (HCS topic)"
          />
          <div className="text-xs text-muted-foreground">
            Masukkan Topic ID HCS nyata (Hedera testnet). Feed akan polling setiap 3 detik.
          </div>
        </div>
        <div className="flex items-end">
          <Button onClick={save} variant="outline" className="w-full sm:w-auto bg-transparent">
            Save Topic
          </Button>
        </div>
      </div>

      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm">
            Topic: <b>{prettyTopic}</b>
          </div>
          <div className="flex items-center gap-2">
            {loading ? <Badge variant="outline">Loading…</Badge> : <Badge variant="secondary">Live</Badge>}
          </div>
        </div>
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No messages yet.</div>
        ) : (
          <ScrollArea className="h-[420px]">
            <ul className="space-y-2 pr-2">
              {items.map((it, idx) => (
                <li key={`${it.seq}-${idx}`} className="rounded-md border p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize" variant="secondary">
                        {(it.type ?? "message").toLowerCase()}
                      </Badge>
                      {it.invoiceId ? <span className="text-sm font-medium">{it.invoiceId}</span> : null}
                      <span className="text-xs text-muted-foreground">#{it.seq}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(Number(it.ts.split(".")[0]) * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 break-words">
                    {typeof it.raw === "object" ? JSON.stringify(it.raw) : String(it.raw)}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </Card>
    </div>
  )
}
