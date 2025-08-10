"use client"

import EventFeed from "@/components/event-feed"
import MirrorEventFeed from "@/components/mirror-event-feed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function EventsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Stream</CardTitle>
          <CardDescription>HCS-style feed (simulated) and live from Mirror Node (testnet)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sim">
            <TabsList className="mb-3">
              <TabsTrigger value="sim">Simulated</TabsTrigger>
              <TabsTrigger value="live">Live (Mirror Node)</TabsTrigger>
            </TabsList>
            <TabsContent value="sim">
              <EventFeed />
            </TabsContent>
            <TabsContent value="live">
              <MirrorEventFeed />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
