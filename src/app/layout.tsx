import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Sidebar } from "@/components/layout/sidebar"
import "@/styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "HealthOS — Savar's Health Dashboard",
  description: "Personal health tracking across strength, running, sleep, and recovery.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Sidebar />
        <main className="ml-[240px] min-h-screen">
          <div className="max-w-[1040px] mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
