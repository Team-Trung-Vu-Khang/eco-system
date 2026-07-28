import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/providers";
import { StudentSupportWidget } from "../components/student-support-widget";
import { SerwistProvider } from "@serwist/turbopack/react";

export const metadata: Metadata = {
  title: {
    default: "MEVI — Hệ sinh thái Nông nghiệp thông minh",
    template: "%s | MEVI",
  },
  description:
    "Nền tảng quản lý nông nghiệp toàn diện: Đào tạo (Edu), Nông trại (Farm), Nhà máy (Factory), Cửa hàng (Shop). Một tài khoản — đăng nhập toàn hệ thống.",
  applicationName: "MEVI",
  keywords: [
    "MEVI",
    "nông nghiệp thông minh",
    "quản lý nông trại",
    "farm management",
    "eco farm",
    "truy xuất nguồn gốc",
  ],
  appleWebApp: {
    capable: true,
    title: "MEVI",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <SerwistProvider swUrl="/serwist/sw.js">
          <Providers>{children}</Providers>
          <StudentSupportWidget />
        </SerwistProvider>
      </body>
    </html>
  );
}
