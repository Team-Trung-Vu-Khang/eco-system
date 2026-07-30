import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MEVI - He sinh thai Nong nghiep thong minh",
    short_name: "MEVI",
    description:
      "Nền tảng quản lý nông nghiệp toàn diện: Đào tạo, Nông trại, Nhà máy và Cửa hàng.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdfbf3",
    theme_color: "#0b7a5a",
    icons: [
      {
        src: "/mevi-logo.jpeg",
        sizes: "225x225",
        type: "image/jpeg",
      },
      {
        src: "/mevi-logo.jpeg",
        sizes: "225x225",
        type: "image/jpeg",
      },
    ],
  };
}
