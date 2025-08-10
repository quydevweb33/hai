"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type Lang = "en" | "id"
type Dict = Record<string, string>

const en: Dict = {
  "nav.market": "Marketplace",
  "nav.create": "Create",
  "nav.portfolio": "Portfolio",
  "nav.learn": "Learn",
  "nav.prototype": "Prototype",
  "cta.invest": "Invest from $10",
  "wallet.connect": "Connect Wallet",
  "wallet.disconnect": "Disconnect",
  "wallet.title": "Connect a wallet",
  "wallet.desc": "Choose a wallet to connect. You approve every transaction.",
  "wallet.privacy": "We never see your private key. You approve each transaction and message.",
  "wallet.permissions": "Permissions: read accountId, sign, subscribe to HCS topic",
  "wallet.connectCta": "Connect",
} as const

const id: Dict = {
  "nav.market": "Marketplace",
  "nav.create": "Buat Invoice",
  "nav.portfolio": "Portofolio",
  "nav.learn": "Pelajari",
  "nav.prototype": "Prototype",
  "cta.invest": "Mulai investasi $10",
  "wallet.connect": "Hubungkan Wallet",
  "wallet.disconnect": "Putuskan",
  "wallet.title": "Hubungkan wallet",
  "wallet.desc": "Pilih wallet untuk terhubung. Anda menyetujui setiap transaksi.",
  "wallet.privacy": "Kami tidak pernah melihat private key Anda. Anda menyetujui setiap transaksi & pesan.",
  "wallet.permissions": "Izin: baca accountId, tanda tangan, subscribe HCS topic",
  "wallet.connectCta": "Hubungkan",
} as const

const dictionaries: Record<Lang, Dict> = { en, id }

const I18nContext = createContext<{ lang: Lang; t: (k: string) => string; toggleLang: () => void }>({
  lang: "en",
  t: (k) => k,
  toggleLang: () => {},
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    const saved = localStorage.getItem("cashhash:lang")
    if (saved === "en" || saved === "id") setLang(saved)
  }, [])
  useEffect(() => {
    localStorage.setItem("cashhash:lang", lang)
  }, [lang])

  const dict = useMemo(() => dictionaries[lang], [lang])
  const t = useCallback((k: string) => dict[k] ?? k, [dict])
  const toggleLang = useCallback(() => setLang((l) => (l === "en" ? "id" : "en")), [])

  return <I18nContext.Provider value={{ lang, t, toggleLang }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
