import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PME IA Assistant',
  description: 'Assistant IA local pour PME/PMI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}