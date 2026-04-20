import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { PWA } from '@/components/PWA'

export const metadata: Metadata = {
  title: '八字计算 | 免费在线八字排盘 | AI智能解读',
  description: '免费在线八字排盘，AI智能解读你的命运。输入出生年月日时，获得详细的八字分析。',
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
      <body>
        <PWA />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}