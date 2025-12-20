import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'APNG Generator - アニメーションPNG作成ツール',
  description: '画像からトランジション効果付きのアニメーションPNGを作成できるツール。ココフォリアなどTRPGオンラインセッションの立ち絵やカットインに最適。',
  keywords: ['APNG', 'アニメーションPNG', 'ココフォリア', 'TRPG', '立ち絵', 'カットイン', 'トランジション'],
  authors: [{ name: 'APNG Generator' }],
  openGraph: {
    title: 'APNG Generator - アニメーションPNG作成ツール',
    description: '画像からトランジション効果付きのアニメーションPNGを作成できるツール',
    url: 'https://apng-generator-tan.vercel.app',
    siteName: 'APNG Generator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'APNG Generator',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APNG Generator - アニメーションPNG作成ツール',
    description: '画像からトランジション効果付きのアニメーションPNGを作成できるツール',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}