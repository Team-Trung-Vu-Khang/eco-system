import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MEVI — Hệ sinh thái Nông nghiệp thông minh",
    short_name: "MEVI",
    description:
      "Nền tảng quản lý nông nghiệp toàn diện: Đào tạo (Edu), Nông trại (Farm), Nhà máy (Factory), Cửa hàng (Shop).",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f5ec",
    theme_color: "#f8f5ec",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
