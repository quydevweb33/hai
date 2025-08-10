"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BookOpenText, Boxes, CircleDot, FilePlus2, Home, LayoutGrid, ListChecks } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import EventFeed from "@/components/event-feed"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/market", label: "Marketplace", icon: LayoutGrid },
  { href: "/create", label: "Create Invoice", icon: FilePlus2 },
  { href: "/portfolio", label: "Portfolio", icon: Boxes },
  { href: "/buyer", label: "Buyer ACK", icon: CircleDot },
  { href: "/attester", label: "Attester", icon: ListChecks },
  { href: "/events", label: "Events", icon: Activity },
  { href: "/learn", label: "Learn", icon: BookOpenText },
  { href: "/help", label: "Help & FAQ", icon: BookOpenText },
  { href: "/settings", label: "Settings", icon: CircleDot },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-600 text-white">CH</div>
          <div className="text-sm font-semibold">CashHash</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Live HCS Events</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-1">
              <EventFeed compact />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
          <CircleDot className="h-3.5 w-3.5 text-green-600" />
          Live
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
