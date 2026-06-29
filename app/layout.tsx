import Providers from '@/contexts/providers'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '700']
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covua.duongsinh.vn'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Cờ vua Dương Sinh — Vui trí tuệ',
    template: '%s | Cờ vua Dương Sinh'
  },
  description:
    'Nền tảng video và học tập cờ vua Dương Sinh — bài giảng, giải đấu, luyện nước đi và ôn tập SRS theo lộ trình 6 cấp.',
  keywords: ['cờ vua', 'chess', 'Dương Sinh', 'học cờ vua', 'video cờ vua', 'PGN', 'SRS'],
  authors: [{ name: 'Cờ vua Dương Sinh', url: SITE_URL }],
  openGraph: {
    type: 'website',
    siteName: 'Cờ vua Dương Sinh',
    locale: 'vi_VN'
  },
  twitter: {
    card: 'summary_large_image'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      <html lang='vi' suppressHydrationWarning>
        <body className={`${roboto.variable} bg-background font-sans antialiased`}>{children}</body>
      </html>
    </Providers>
  )
}
