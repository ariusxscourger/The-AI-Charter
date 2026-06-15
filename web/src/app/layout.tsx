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
  title: {
    default: "The AI Charter — Multi-Agent AI Feature Governance Panel",
    template: "%s | The AI Charter",
  },
  description: "Deploy AI features responsibly with a multi-agent automated auditing and review workflow framework.",
  keywords: [
    "AI Governance",
    "Multi-Agent Workflow",
    "Responsible AI",
    "AI Feature Deployment",
    "Automated Auditing",
    "AI Safety",
    "Model Risk Assessment",
  ],
  authors: [{ name: "The AI Charter Team" }],
  creator: "The AI Charter",
  publisher: "The AI Charter",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://theaicharter.org"), // Default fallback domain
  openGraph: {
    title: "The AI Charter — Multi-Agent AI Feature Governance Panel",
    description: "Deploy AI features responsibly with a multi-agent automated auditing and review workflow framework.",
    url: "https://theaicharter.org",
    siteName: "The AI Charter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The AI Charter — Multi-Agent AI Feature Governance Panel",
    description: "Deploy AI features responsibly with a multi-agent automated auditing and review workflow framework.",
    creator: "@theaicharter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
