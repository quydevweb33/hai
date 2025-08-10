"use client"

import type React from "react"
import { useMemo, useState, useEffect } from "react"
import {
  ArrowRight,
  WalletIcon,
  FilePlus2,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  Info,
  Trash2,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Stepper from "./Stepper" // Import Stepper component
import UploadTile from "./UploadTile" // Import UploadTile component
import RiskBadge from "./RiskBadge" // Import RiskBadge component
import Kpi from "./Kpi" // Import Kpi component

// -------------------- Utilities --------------------
const cn = (...v: (string | false | null | undefined)[]) => v.filter(Boolean).join(" ")
const money = (n: number, cur = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency: cur }).format(Number(n || 0))
const pct = (n: number) => `${Math.max(0, Math.min(100, n)).toFixed(0)}%`
const nowIso = () => new Date().toISOString()
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Risk palette
const RISK = {
  green: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-300",
    dot: "bg-emerald-500",
    label: "Low risk",
  },
  yellow: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-300",
    dot: "bg-amber-500",
    label: "Medium risk",
  },
  red: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-300", dot: "bg-rose-500", label: "High risk" },
} as const

type RiskKey = keyof typeof RISK

// -------------------- API Client (wired) --------------------
// Prefer local Next.js API; fallback to mock if it fails.
const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE as string) || ""
const base = BASE_URL || ""

