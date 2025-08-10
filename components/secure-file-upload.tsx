"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Upload, CheckCircle2, X } from "lucide-react"

type Uploaded = {
  name: string
  fsName: string // server-side “filename” (encrypted blob placeholder)
  size: number
  ivB64: string
}

export default function SecureFileUpload({
  onUploaded = () => {},
  maxFiles = 5,
  accept = "*",
}: {
  onUploaded?: (items: Uploaded[]) => void
  maxFiles?: number
  accept?: string
}) {
  const [busy, setBusy] = useState(false)
  const [files, setFiles] = useState<Uploaded[]>([])
  const [error, setError] = useState<string | null>(null)

  // AES-GCM key per browser (session) — stored as base64 raw key
  const [keyB64, setKeyB64] = useState<string | null>(null)

  useEffect(() => {
    const existing = localStorage.getItem("cashhash:fileKey")
    if (existing) setKeyB64(existing)
  }, [])

  const ensureKey = async () => {
    if (keyB64) return keyB64
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
    const raw = await crypto.subtle.exportKey("raw", key)
    const b64 = arrayBufferToBase64(raw)
    localStorage.setItem("cashhash:fileKey", b64)
    setKeyB64(b64)
    return b64
  }

  const getKey = async () => {
    const b64 = await ensureKey()
    const raw = base64ToArrayBuffer(b64)
    return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
  }

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list || list.length === 0) return
    const toProcess = Array.from(list).slice(0, Math.max(0, maxFiles - files.length))
    if (toProcess.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const key = await getKey()
      const out: Uploaded[] = []
      for (const f of toProcess) {
        const buf = await f.arrayBuffer()
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, buf)
        const payload = {
          name: f.name,
          mime: f.type || "application/octet-stream",
          size: f.size,
          iv: arrayBufferToBase64(iv),
          data: arrayBufferToBase64(cipher),
        }
        const res = await fetch("/api/files", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        })
        const j = await res.json()
        if (!j?.ok) throw new Error(j?.error || "Upload failed")
        out.push({ name: f.name, fsName: j.fsName, size: f.size, ivB64: payload.iv })
      }
      const next = [...files, ...out]
      setFiles(next)
      onUploaded(next)
    } catch (e: any) {
      setError(e?.message || "Failed to encrypt or upload file")
    } finally {
      setBusy(false)
      e.target.value = ""
    }
  }

  const remove = (fsName: string) => {
    const next = files.filter((f) => f.fsName !== fsName)
    setFiles(next)
    onUploaded(next)
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Secure documents (AES‑GCM, client‑side)
        </div>
        <Badge variant="secondary">
          {files.length}/{maxFiles}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Input type="file" accept={accept} multiple onChange={onPick} disabled={busy || files.length >= maxFiles} />
        <Button variant="outline" disabled className="hidden sm:inline-flex bg-transparent">
          <Upload className="h-4 w-4 mr-1" />
          {busy ? "Encrypting…" : "Upload"}
        </Button>
      </div>
      {error ? <div className="text-xs text-destructive">{error}</div> : null}
      {files.length > 0 && (
        <ul className="divide-y rounded-md border">
          {files.map((f) => (
            <li key={f.fsName} className="flex items-center justify-between px-3 py-2">
              <div className="text-sm">
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-muted-foreground">
                  {f.size.toLocaleString()} bytes • {f.fsName}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(f.fsName)} aria-label="Remove">
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {keyB64 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Encryption key is stored locally (browser). Server never sees your key.
        </div>
      )}
    </div>
  )
}

function arrayBufferToBase64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let str = ""
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i])
  return btoa(str)
}
function base64ToArrayBuffer(b64: string) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}
