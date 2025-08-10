"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, Link2, ExternalLink } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { track } from "@/lib/analytics"

type WalletChoice = "hashpack" | "blade" | "metamask"

export default function WalletConnect() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [connected, setConnected] = useState<null | {
    account: string
    network: "testnet" | "mainnet"
    wallet: WalletChoice
  }>(null)
  const [choice, setChoice] = useState<WalletChoice>("hashpack")
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet")

  useEffect(() => {
    // restore
    try {
      const saved = localStorage.getItem("cashhash:wallet")
      if (saved) setConnected(JSON.parse(saved))
    } catch {}
  }, [])

  const connect = async () => {
    // simulate connect
    const acc = network === "testnet" ? "0.0.22222" : "0.0.33333"
    const w = { account: acc, network, wallet: choice }
    setConnected(w)
    localStorage.setItem("cashhash:wallet", JSON.stringify(w))
    setOpen(false)
    await track("connect_wallet", { account: acc, network, wallet: choice })
  }

  const disconnect = () => {
    setConnected(null)
    localStorage.removeItem("cashhash:wallet")
    track("disconnect_wallet", { account: connected?.account, network: connected?.network })
  }

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{connected.network}</Badge>
        <div className="hidden sm:block text-sm text-muted-foreground">{connected.account}</div>
        <Button size="sm" variant="outline" onClick={disconnect}>
          {t("wallet.disconnect")}
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Wallet className="h-4 w-4 mr-2" /> {t("wallet.connect")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("wallet.title")}</DialogTitle>
          <DialogDescription>{t("wallet.desc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <WalletButton label="HashPack" active={choice === "hashpack"} onClick={() => setChoice("hashpack")} />
            <WalletButton label="Blade" active={choice === "blade"} onClick={() => setChoice("blade")} />
            <WalletButton label="MetaMask" active={choice === "metamask"} onClick={() => setChoice("metamask")} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Network</label>
            <Select value={network} onValueChange={(v: any) => setNetwork(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testnet">Testnet</SelectItem>
                <SelectItem value="mainnet">Mainnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">{t("wallet.privacy")}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            <span>{t("wallet.permissions")}</span>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <a
            href="https://www.hashpack.app/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1"
          >
            Get wallets <ExternalLink className="h-3 w-3" />
          </a>
          <Button onClick={connect} className="bg-violet-600 hover:bg-violet-700">
            {t("wallet.connectCta")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WalletButton({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      className={[
        "rounded-xl border px-3 py-2 text-sm",
        active ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 hover:bg-slate-50",
      ].join(" ")}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
