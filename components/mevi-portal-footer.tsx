"use client";

import Image from "next/image";

type MeviPortalFooterProps = {
  className?: string;
  mobileMode?: "compact" | "full";
};

export function MeviPortalFooter({
  className = "",
  mobileMode = "full",
}: MeviPortalFooterProps) {
  const supportText =
    "Phần mềm được phát triển với sự hỗ trợ của dự án WE4Ag - Thúc đẩy các mô hình kinh doanh xanh cho phụ nữ vì nền nông nghiệp Việt Nam bền vững do Liên minh Châu Âu tài trợ thông qua CARE Quốc tế tại Việt Nam và Công ty Cổ phần Hỗ trợ sáng kiến kinh doanh tạo tác động - MEVI SIB.";
  const copyrightText = "© 2026 MEVI SIB. Tất cả quyền được bảo lưu.";

  return (
    <footer
      className={`fixed inset-x-0 bottom-0 z-40 w-full px-4 pt-2 pb-2 text-center sm:py-6 backdrop-blur-sm ${className}`.trim()}
      style={{
        borderTop: "1px solid var(--mevi-border)",
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-1.5 sm:hidden">
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-1.5">
          <div className="flex items-center gap-2 bg-white rounded-md">
            <Image
              src="/global-gateway.png"
              alt="Global Gateway"
              className="h-6 w-6 object-contain"
              width={20}
              height={20}
            />
            <Image
              src="/eu.png"
              alt="EU"
              className="h-6 w-6 object-contain "
              width={20}
              height={20}
            />
          </div>
          <Image
            src="/mevi-logo.jpeg"
            alt="MEVI"
            className="h-6 w-6 rounded-md object-contain bg-white"
            width={20}
            height={20}
          />
          <Image
            src="/care.png"
            alt="Care"
            className="h-6 w-6 rounded-md object-contain bg-white"
            width={20}
            height={20}
          />
        </div>

        <p
          className={`min-w-0 max-w-full whitespace-normal ${
            mobileMode === "compact"
              ? "text-[8px] leading-snug"
              : "text-[9px] leading-snug"
          }`}
          style={{ color: "var(--mevi-text-muted)" }}
        >
          {supportText}
        </p>
        <p
          className="min-w-0 max-w-full whitespace-normal text-[8px] leading-snug"
          style={{ color: "var(--mevi-text-muted)" }}
        >
          {copyrightText}
        </p>
      </div>

      <div className="mx-auto hidden max-w-5xl sm:block">
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-1.5">
          <div className="flex items-center gap-2 bg-white rounded-md">
            <Image
              src="/global-gateway.png"
              alt="Global Gateway"
              className="h-6 w-6 object-contain"
              width={20}
              height={20}
            />
            <Image
              src="/eu.png"
              alt="EU"
              className="h-6 w-6 object-contain "
              width={20}
              height={20}
            />
          </div>
          <Image
            src="/mevi-logo.jpeg"
            alt="MEVI"
            className="h-6 w-6 rounded-md object-contain bg-white"
            width={20}
            height={20}
          />
          <Image
            src="/care.png"
            alt="Care"
            className="h-6 w-6 rounded-md object-contain bg-white"
            width={20}
            height={20}
          />
        </div>

        <p
          className="mx-auto whitespace-normal text-[12px] leading-relaxed md:text-xs"
          style={{ color: "var(--mevi-text-muted)" }}
        >
          {supportText}
        </p>
        <p
          className="mx-auto max-w-full whitespace-normal text-[11px] leading-tight mb-2.5"
          style={{ color: "var(--mevi-text-muted)" }}
        >
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}
