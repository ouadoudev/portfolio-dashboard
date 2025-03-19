"use client"

import "./globals.css"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Inter } from "next/font/google"
import SidebarComponent from "@/components/sidebar"
import type { ReactNode } from "react"
import { LanguageProvider, useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/translations/language-selector"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        <LanguageProvider>
          <LayoutContent>{children}</LayoutContent>
        </LanguageProvider>
      </body>
    </html>
  )
}

function LayoutContent({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  const isRTL = language === "ar"

  return (
    <html dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
      <body className={inter.className}>
        <SidebarProvider>
          <SidebarComponent />
          <SidebarInset>
            <header className="flex h-12 items-center justify-between border-b px-4 my-1">
              <div className="flex items-center gap-2">
              <SidebarTrigger direction={isRTL ? "rtl" : "ltr"} />
                <h1 className="text-xl font-semibold">
                  {language === "ar" ? "لوحة التحكم" : "Portfolio Dashboard"}
                </h1>
              </div>
              <LanguageSelector />
            </header>
            <main className="p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}