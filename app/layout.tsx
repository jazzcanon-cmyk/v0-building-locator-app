import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// ── 뷰포트 설정 (Next.js 14+ 권장 방식) ──────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,         // 핀치 줌 방지 (앱처럼 고정)
  userScalable: false,
  themeColor: "#09090b",   // 상단 상태바 색상 (다크)
}

// ── SEO + PWA 메타데이터 ───────────────────────────────────────────────────
export const metadata: Metadata = {
  // 기본 정보
  title: "DOORPASS",
  description: "택배·배달 기사님을 위한 공동현관 비밀번호 관리 앱",
  applicationName: "DOORPASS",

  // manifest 연결
  manifest: "/manifest.json",

  // 애플 PWA 설정 (iOS 홈 화면 추가)
  appleWebApp: {
    capable: true,                         // apple-mobile-web-app-capable
    statusBarStyle: "black-translucent",   // 상태바 스타일 (다크 앱에 어울림)
    title: "DOORPASS",
    startupImage: [],                       // 스플래시 이미지 필요 시 여기에 추가
  },

  // Open Graph (카카오톡 등 공유 시 미리보기)
  openGraph: {
    title: "DOORPASS",
    description: "공동현관 비밀번호를 빠르게 확인하세요",
    type: "website",
    locale: "ko_KR",
    url: "https://doorpass.kr",
  },

  // 아이콘
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      // iOS 홈 화면 아이콘 (apple-touch-icon)
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
  },

  // 검색엔진 (사내 앱이므로 노출 차단 권장)
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        {/*
          ── iOS Safari 추가 메타태그 ──────────────────────────────────────
          Next.js metadata API가 커버하지 못하는 일부 iOS 태그를 직접 삽입합니다.
        */}

        {/* 홈 화면 추가 시 전체화면(standalone) 실행 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* iOS 상태바 스타일: black-translucent = 상태바 영역까지 앱 배경색으로 */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* 전화번호 자동 링크 방지 */}
        <meta name="format-detection" content="telephone=no" />

        {/* MS 타일 색상 (윈도우 폰 / PWA) */}
        <meta name="msapplication-TileColor" content="#09090b" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} min-h-dvh bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  )
}
