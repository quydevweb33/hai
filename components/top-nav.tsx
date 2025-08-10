"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import WalletConnect from "@/components/wallet-connect"
import { Languages, Moon, Sun } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useTheme } from "next-themes"
import AccentPicker from "@/components/accent-picker"

const nav = [
  { href: "/market", labelKey: "nav.market" },
  { href: "/create", labelKey: "nav.create" },
  { href: "/portfolio", labelKey: "nav.portfolio" },
  { href: "/prototype", labelKey: "nav.prototype" },
  { href: "/learn", labelKey: "nav.learn" },
]

export default function TopNav() {
  const pathname = usePathname()
  const { t, toggleLang, lang } = useI18n()
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-14 items-center gap-2 border-b px-3 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-2 pl-1">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-var text-white">CH</div>
          <span className="font-semibold hidden sm:inline">CashHash</span>
        </Link>
      </div>
      <nav className="ml-2 hidden md:flex items-center gap-1">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={[
              "rounded-md px-3 py-2 text-sm font-medium",
              pathname === n.href ? "bg-brand-var text-white" : "text-foreground hover:bg-muted",
            ].join(" ")}
          >
            {t(n.labelKey)}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <AccentPicker />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleLang} aria-label="Toggle language">
          <Languages className="h-4 w-4 mr-1" />
          {lang.toUpperCase()}
        </Button>
        <WalletConnect />
        <Link href="/market">
          <Button size="sm" className="btn-brand">
            {t("cta.invest")}
          </Button>
        </Link>
      </div>
    </header>
  )
}
