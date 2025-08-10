"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

export default function CopyableBlock({
  text = "",
  label = "Copy all",
  className = "",
}: {
  text?: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className={`rounded-md border overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <div className="text-sm font-medium">Raw content</div>
        <Button size="sm" variant="secondary" onClick={onCopy}>
          <Copy className="h-4 w-4 mr-1" />
          {copied ? "Copied" : label}
        </Button>
      </div>
      <pre className="p-3 text-sm overflow-auto whitespace-pre-wrap">{text}</pre>
    </div>
  )
}
