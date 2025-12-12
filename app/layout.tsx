import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'APNG Generator',
  description: '画像からトランジション効果付きのアニメーションPNG作成できるツール',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}