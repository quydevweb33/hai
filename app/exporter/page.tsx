"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateInvoiceForm from "@/components/create-invoice-form"
import BondWidget from "@/components/bond-widget"
import EventFeed from "@/components/event-feed"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldCheck, Wallet } from "lucide-react"

type Invoice = {
  id: string
  amountUSD: number
  risk: "green" | "yellow" | "red"
  maturity: string
  status: string
  bondHbar?: number
}

export default function ExporterPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    const res = await fetch("/api/invoices?owner=me", { cache: "no-store" })
    const data = await res.json()
    setInvoices(data.invoices ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const listed = useMemo(() => invoices.filter((i) => i.status === "LISTED" || i.status === "FUNDED"), [invoices])

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl sm:text-2xl font-bold">Exporter Portal</h1>
      <p className="text-muted-foreground">Buat invoice, post bond (HBAR), lihat status pendanaan dan payout.</p>

      <Tabs defaultValue="create" className="mt-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-3">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="bond">Post Bond</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create & List Invoice</CardTitle>
              <CardDescription>Upload dokumen dan mint NFT + FT (HTS). Event LISTED ke HCS.</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateInvoiceForm onCreated={refresh} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bond" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Posting Bond (HBAR)
              </CardTitle>
              <CardDescription>
                Wajib untuk listing aktif; refund jika sukses; slashing bila fraud/terlambat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Wallet className="h-4 w-4" />
                <AlertTitle>Simulasi</AlertTitle>
                <AlertDescription>
                  Saldo HBAR tidak disimulasikan; fokus pada event, kebijakan, dan distribusi.
                </AlertDescription>
              </Alert>
              <BondWidget invoices={listed} onDone={refresh} />
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              {listed.map((i) => (
                <Badge key={i.id} variant="outline" className="capitalize">
                  {i.id}: {i.bondHbar ? `${i.bondHbar} HBAR` : "Belum post"}
                </Badge>
              ))}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Feed</CardTitle>
              <CardDescription>Audit trail HCS (simulasi) real-time.</CardDescription>
            </CardHeader>
            <CardContent>
              <EventFeed />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
