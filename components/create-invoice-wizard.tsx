"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { track } from "@/lib/analytics"
import SecureFileUpload from "@/components/secure-file-upload"

export default function CreateInvoiceWizard({ onDone = async () => {} }: { onDone?: () => Promise<void> | void }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<any>(null)
  const [form, setForm] = useState({
    amount: 15000,
    currency: "USD",
    buyer: "BUYER_CO_001",
    maturity: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
    country: "GH",
    desc: "Export goods",
    yieldBps: 250,
  })
  const [docs, setDocs] = useState({ po: true, inv: true, bol: false })
  const [secureFiles, setSecureFiles] = useState<{ name: string; fsName: string }[]>([])

  const bond = useMemo(() => {
    const percent = form.amount * 0.01
    const base = 300
    return Math.round(Math.max(250, Math.min(5000, Math.max(base, percent))))
  }, [form.amount])

  const next = () => setStep((s) => Math.min(3, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  const submit = async () => {
    setLoading(true)
    const files = [
      ...(docs.inv ? ["invoice.pdf"] : []),
      ...(docs.po ? ["po.pdf"] : []),
      ...(docs.bol ? ["bol.pdf"] : []),
      ...secureFiles.map((f) => f.fsName),
    ]
    const fd = new FormData()
    fd.set("buyer", form.buyer)
    fd.set("amountUSD", String(form.amount))
    fd.set("maturity", new Date(form.maturity).toISOString())
    fd.set("risk", docs.bol ? "green" : "yellow")
    fd.set("fileNames", JSON.stringify(files))
    const r = await fetch("/api/invoices", { method: "POST", body: fd })
    const j = await r.json()
    const inv = j.invoice
    if (inv) {
      await track("invoice_created", { invoiceId: inv.id, amountUSD: form.amount, buyer: form.buyer })
      await fetch("/api/bond/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ invoiceId: inv.id, amountHbar: bond }),
      })
      await track("bond_posted", { invoiceId: inv.id, bondHbar: bond })
      setCreated(inv)
      await track("invoice_listed", { invoiceId: inv.id })
      await onDone()
      setStep(1)
    }
    setLoading(false)
    setSecureFiles([])
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Create invoice</CardTitle>
          <CardDescription>3 steps: details • documents • terms & bond</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Stepper step={step} />
          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Amount (USD)</label>
                <Input
                  type="number"
                  min={1000}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                />
                <div className="text-xs text-muted-foreground">Advance depends on evidence & risk.</div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Buyer ID</label>
                <Input value={form.buyer} onChange={(e) => setForm((f) => ({ ...f, buyer: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Maturity date</label>
                <Input
                  type="date"
                  value={form.maturity}
                  onChange={(e) => setForm((f) => ({ ...f, maturity: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Country</label>
                <Select value={form.country} onValueChange={(v) => setForm((f) => ({ ...f, country: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GH">GH</SelectItem>
                    <SelectItem value="CI">CI</SelectItem>
                    <SelectItem value="BD">BD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  rows={3}
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <UploadTile label="PO Document" ok={docs.po} onToggle={() => setDocs((d) => ({ ...d, po: !d.po }))} />
              <UploadTile
                label="Invoice Document"
                ok={docs.inv}
                onToggle={() => setDocs((d) => ({ ...d, inv: !d.inv }))}
              />
              <UploadTile label="BOL / GR" ok={docs.bol} onToggle={() => setDocs((d) => ({ ...d, bol: !d.bol }))} />
              <div className="sm:col-span-3 grid gap-2">
                <div className="text-sm font-medium">Or upload securely (encrypted)</div>
                <SecureFileUpload
                  onUploaded={(items) => setSecureFiles(items.map((i) => ({ name: i.name, fsName: i.fsName })))}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxFiles={6}
                />
                <div className="text-xs text-muted-foreground">
                  Files are encrypted in your browser (AES‑GCM). Server stores only ciphertext. For the demo, we pass
                  the returned fsName values into invoice creation.
                </div>
              </div>
              <div className="sm:col-span-3 text-xs text-muted-foreground">
                At least PO and Invoice are required. BOL/GR unlocks 90% advance rate.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Yield (bps)</label>
                <Input
                  type="number"
                  min={100}
                  max={500}
                  step={10}
                  value={form.yieldBps}
                  onChange={(e) => setForm((f) => ({ ...f, yieldBps: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Advance rate</label>
                <div className="rounded-md border bg-muted px-3 py-2 text-sm">{docs.bol ? "90%" : "80%"}</div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Posting Bond (HBAR)</label>
                <div className="rounded-md border bg-muted px-3 py-2 text-sm">{bond} HBAR</div>
                <div className="text-xs text-muted-foreground">Refunded on success; slashed on fraud/default.</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={back} className={step === 1 ? "invisible" : ""}>
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={next}>Next</Button>
            ) : (
              <Button onClick={submit} disabled={loading} className="bg-violet-600 hover:bg-violet-700">
                {loading ? "Processing..." : "Post Bond & List"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {created && (
        <Card>
          <CardContent className="py-4 text-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Listed! HCS: LISTED • {created.id}
            </div>
            <div className="mt-2 grid gap-1">
              <div>
                Invoice ID: <b>{created.id}</b>
              </div>
              <div>
                NFT: <b>{created.nftId}</b> • FT: <b>{created.ftId}</b>
              </div>
              <div>
                FS: <b>{created.fileIds.join(", ")}</b>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Stepper({ step }: { step: number }) {
  const items = ["Details", "Documents", "Terms & Bond"]
  return (
    <ol className="grid grid-cols-3 gap-2 text-sm">
      {items.map((label, i) => {
        const n = i + 1
        const active = step === n
        const done = step > n
        return (
          <li
            key={label}
            className={[
              "flex items-center gap-2 rounded-md border px-3 py-2",
              done
                ? "border-emerald-200 bg-emerald-50"
                : active
                  ? "border-violet-200 bg-violet-50"
                  : "border-slate-200",
            ].join(" ")}
          >
            <span
              className={[
                "grid h-5 w-5 place-items-center rounded-full text-xs",
                done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-violet-600 text-white"
                    : "bg-slate-200 text-slate-700",
              ].join(" ")}
            >
              {n}
            </span>
            <span className={done ? "text-emerald-700" : active ? "text-violet-700" : "text-muted-foreground"}>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function UploadTile({ label, ok, onToggle }: { label: string; ok: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={[
        "flex h-24 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm transition",
        ok
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-300 hover:border-violet-300 hover:bg-violet-50",
      ].join(" ")}
      aria-label={label}
    >
      {ok ? "Uploaded" : "Upload"} — {label}
    </button>
  )
}
