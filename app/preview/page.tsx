"use client"

import CopyableBlock from "@/components/copyable-block"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const RAW = `CashHash — Hedera-Native RWA Invoice Factoring
1) Hero (narasi atas-lipatan)
EN: Turn export invoices into instant, investable on-chain assets. 100% on Hedera (HTS/HCS/File Service/Smart Contracts). Finality in seconds, predictable fees, fully transparent.
ID: Ubah invoice ekspor jadi aset on-chain yang bisa didanai. 100% di Hedera (HTS/HCS/File Service/Smart Contracts). Finalitas detik, biaya pasti, transparansi penuh.
Primary CTA: “List your first invoice (stake HBAR)”
Secondary CTA: “Invest from $10”
Trust badges: Hedera-native • Real-world assets • On-chain audit (HCS) • HBAR Bond + Insurance Pool

2) Problem → Solution (singkat & tajam)
Masalah: SME nunggu 30–180 hari buat dibayar; penolakan pembiayaan tinggi; proses manual rawan fraud.
Solusi: Invoice → NFT (identitas) + FT (fractional claim) via HTS; dokumen di File Service; event waktu nyata di HCS; payout otomatis via Smart Contracts.
Nilai unik:
HBAR Posting Bond + slashing → Insurance Pool (menekan invoice bodong & menciptakan demand HBAR).
HTS custom fees in HBAR: setiap transfer token invoice otomatis setor fee ke treasury/insurance/community.

3) How It Works (4 langkah “kartu”)
Upload & Verify — unggah Invoice/PO/BOL; hash ke File Service; scoring & checks.
Tokenize — mint NFT (invoice) + FT (fractions) via HTS.
Fund — investor beli fraksi dari $10; exporter terima 80–90% advance.
Settle — buyer bayar; kontrak bayar pro-rata; burn/arsip; bond di-refund.

4) Personas & Jobs-to-Be-Done
Exporter (SME): “Saya butuh cash flow cepat, aman, dan transparan.”
Investor (ritel/institusi): “Saya butuh yield nyata dengan kontrol risiko & likuiditas.”
Buyer: “Saya ingin invoice yang kredibel & mudah di-acknowledge.”
Attester (forwarder/gudang/inspektor): “Saya memberi bukti logistik kredibel dan ikut skin-in-the-game (HBAR bond).”

5) User Flows (copy-paste Mermaid)
5.1 Exporter Flow
mermaidCopyEdit
flowchart LR
A[Onboard & KYC]  B[Upload Docs (PO/INV/BOL) -> FS]
B  C[Risk Checks & De-dup Hash]
C  D[Mint NFT+FT via HTS]
D  E[Post HBAR Bond]
E  F[List on Marketplace -> HCS LISTED]
F  G[Funding Progress (INVESTED events)]
G  H[Advance Payout (80–90%)]
H  I[Buyer Pays -> Payout Pro-rata]
I  J[Refund Bond + Burn/Archive]

5.2 Investor Flow
mermaidCopyEdit
flowchart LR
M[Browse Marketplace]  N[Read Docs & Events]
N  O[Buy Fractions $10+ (HTS)]
O  P[Track Funding (HCS)]
P  Q[Hold to Maturity]
Q  R[Payout Auto -> Wallet]

5.3 Buyer & Attester Flow
mermaidCopyEdit
flowchart LR
X[Buyer ACK (sign)]  Y[HCS BUYER_ACK]
Y  Z[Attester Milestones (PICKUP/DELIVERED)]
Z  AA[Final Settlement Trigger]

6) Screen-by-Screen (konten + microcopy)
6.1 Marketplace
Tujuan: Pilih invoice yang jelas risk/return/tenor.
Komponen: Filter (negara, tenor, yield, risk color), Kartu Listing (exporter, amount, yield, tenor, funded%), HBAR Bond badge, tombol Invest.
Microcopy:
Risk color info: “Green = riwayat bagus, dokumen lengkap, buyer ACK.”
Bond badge: “Bond 600 HBAR posted — listing quality safeguarded.”
Empty state: “Belum ada invoice. Coba ubah filter atau kembali 1 jam lagi.”
Error state: “Gagal memuat data. Refresh atau cek koneksi.”

6.2 Create Invoice (3 langkah)
Step 1 — Details: amount, currency, buyer, maturity; tooltip “Advance rate tergantung bukti & skor risiko.”
Step 2 — Upload Docs: PO/Invoice/BOL; status: “Hashed & stored on Hedera File Service.”
Step 3 — Terms & Bond: yield (bps), advance rate, preview fees; tombol Post HBAR Bond & List.
Success: “Listed! HCS event: LISTED • ID: INV-xxxx” (link ke event stream).

6.3 Investor Portfolio
Komponen: Positions (INV-id, value, est. return, maturity), Cashflows (payouts today/upcoming), Cohort metrics (delinquency, defaults, coverage), Notifikasi HCS (BUYER_ACK, DELIVERED, PAID).
Empty: “Belum ada posisi. Mulai dengan $10.”

7) IA (Navigasi)
Public: Home • Marketplace • Learn (How it works, Risks) • View HCS stream
Exporter: Create Invoice • My Invoices • Bond & Refund • Docs
Investor: Portfolio • Funding History • Payouts • Statements
System: Attester Console • Disputes • Insurance Pool

8) Copy Landing Page (siap tempel)
Headline: “Instant liquidity for export invoices — 100% on Hedera.”
Sub: “Fund SMEs globally from $10 with on-chain proof, real-time audit, and automatic settlement.”
Bullets:
Hedera-native: HTS/HCS/File Service/Smart Contracts
HBAR Bond + Insurance Pool (quality & protection)
Custom fees in HBAR → treasury & insurance
Finality in seconds, predictable fees
CTA: “List your first invoice (stake HBAR)” / “Start investing”

9) Tokenomics & HBAR (jelas tapi singkat)
Posting Bond (HBAR): prasyarat listing; refund saat sukses; slashing → Insurance Pool bila fraud/default.
Priority Staking: tambah stake untuk ranking lebih tinggi.
HTS Custom Fees (HBAR): tiap transfer FT memotong fee otomatis (split: treasury/insurance/community).
Dampak: HBAR terkunci + arus fee berkelanjutan = utilitas HBAR murni.

10) Anti-Fraud Stack (checklist)
KYC/KYB hash ke FS, event ke HCS; whitelist/blacklist via kontrol HTS.
De-dup hash dokumen; linkage Invoice ↔ PO ↔ BOL/GR; OCR checksum.
Buyer-ACK (wallet sign); logistics attester bertanda tangan milestone (punya bond & reputasi).
Risk engine: rules, limit, anomaly; advance rate dinamis berbasis bukti.
Economic guards: bond/slashing + Insurance Pool.

11) Legal & Compliance (kerangka eksekusi)
SPV true sale (atau assignment + notice) agar klaim kuat & risiko terpisah.
HTS transfer controls: KYC/Freeze/Wipe/whitelist investor untuk region-by-region compliance.
Privacy: dokumen terenkripsi; publik hanya hash & event.

12) API & Event (contoh payload untuk demo)
Create & List
POST /api/invoices (multipart)
jsonCopyEdit
{"invoiceId":"INV-19D2","nftId":"0.0.123456","ftId":"0.0.123457","fileIds":["0.0.80001"],"topicId":"0.0.70001"}

Post Bond
POST /api/bond/post
jsonCopyEdit
{"invoiceId":"INV-19D2","amountHbar":"600"}

Invest
POST /api/invoices/INV-19D2/invest
jsonCopyEdit
{"amountUnits":1000,"investorAccountId":"0.0.22222"}

Buyer-ACK
POST /api/attesters/{buyer}/sign
jsonCopyEdit
{"invoiceId":"INV-19D2","milestone":"BUYER_ACK","notes":"PO accepted","timestamp":"2025-08-10T03:12:00Z"}

Payout
POST /api/invoices/INV-19D2/payout → pro-rata payout, burn/arsip, bond refund.

HCS Event (contoh)
jsonCopyEdit
{"type":"LISTED","invoiceId":"INV-19D2","risk":"yellow","bondHbar":600,"ts":"2025-08-10T02:15:01Z"}

13) Policy (ringkas untuk config)
jsonCopyEdit
{   "bondPolicy": {"percentOfInvoice":0.01,"baseHbar":300,"minHbar":250,"maxHbar":5000},   "slashingPolicy": {"fraud":1.0,"noBuyerAck":0.5,"latePaymentDays":[{"gt":0,"lte":30,"slash":0.1},{"gt":30,"lte":60,"slash":0.3},{"gt":60,"slash":0.6}]},   "advanceRatePolicy": {"default":0.8,"byEvidence":{"hasPO":0.05,"hasBOLorGR":0.05,"buyerAck":0.05},"capsByRisk":{"green":0.9,"yellow":0.85,"red":0.7}},   "feesPolicy": {"htsCustomFixedFeeHbar":0.25,"platformPct":0.0075,"feeSplit":{"treasury":0.6,"insurancePool":0.3,"community":0.1}},   "attesterPolicy": {"minBondHbar":1000,"slashOnBadSign":0.5,"minAttestersForHighRisk":2} }
`

export default function PreviewPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl sm:text-2xl font-bold">CashHash — Preview Content</h1>
      <p className="text-muted-foreground mb-4">
        Konten siap tempel untuk Notion/README/landing page. Gunakan tombol di bawah untuk menyalin semuanya.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline">Hedera-native</Badge>
        <Badge variant="outline">RWA</Badge>
        <Badge variant="outline">HCS stream</Badge>
        <Badge variant="outline">HBAR Bond</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Copy-paste package</CardTitle>
          <CardDescription>Semua narasi, UX clarity, dan userflows versi ringkas</CardDescription>
        </CardHeader>
        <CardContent>
          <CopyableBlock text={RAW} />
        </CardContent>
      </Card>
    </main>
  )
}
