"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import InvoiceCard from "@/components/invoice-card"

type Invoice = {
  id: string
  buyer: string
  amountUSD: number
  maturity: string
  risk: "green" | "yellow" | "red"
  nftId: string
  ftId: string
  fileIds: string[]
  topicId: string
  status: string
  fundedUSD: number
  advanceRate: number
  bondHbar?: number
}

export default function MarketPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ risk: "ALL" })

  const refresh = async () => {
    setLoading(true)
    const res = await fetch("/api/invoices", { cache: "no-store" })
    const data = await res.json()
    setInvoices(data.invoices ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const visible = useMemo(() => {
    return invoices.filter((i) => filters.risk === "ALL" || i.risk === (filters.risk as any))
  }, [invoices, filters])

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Marketplace</CardTitle>
          <CardDescription>Explore tokenized export invoices and invest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Risk</label>
              <Select value={filters.risk} onValueChange={(v) => setFilters((f) => ({ ...f, risk: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="ALL" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ALL</SelectItem>
                  <SelectItem value="green">green</SelectItem>
                  <SelectItem value="yellow">yellow</SelectItem>
                  <SelectItem value="red">red</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="h-48 animate-pulse" />
            </Card>
          ))
        ) : visible.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">No results</CardContent>
          </Card>
        ) : (
          visible.map((inv) => <InvoiceCard key={inv.id} invoice={toCard(inv)} onActionDone={refresh} />)
        )}
      </div>
    </main>
  )
}

function toCard(inv: Invoice) {
  return {
    id: inv.id,
    buyer: inv.buyer,
    amountUSD: inv.amountUSD,
    maturity: inv.maturity,
    risk: inv.risk,
    nftId: inv.nftId,
    ftId: inv.ftId,
    fileIds: inv.fileIds,
    topicId: inv.topicId,
    status: inv.status,
    fundedUSD: inv.fundedUSD,
    advanceRate: inv.advanceRate,
    bondHbar: inv.bondHbar ?? 0,
  }
}
