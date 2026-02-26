import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'collected',
  description: 'A personal commonplace book',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
