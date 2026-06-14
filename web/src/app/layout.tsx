import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AuthProvider } from "@/context/AuthContext"
import type { Metadata } from "next"
import { Fira_Code, Inter } from "next/font/google"
import "../index.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "The AI Charter — Governance Panel",
  description: "A multi-agent governance workflow for responsible AI feature deployment.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${firaCode.variable} relative min-h-screen bg-[#FAF8F5] font-sans text-[#1F2937] antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
