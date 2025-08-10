"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, FileText } from "lucide-react"

export default function CreateInvoiceForm({ onCreated = async () => {} }: { onCreated?: () => Promise<void> | void }) {
  const [buyer, setBuyer] = useState("")
  const [amount, setAmount] = useState<number>(10000)
  const [maturity, setMaturity] = useState<string>(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10),
  )
  const [risk, setRisk] = useState<"green" | "yellow" | "red">("yellow")
  const [docs, setDocs] = useState<string[]>(["invoice.pdf", "po.pdf", "bol.pdf"])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const submit = async () => {
    setLoading(true)
    const fd = new FormData()
    fd.set("buyer", buyer || "Contoso Import Ltd.")
    fd.set("amountUSD", String(amount))
    fd.set("maturity", new Date(maturity).toISOString())
    fd.set("risk", risk)
    fd.set("fileNames", JSON.stringify(docs))
    const res = await fetch("/api/invoices", { method: "POST", body: fd })
    const data = await res.json()
    setResult(data)
    setLoading(false)
    await onCreated()
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Buyer</Label>
        <Input value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="Contoso Import Ltd." />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label>Amount (USD)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label>Maturity</Label>
          <Input type="date" value={maturity} onChange={(e) => setMaturity(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Risk</Label>
          <Select value={risk} onValueChange={(v) => setRisk(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Risk tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="yellow">Yellow</SelectItem>
              <SelectItem value="red">Red</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Dokumen (nama file)</Label>
        <Input
          value={docs.join(", ")}
          onChange={(e) =>
            setDocs(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder="invoice.pdf, po.pdf, bol.pdf"
        />
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" /> Untuk demo, sistem mensimulasikan File Service IDs dari nama file.
        </div>
      </div>
      <Button onClick={submit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
        {loading ? "Creating..." : "Create & List"}
      </Button>

      {result?.invoice && (
        <Card>
          <CardContent className="py-4 text-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Created
            </div>
            <div className="mt-2 grid gap-1">
              <div>
                Invoice ID: <b>{result.invoice.id}</b>
              </div>
              <div>
                NFT ID: <b>{result.invoice.nftId}</b> | FT ID: <b>{result.invoice.ftId}</b>
              </div>
              <div>
                File IDs: <b>{result.invoice.fileIds.join(", ")}</b>
              </div>
              <div>
                Topic: <b>{result.invoice.topicId}</b>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
