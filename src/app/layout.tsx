import type { Metadata, Viewport } from "next";
import "./globals.css";
import FloatingSupportWidget from "@/components/FloatingSupportWidget";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lifeos.vn";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090e",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LifeOS – Hệ Điều Hành Quản Lý Cuộc Sống, Tài Chính & Trợ Lý AI Thông Minh",
    template: "%s | LifeOS",
  },
  description:
    "LifeOS là nền tảng quản lý cuộc sống tất cả trong một (All-in-One) chuẩn quốc tế bằng tiếng Việt: Quản lý công việc (Tasks & Kanban), Tài chính dòng tiền & Ngân hàng số, Theo dõi thói quen (Habits Streak), Mục tiêu OKR, Pomodoro Deep Work, Ghi chú và Trợ lý AI chuyên gia.",
  applicationName: "LifeOS",
  authors: [{ name: "LifeOS Vietnam", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "LifeOS",
    "app quản lý chi tiêu",
    "quản lý tài chính cá nhân",
    "quản lý công việc",
    "bảng kanban cá nhân",
    "theo dõi thói quen",
    "habit tracker tiếng việt",
    "mục tiêu OKR",
    "đồng hồ pomodoro",
    "ghi chú thông minh",
    "trợ lý AI quản lý cuộc sống",
    "hệ điều hành cá nhân",
    "life management system",
    "personal life os",
    "năng suất làm việc",
    "deep work",
    "sổ thu chi",
    "vietqr thanh toán",
    "supabase realtime sync",
  ],
  creator: "LifeOS Vietnam",
  publisher: "LifeOS Technologies",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "LifeOS – Hệ Điều Hành Quản Lý Cuộc Sống Toàn Diện",
    title: "LifeOS – Hệ Điều Hành Quản Lý Cuộc Sống, Tài Chính & Trợ Lý AI Thông Minh",
    description:
      "Nền tảng All-in-One giúp bạn làm chủ công việc, tiền bạc, thói quen và phát triển bản thân với sức mạnh từ Trí tuệ nhân tạo AI. Đồng bộ Cloud thời gian thực.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LifeOS - Hệ Điều Hành Quản Lý Cuộc Sống, Tài Chính & Trợ Lý AI Thông Minh",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeOS – Hệ Điều Hành Quản Lý Cuộc Sống, Tài Chính & Trợ Lý AI Thông Minh",
    description:
      "Làm chủ công việc, quản lý dòng tiền, rèn luyện thói quen và nâng tầm năng suất cùng Trợ lý AI LifeOS.",
    images: ["/twitter-image.png"],
    creator: "@lifeos_app",
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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "LifeOS",
        operatingSystem: "Web, iOS, Android, Windows, macOS",
        applicationCategory: "ProductivityApplication",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "1280",
          bestRating: "5",
          worstRating: "1",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "VND",
        },
        description:
          "Hệ điều hành quản lý cuộc sống, tài chính, công việc và trợ lý AI thông minh hàng đầu Việt Nam.",
      },
      {
        "@type": "Organization",
        name: "LifeOS",
        url: siteUrl,
        logo: `${siteUrl}/og-image.png`,
        sameAs: [
          "https://facebook.com/lifeos.vn",
          "https://twitter.com/lifeos_app",
          "https://t.me/lifeos_support",
        ],
      },
      {
        "@type": "WebSite",
        name: "LifeOS",
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="vi" className="dark scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LifeOS" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#09090b] text-neutral-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
        <PWAInstallPrompt />
        <FloatingSupportWidget />
      </body>
    </html>
  );
}
