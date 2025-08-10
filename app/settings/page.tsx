"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const [lang, setLang] = useState<"en" | "id">("en")
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet")

  useEffect(() => {
    try {
      const l = localStorage.getItem("cashhash:lang")
      if (l === "en" || l === "id") setLang(l)
      const w = localStorage.getItem("cashhash:wallet")
      if (w) {
        const parsed = JSON.parse(w)
        if (parsed.network === "testnet" || parsed.network === "mainnet") setNetwork(parsed.network)
      }
    } catch {}
  }, [])

  const save = () => {
    localStorage.setItem("cashhash:lang", lang)
    try {
      const w = localStorage.getItem("cashhash:wallet")
      const parsed = w ? JSON.parse(w) : {}
      localStorage.setItem("cashhash:wallet", JSON.stringify({ ...parsed, network }))
    } catch {}
    alert("Saved.")
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Network & language</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Language</label>
            <Select value={lang} onValueChange={(v) => setLang(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Bahasa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Network</label>
            <Select value={network} onValueChange={(v) => setNetwork(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testnet">Hedera Testnet</SelectItem>
                <SelectItem value="mainnet">Hedera Mainnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button onClick={save}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
