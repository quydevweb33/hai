"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type EventMsg = {
  type: string
  invoiceId?: string
  risk?: string
  bondHbar?: number
  ts: string
  [k: string]: any
}

export default function EventFeed({ compact = false }: { compact?: boolean }) {
  const [events, setEvents] = useState<EventMsg[]>([])

  const load = async () => {
    const res = await fetch("/api/events", { cache: "no-store" })
    const data = await res.json()
    setEvents(data.events ?? [])
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <ScrollArea className={compact ? "h-[320px]" : "h-[480px]"}>
      <ul className="space-y-2 pr-2">
        {events
          .slice()
          .reverse()
          .map((e, idx) => (
            <li key={idx} className="rounded-md border p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="capitalize" variant="secondary">
                    {e.type.toLowerCase()}
                  </Badge>
                  {e.invoiceId ? <span className="text-sm font-medium">{e.invoiceId}</span> : null}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(e.ts).toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 break-words">{JSON.stringify(e)}</div>
            </li>
          ))}
      </ul>
    </ScrollArea>
  )
}
