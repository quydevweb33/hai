import type React from "react"
import "@/app/globals.css"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import TopNav from "@/components/top-nav"
import { I18nProvider } from "@/lib/i18n"
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <I18nProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <TopNav />
                {children}
              </SidebarInset>
            </SidebarProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
