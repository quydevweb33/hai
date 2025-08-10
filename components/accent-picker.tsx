"use client"

import { useEffect, useState } from "react"

type Accent = "violet" | "emerald" | "fuchsia" | "amber"

const OPTIONS: { key: Accent; label: string; swatch: string }[] = [
  { key: "violet", label: "Violet", swatch: "bg-violet-600" },
  { key: "emerald", label: "Emerald", swatch: "bg-emerald-600" },
  { key: "fuchsia", label: "Fuchsia", swatch: "bg-fuchsia-600" },
  { key: "amber", label: "Amber", swatch: "bg-amber-500" },
]

export default function AccentPicker() {
  const [accent, setAccent] = useState<Accent>("violet")

  useEffect(() => {
    const saved = localStorage.getItem("cashhash:accent") as Accent | null
    if (saved && OPTIONS.some((o) => o.key === saved)) {
      setAccent(saved)
      document.documentElement.setAttribute("data-accent", saved)
    }
  }, [])

  const onPick = (a: Accent) => {
    setAccent(a)
    localStorage.setItem("cashhash:accent", a)
    document.documentElement.setAttribute("data-accent", a)
  }

  return (
    <div className="flex items-center gap-1">
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          aria-label={`Accent ${o.label}`}
          title={`Accent ${o.label}`}
          onClick={() => onPick(o.key)}
          className={[
            "h-6 w-6 rounded-full ring-2 ring-transparent transition",
            o.swatch,
            accent === o.key ? "ring-foreground/30" : "hover:opacity-90",
          ].join(" ")}
        />
      ))}
    </div>
  )
}
