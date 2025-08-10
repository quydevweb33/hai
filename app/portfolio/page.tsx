"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"

type Position = { id: string; value: number; estReturn: number; maturity: string; risk?: "green" | "yellow" | "red" }
type Portfolio = {
  positions: Position[]
  payoutsToday: number
  irr: number
  delinquency: number
  defaults: number
  invested: number
  estReturnTotal: number
}

export default function PortfolioPage() {
  const [data, setData] = useState<Portfolio | null>(null)
  const load = async () => {
    const res = await fetch("/api/portfolio?account=0.0.22222", { cache: "no-store" })
    const j = await res.json()
    setData(j.portfolio)
  }
  useEffect(() => {
    load()
  }, [])

  const areaData = useMemo(
    () => Array.from({ length: 12 }).map((_, i) => ({ m: i + 1, v: 400 + i * 50 + (i % 3) * 30 })),
    [],
  )
  const pieData = useMemo(() => {
    const c = { green: 0, yellow: 0, red: 0 }
    data?.positions?.forEach((p: any) => {
      c[(p.risk ?? "yellow") as "green" | "yellow" | "red"]++
    })
    return Object.entries(c).map(([name, value]) => ({ name, value }))
  }, [data])
  const RISKC: Record<string, string> = { green: "#10B981", yellow: "#F59E0B", red: "#EF4444" }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-xl font-semibold mb-3">Your portfolio</h1>
      {!data ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      ) : data.positions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">You have no positions yet.</div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Kpi title="Invested" value={`$${data.invested.toLocaleString()}`} />
            <Kpi title="Est. return" value={`$${data.estReturnTotal.toLocaleString()}`} />
            <Kpi title="Positions" value={data.positions.length} />
            <Kpi title="Payouts today" value={data.payoutsToday} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Portfolio value (12m)</CardTitle>
                <CardDescription>Simulated</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    v: { label: "Value", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-48"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="var(--color-v)"
                        fill="var(--color-v)"
                        fillOpacity={0.2}
                      />
                      <XAxis dataKey="m" hide />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Risk distribution</CardTitle>
                <CardDescription>By positions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ green: { label: "Green" }, yellow: { label: "Yellow" }, red: { label: "Red" } }}
                  className="h-48"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                        {pieData.map((e, i) => (
                          <Cell key={i} fill={RISKC[e.name]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payouts (next 8 weeks)</CardTitle>
                <CardDescription>Simulated</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ v: { label: "Payouts", color: "hsl(var(--chart-2))" } }} className="h-48">
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
                      <Bar dataKey="v" fill="var(--color-v)" radius={[6, 6, 0, 0]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Positions</CardTitle>
              <CardDescription>Your current holdings</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {data.positions.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{p.id}</Badge>
                    <span>${p.value.toLocaleString()} invested</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3">
                    <span>Est. return ${p.estReturn.toLocaleString()}</span>
                    <span>Maturity {p.maturity}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  )
}

function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-lg font-semibold">{value}</CardContent>
    </Card>
  )
}
