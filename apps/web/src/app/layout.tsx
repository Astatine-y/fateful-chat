import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { PWA } from '@/components/PWA'

export const metadata: Metadata = {
  title: 'FATEFUL - 你的AI决策操作系统 | 八字命理 Navigation OS',
  description: '融合东方玄学与AI的决策导航系统。在AI时代找到自我、力量、平静与前行的道路。',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PWA />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}