const api = {
  async listInvoices(params: Record<string, any> = {}) {
    try {
      const q = new URLSearchParams(params).toString()
      const r = await fetch(`${base}/api/invoices${q ? `?${q}` : ""}`, { cache: "no-store" })
      const j = await r.json()
      // Map server invoices to UI items
      if (Array.isArray(j?.invoices)) {
        return j.invoices.map((x: any) => ({
          id: x.id,
          exporter: x.buyer || "Exporter",
          country: "GH",
          amount: x.amountUSD,
          currency: "USD",
          tenor: Math.max(1, Math.round((new Date(x.maturity).getTime() - Date.now()) / 86400000)),
          yieldBps: 250,
          fundedPct: x.amountUSD > 0 ? Math.min(100, (x.fundedUSD / x.amountUSD) * 100) : 0,
          risk: x.risk as RiskKey,
          bondHbar: x.bondHbar ?? 0,
        }))
      }
      return MOCK_INVOICES
    } catch {
      return MOCK_INVOICES
    }
  },
  async createInvoice(form: {
    amount: number
    buyer: string
    maturity: string
    yieldBps: number
    country: string
    desc: string
    hasPO?: boolean
    hasINV?: boolean
    hasBOL?: boolean
  }) {
    try {
      const fd = new FormData()
      fd.set("buyer", form.buyer)
      fd.set("amountUSD", String(form.amount))
      fd.set("maturity", new Date(form.maturity).toISOString())
      fd.set("risk", form.hasBOL ? "green" : "yellow")
      const files = [
        ...(form.hasINV ? ["invoice.pdf"] : []),
        ...(form.hasPO ? ["po.pdf"] : []),
        ...(form.hasBOL ? ["bol.pdf"] : []),
      ]
      fd.set("fileNames", JSON.stringify(files))
      const r = await fetch(`${base}/api/invoices`, { method: "POST", body: fd })
      const j = await r.json()
      return {
        invoiceId: j?.invoice?.id ?? randomId(),
        nftId: j?.invoice?.nftId ?? "0.0.123",
        ftId: j?.invoice?.ftId ?? "0.0.124",
        fileIds: j?.invoice?.fileIds ?? ["0.0.80001"],
        topicId: j?.invoice?.topicId ?? "0.0.70001",
      }
    } catch {
      return { invoiceId: randomId(), nftId: "0.0.123", ftId: "0.0.124", fileIds: ["0.0.80001"], topicId: "0.0.70001" }
    }
  },
  async postBond(invoiceId: string, amountHbar: number) {
    try {
      const r = await fetch(`${base}/api/bond/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amountHbar }),
      })
      return await r.json()
    } catch {
      return { transactionId: `mock@${Date.now()}`, consensusAt: nowIso() }
    }
  },
  async invest(invoiceId: string, amountUnits: number, investorAccountId: string) {
    try {
      const r = await fetch(`${base}/api/invoices/${invoiceId}/invest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUnits, investorAccountId }),
      })
      return await r.json()
    } catch {
      return { transactionId: `mock@${Date.now()}`, consensusAt: nowIso() }
    }
  },
  async payout(invoiceId: string) {
    try {
      const r = await fetch(`${base}/api/invoices/${invoiceId}/payout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid: 0, buyerPaymentTxn: "0x" }),
      })
      return await r.json()
    } catch {
      return { transactionId: `mock@${Date.now()}`, consensusAt: nowIso() }
    }
  },
  async attesterRegister(orgName: string, contact: string, bondHbar: number) {
    try {
      const r = await fetch(`${base}/api/attesters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, contact, bondHbar }),
      })
      return await r.json()
    } catch {
      return { transactionId: `mock@${Date.now()}`, consensusAt: nowIso(), orgName, contact, bondHbar }
    }
  },
  async sign(attesterId: string, payload: Record<string, any>) {
    try {
      const r = await fetch(`${base}/api/attesters/${attesterId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const j = await r.json()
      return { topicId: "0.0.70001", sequenceNumber: String(Date.now() % 1000), consensusTimestamp: nowIso(), ...j }
    } catch {
      return { topicId: "0.0.70001", sequenceNumber: String(Date.now() % 1000), consensusTimestamp: nowIso() }
    }
  },
}

// -------------------- Mock Data --------------------
const MOCK_INVOICES = [
  {
    id: "INV-8A21",
    exporter: "SpiceCo (GH)",
    country: "GH",
    amount: 15000,
    currency: "USD",
    tenor: 60,
    yieldBps: 250,
    fundedPct: 37,
    risk: "yellow",
    bondHbar: 600,
  },
  {
    id: "INV-19D2",
    exporter: "CacaoTrade (CI)",
    country: "CI",
    amount: 22000,
    currency: "USD",
    tenor: 45,
    yieldBps: 280,
    fundedPct: 64,
    risk: "green",
    bondHbar: 720,
  },
  {
    id: "INV-71B9",
    exporter: "Textila (BD)",
    country: "BD",
    amount: 12000,
    currency: "USD",
    tenor: 75,
    yieldBps: 320,
    fundedPct: 18,
    risk: "yellow",
    bondHbar: 480,
  },
]

// -------------------- App --------------------
function App() {
  const [route, setRoute] = useState<"home" | "market" | "create" | "portfolio" | "attester" | "buyer" | "learn">(
    "home",
  )
  const [connected, setConnected] = useState(false)
  const [accountId, setAccountId] = useState("")
  const [events, setEvents] = useState<{ type: string; text: string; ts: string }[]>([
    { type: "SYSTEM", text: "HCS stream connected", ts: nowIso() },
  ])
  const pushEvent = (e: { type: string; text: string }) => setEvents((s) => [{ ...e, ts: nowIso() }, ...s].slice(0, 80))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
      <Header
        route={route}
        setRoute={setRoute}
        connected={connected}
        accountId={accountId}
        onConnect={(acc) => {
          setConnected(true)
          setAccountId(acc)
        }}
      />
      {route === "home" && <Home setRoute={setRoute} />}
      {route === "create" && <CreateInvoice onListed={(id) => pushEvent({ type: "LISTED", text: `Listed ${id}` })} />}
      {route === "market" && <Marketplace pushEvent={pushEvent} />}
      {route === "portfolio" && <Portfolio />}
      {route === "attester" && <Attester pushEvent={pushEvent} />}
      {route === "buyer" && <BuyerAck pushEvent={pushEvent} />}
      {route === "learn" && <Learn />}

      <aside className="mx-auto w-full max-w-7xl px-4 pb-6">
        <EventStream events={events} />
      </aside>
      <Footer />
    </div>
  )
}

// -------------------- Header / Footer --------------------
function Header({
  route,
  setRoute,
  connected,
  accountId,
  onConnect,
}: {
  route: string
  setRoute: (r: any) => void
  connected: boolean
  accountId: string
  onConnect: (acc: string) => void
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white shadow-sm">CH</div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">CashHash</h1>
            <p className="text-xs text-slate-500">Hedera‑native RWA Invoice Factoring</p>
          </div>
          <Badge tone="brand">100% Hedera</Badge>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          {[
            ["home", "Home"],
            ["market", "Marketplace"],
            ["create", "Create"],
            ["portfolio", "Portfolio"],
            ["attester", "Attester"],
            ["buyer", "Buyer ACK"],
            ["learn", "Learn"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setRoute(id)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-sm font-medium",
                route === id ? "bg-brand text-white" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {connected ? (
            <Pill>{accountId}</Pill>
          ) : (
            <Button onClick={() => onConnect(`0.0.${Math.floor(Math.random() * 90000) + 10000}`)}>
              <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/60 py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4">
        <p className="text-sm text-slate-500">{`© ${new Date().getFullYear()} CashHash — Built 100% on Hedera`}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Pill>HTS</Pill>
          <Pill>HCS</Pill>
          <Pill>File Service</Pill>
          <Pill>Smart Contracts</Pill>
        </div>
      </div>
    </footer>
  )
}

// -------------------- Home (Landing) --------------------
function Home({ setRoute }: { setRoute: (r: any) => void }) {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Instant liquidity for export invoices — <span className="text-brand">100% on Hedera</span>.
        </h2>
        <p className="mt-3 text-slate-600">
          Fund SMEs globally from $10 with on‑chain proof, real‑time audit (HCS), and automatic settlement. Stake HBAR
          to list; fees flow in HBAR via HTS custom fees.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="gap-2" onClick={() => setRoute("create")}>
            <FilePlus2 className="h-4 w-4" /> List your invoice
          </Button>
          <Button variant="soft" className="gap-2" onClick={() => setRoute("market")}>
            Invest from $10 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> HBAR Bond + Insurance Pool
          <span className="mx-1">•</span>
          <TrendingUp className="h-4 w-4 text-brand" /> Predictable fees, second‑finality
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <HeroMock />
      </div>
    </section>
  )
}

function HeroMock() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-slate-100" />
        <div className="h-4 w-16 rounded bg-slate-100" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-slate-100" />
              <div className="h-3 w-10 rounded bg-slate-100" />
            </div>
            <div className="mt-2 h-2 w-full rounded bg-slate-100" />
            <div className="mt-3 h-7 w-24 rounded bg-violet-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

// -------------------- Create Invoice --------------------
function CreateInvoice({ onListed }: { onListed?: (id: string) => void }) {
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    amount: 15000,
    currency: "USD",
    buyer: "BUYER_CO_001",
    maturity: daysFromNow(60),
    yieldBps: 250,
    country: "GH",
    desc: "Export spices",
  })
  const [docs, setDocs] = useState({ po: false, inv: false, bol: false })

  // Fixed parentheses syntax
  const bond = useMemo(
    () => Math.round(Math.max(250, Math.min(5000, Math.max(300, 0.01 * Number(form.amount || 0))))),
    [form.amount],
  )

  const advanceRate = docs.bol ? 0.9 : 0.8
  const next = () => setStep((s) => Math.min(3, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  const submit = async () => {
    if (!docs.po || !docs.inv) return alert("Please upload at least PO and Invoice")
    setBusy(true)
    await sleep(300)
    const created = await api.createInvoice({
      ...form,
      hasPO: docs.po,
      hasINV: docs.inv,
      hasBOL: docs.bol,
    })
    await api.postBond(created.invoiceId || randomId(), bond)
    setBusy(false)
    onListed?.(created.invoiceId || "INV-XXXX")
    alert(`Listed! Bond ${bond} HBAR posted.`)
    setStep(1)
    setDocs({ po: false, inv: false, bol: false })
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <Card title="Create invoice" subtitle="3 steps: details • documents • terms & bond">
        <Stepper step={step} />
        {step === 1 && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Amount (USD)" required>
              <Input
                type="number"
                value={form.amount}
                min={1000}
                step={100}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Buyer ID" required>
              <Input value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} />
            </Field>
            <Field label="Maturity date" required>
              <Input
                type="date"
                value={form.maturity}
                onChange={(e) => setForm({ ...form, maturity: e.target.value })}
              />
            </Field>
            <Field label="Country">
              <Select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                <option>GH</option>
                <option>CI</option>
                <option>BD</option>
                <option>ID</option>
              </Select>
            </Field>
            <Field label="Description">
              <Textarea rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <UploadTile label="PO Document" ok={docs.po} onToggle={() => setDocs({ ...docs, po: !docs.po })} />
            <UploadTile label="Invoice Document" ok={docs.inv} onToggle={() => setDocs({ ...docs, inv: !docs.inv })} />
            <UploadTile label="BOL / GR" ok={docs.bol} onToggle={() => setDocs({ ...docs, bol: !docs.bol })} />
            <div className="md:col-span-3 text-sm text-slate-600">
              At least PO and Invoice are required. BOL/GR raises advance rate and green risk color.
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Yield (bps)" hint="250 bps = 2.5%">
              <Input
                type="number"
                value={form.yieldBps}
                min={100}
                max={500}
                step={10}
                onChange={(e) => setForm({ ...form, yieldBps: Number(e.target.value) })}
              />
            </Field>
            <Field label="Advance rate">
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200">
                {(advanceRate * 100).toFixed(0)}%
              </div>
            </Field>
            <Field label="Posting Bond (HBAR)" hint="Required to list; refunded on success">
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200">{bond} HBAR</div>
            </Field>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" onClick={back} className={cn(step === 1 && "invisible")}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="soft">Post HBAR Bond</Button>
              <Button onClick={submit} disabled={busy}>
                {busy ? "Listing…" : "List Invoice"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  )
}

// -------------------- Marketplace + CheckoutSheet --------------------
function Marketplace({ pushEvent }: { pushEvent: (e: { type: string; text: string }) => void }) {
  const [items, setItems] = useState<any[]>([])
  const [filter, setFilter] = useState({ country: "ALL", risk: "ALL", tenor: "ALL" })
  const [active, setActive] = useState<any | null>(null)

  useEffect(() => {
    ;(async () => setItems(await api.listInvoices()))()
  }, [])

  const visible = useMemo(
    () =>
      items.filter(
        (i) =>
          (filter.country === "ALL" || i.country === filter.country) &&
          (filter.risk === "ALL" || i.risk === filter.risk) &&
          (filter.tenor === "ALL" || i.tenor <= Number.parseInt(filter.tenor)),
      ),
    [items, filter],
  )

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <Card title="Marketplace" subtitle="Browse tokenized export invoices with real‑time funding & risk signals">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Country">
            <Select value={filter.country} onChange={(e) => setFilter({ ...filter, country: e.target.value })}>
              <option>ALL</option>
              <option>GH</option>
              <option>CI</option>
              <option>BD</option>
              <option>ID</option>
            </Select>
          </Field>
          <Field label="Max Tenor">
            <Select value={filter.tenor} onChange={(e) => setFilter({ ...filter, tenor: e.target.value })}>
              <option value="ALL">ALL</option>
              <option value="45">≤ 45d</option>
              <option value="60">≤ 60d</option>
              <option value="90">≤ 90d</option>
            </Select>
          </Field>
          <Field label="Risk">
            <Select value={filter.risk} onChange={(e) => setFilter({ ...filter, risk: e.target.value })}>
              <option>ALL</option>
              <option>green</option>
              <option>yellow</option>
              <option>red</option>
            </Select>
          </Field>
        </div>
      </Card>

      {visible.length === 0 ? (
        <Card title="No results" subtitle="Try changing filters or check back later">
          <p className="text-sm text-slate-600">We couldn't find invoices for your current filters.</p>
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((inv: any) => (
            <InvoiceCard key={inv.id} inv={inv} onInvestClick={() => setActive(inv)} />
          ))}
        </div>
      )}

      {active && (
        <CheckoutSheet
          inv={active}
          onClose={() => setActive(null)}
          onConfirm={async (usd) => {
            await sleep(300)
            await api.invest(active.id, Math.round(usd * 100), "0.0.22222")
            setItems((list) =>
              list.map((i) =>
                i.id === active.id ? { ...i, fundedPct: Math.min(100, i.fundedPct + (usd / i.amount) * 100) } : i,
              ),
            )
            pushEvent({ type: "INVESTED", text: `Investor bought ${money(usd)} in ${active.id}` })
            setActive(null)
          }}
        />
      )}
    </section>
  )
}

function InvoiceCard({ inv, onInvestClick }: { inv: any; onInvestClick: () => void }) {
  return (
    <Card
      title={`${inv.exporter} — ${inv.id}`}
      subtitle={`${inv.tenor}d • Yield ${(inv.yieldBps / 100).toFixed(2)}% • Bond ${inv.bondHbar} HBAR`}
      actions={<RiskBadge risk={inv.risk} />}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Pill>{inv.country}</Pill>
          <Pill>{money(inv.amount, inv.currency)}</Pill>
          <Pill>Funded {pct(inv.fundedPct)}</Pill>
        </div>
        <Progress value={inv.fundedPct} />
        <div className="flex items-center justify-between">
          <Button onClick={onInvestClick} className="gap-2">
            Invest now <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <a className="underline decoration-slate-300 hover:decoration-violet-300" href="#">
              View Docs (FS)
            </a>
            <a className="underline decoration-slate-300 hover:decoration-violet-300" href="#">
              Events (HCS)
            </a>
          </div>
        </div>
      </div>
    </Card>
  )
}

function CheckoutSheet({
  inv,
  onClose,
  onConfirm,
}: {
  inv: any
  onClose: () => void
  onConfirm: (usd: number) => void
}) {
  const [usd, setUsd] = useState(100)
  const principal = usd
  const estReturn = (inv.yieldBps / 10000) * principal
  const htsFeeHbar = 0.25 // sample
  const platformFee = 0.0075 * principal
  const disabled = usd < 10 || usd > inv.amount

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/30 p-0 md:items-center md:justify-center md:p-8">
      <div className="w-full rounded-t-2xl bg-white p-4 shadow-2xl md:max-w-lg md:rounded-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Invest in {inv.id}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <Trash2 className="h-4 w-4 rotate-45" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Amount (USD)" hint="Min $10">
            <Input
              type="number"
              min={10}
              value={usd}
              onChange={(e) => setUsd(Number.parseFloat(e.target.value || "0"))}
            />
          </Field>
          <div className="rounded-2xl border border-slate-200 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Principal</span>
              <span>{money(principal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Est. return</span>
              <span>{money(estReturn)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>HTS fee</span>
              <span>{htsFeeHbar} HBAR</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Platform fee</span>
              <span>{money(platformFee)}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Info className="h-3.5 w-3.5" /> Each HTS transfer auto‑charges a small fee in HBAR.
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Tenor {inv.tenor}d
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={disabled} onClick={() => onConfirm?.(usd)} className="gap-2">
            Confirm &amp; Sign <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// -------------------- Portfolio + Charts --------------------
function Portfolio() {
  const [positions] = useState([
    { id: "INV-8A21", value: 500, estReturn: 59, maturity: daysFromNow(45), risk: "yellow" as RiskKey },
    { id: "INV-19D2", value: 250, estReturn: 31, maturity: daysFromNow(35), risk: "green" as RiskKey },
    { id: "INV-71B9", value: 100, estReturn: 12, maturity: daysFromNow(70), risk: "yellow" as RiskKey },
  ])
  const kpis = useMemo(
    () => ({
      invested: positions.reduce((s, p) => s + p.value, 0),
      est: positions.reduce((s, p) => s + p.estReturn, 0),
      count: positions.length,
    }),
    [positions],
  )
  const areaData = useMemo(
    () => Array.from({ length: 12 }).map((_, i) => ({ m: i + 1, v: 400 + i * 50 + (i % 3) * 30 })),
    [],
  )
  const pieData = useMemo(() => {
    const c = { green: 0, yellow: 0, red: 0 }
    positions.forEach((p) => c[p.risk]++)
    return Object.entries(c).map(([name, value]) => ({ name, value }))
  }, [positions])
  const RISKC: Record<string, string> = { green: "#10B981", yellow: "#F59E0B", red: "#EF4444" }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Kpi title="Invested" value={money(kpis.invested)} />
        <Kpi title="Est. return" value={money(kpis.est)} />
        <Kpi title="Positions" value={kpis.count} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Portfolio value (12m)" subtitle="Simulated">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" hide />
                <YAxis hide />
                <RTooltip contentStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="#6D28D9" fillOpacity={1} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Risk distribution">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                  {pieData.map((e, i) => (
                    <Cell key={i} fill={RISKC[e.name]} />
                  ))}
                </Pie>
                <RTooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Payouts (simulated)" subtitle="Next 8 weeks">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { w: "W1", v: 3 },
                  { w: "W2", v: 5 },
                  { w: "W3", v: 2 },
                  { w: "W4", v: 6 },
                  { w: "W5", v: 4 },
                  { w: "W6", v: 3 },
                  { w: "W7", v: 7 },
                  { w: "W8", v: 5 },
                ]}
              >
                <XAxis dataKey="w" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="v" fill="#6D28D9" radius={[6, 6, 0, 0]} />
                <RTooltip contentStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </section>
  )
}

// -------------------- Attester & Buyer --------------------
function Attester({ pushEvent }: { pushEvent: (e: { type: string; text: string }) => void }) {
  const [orgName, setOrg] = useState("FastForward Logistics")
  const [contact, setContact] = useState("ops@ffl.co")
  const [bond, setBond] = useState(1000)
  const [invoiceId, setInvoice] = useState("INV-8A21")
  const [milestone, setMilestone] = useState("PICKUP")

  const register = async () => {
    await api.attesterRegister(orgName, contact, bond)
    alert("Attester registered (HBAR bond posted)")
  }
  const sign = async () => {
    const res = await api.sign("0.0.77777", { invoiceId, milestone, notes: "ok", timestamp: nowIso() })
    pushEvent({ type: milestone, text: `${milestone} for ${invoiceId} (seq ${res.sequenceNumber})` })
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Register attester" subtitle="Stake HBAR; build reputation">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Org name">
              <Input value={orgName} onChange={(e) => setOrg(e.target.value)} />
            </Field>
            <Field label="Contact">
              <Input value={contact} onChange={(e) => setContact(e.target.value)} />
            </Field>
            <Field label="Bond (HBAR)">
              <Input type="number" value={bond} onChange={(e) => setBond(Number.parseInt(e.target.value || "0"))} />
            </Field>
          </div>
          <div className="mt-3">
            <Button onClick={register}>Register</Button>
          </div>
        </Card>
        <Card title="Sign milestone" subtitle="PICKUP • EXPORT • CUSTOMS • DELIVERED • BUYER_ACK">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Invoice ID">
              <Input value={invoiceId} onChange={(e) => setInvoice(e.target.value)} />
            </Field>
            <Field label="Milestone">
              <Select value={milestone} onChange={(e) => setMilestone((e.target as HTMLSelectElement).value)}>
                {"PICKUP EXPORT CUSTOMS DELIVERED BUYER_ACK".split(" ").map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-3">
            <Button onClick={sign}>Sign milestone</Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

function BuyerAck({ pushEvent }: { pushEvent: (e: { type: string; text: string }) => void }) {
  const [invoiceId, setInvoice] = useState("INV-8A21")
  const ack = async () => {
    const res = await api.sign("buyer-1", { invoiceId, milestone: "BUYER_ACK", notes: "accepted", timestamp: nowIso() })
    pushEvent({ type: "BUYER_ACK", text: `Buyer ACK for ${invoiceId} (seq ${res.sequenceNumber})` })
  }
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <Card title="Buyer Acknowledgement" subtitle="Confirm invoice reception & terms">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Invoice ID">
            <Input value={invoiceId} onChange={(e) => setInvoice(e.target.value)} />
          </Field>
        </div>
        <div className="mt-3">
          <Button onClick={ack}>Acknowledge</Button>
        </div>
      </Card>
    </section>
  )
}

// -------------------- Learn --------------------
function Learn() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <Card title="How CashHash works" subtitle="4 steps • 100% on Hedera">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            <b>Upload &amp; Verify:</b> Docs to File Service; hashes public; event to HCS.
          </li>
          <li>
            <b>Tokenize:</b> NFT identity + FT fractions via HTS; custom fees in HBAR.
          </li>
          <li>
            <b>Fund:</b> Investors buy from $10; exporter gets 80–90% advance.
          </li>
          <li>
            <b>Settle:</b> Buyer pays; contract auto‑payouts; burn/archive; bond refund.
          </li>
        </ol>
      </Card>
      <Card title="HBAR flywheel" subtitle="Bond • Slashing • Insurance Pool">
        <p className="text-sm text-slate-700">
          Listings require an HBAR bond (refunded on success). Fraud/default triggers slashing to an Insurance Pool.
          Every transfer charges an HTS custom fee paid in HBAR to treasury/insurance/community.
        </p>
      </Card>
    </section>
  )
}

// -------------------- Event Stream --------------------
function EventStream({ events }: { events: { type: string; text: string; ts: string }[] }) {
  return (
    <Card title="Event stream (HCS)" subtitle="Real‑time listing, investments, ACK & payouts">
      <ul className="space-y-2">
        {events.length === 0 && <li className="text-sm text-slate-500">No events yet.</li>}
        {events.map((e, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className={cn(
                "mt-1 h-2 w-2 rounded-full",
                e.type === "PAID" && "bg-emerald-500",
                e.type === "INVESTED" && "bg-violet-500",
                e.type === "LISTED" && "bg-sky-500",
                e.type === "BUYER_ACK" && "bg-amber-500",
                e.type === "SYSTEM" && "bg-slate-300",
              )}
            />
            <div>
              <div className="text-sm text-slate-800">{e.text}</div>
              <div className="text-xs text-slate-500">{new Date(e.ts).toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

// -------------------- Small Components --------------------
const Badge = ({ tone = "slate", children }: { tone?: "slate" | "brand"; children: React.ReactNode }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
      tone === "slate" && "bg-slate-50 text-slate-700 ring-slate-200",
      tone === "brand" && "bg-violet-50 text-brand ring-violet-200",
    )}
  >
    {children}
  </span>
)

const Pill = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">{children}</div>
)

const Button = ({
  as: As = "button",
  variant = "solid",
  size = "md",
  className,
  ...props
}: React.ComponentProps<"button"> & { as?: any; variant?: "solid" | "ghost" | "soft"; size?: "sm" | "md" | "lg" }) => (
  <As
    className={cn(
      "inline-flex items-center justify-center rounded-xl font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
      variant === "solid" && "bg-brand text-white hover:bg-violet-700 active:bg-violet-800",
      variant === "ghost" && "bg-transparent text-brand hover:bg-violet-50",
      variant === "soft" && "bg-violet-50 text-brand hover:bg-violet-100",
      size === "sm" && "px-3 py-1.5 text-sm",
      size === "md" && "px-4 py-2 text-sm",
      size === "lg" && "px-5 py-2.5",
      className,
    )}
    {...props}
  />
)

const Card = ({
  title,
  subtitle,
  actions,
  children,
}: {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
    {(title || actions || subtitle) && (
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          {title ? <h3 className="text-sm font-semibold text-slate-800">{title}</h3> : null}
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {actions}
      </header>
    )}
    <div className="p-4">{children}</div>
  </section>
)

const Field = ({
  label,
  hint,
  required,
  children,
}: {
  label?: React.ReactNode
  hint?: React.ReactNode
  required?: boolean
  children: React.ReactNode
}) => (
  <label className="flex w-full flex-col gap-1">
    <span className="text-sm font-medium text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    {children}
    {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
  </label>
)

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400",
      "focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200",
      props.className,
    )}
  />
)

const Select = ({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select
    {...props}
    className={cn(
      "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
      "focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200",
      props.className,
    )}
  >
    {children}
  </select>
)

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={cn(
      "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400",
      "focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200",
      props.className,
    )}
  />
)

const Progress = ({ value }: { value: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
    <div
      className="h-full rounded-full bg-brand transition-all"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
)

// -------------------- helpers --------------------
function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
function randomId() {
  return `INV-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export default function PrototypePage() {
  return <App />
}
