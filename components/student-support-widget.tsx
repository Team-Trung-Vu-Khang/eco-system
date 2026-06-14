"use client";

import { GraduationCap, PhoneCall, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const SUPPORT_TITLE = "Thông tin hỗ trợ App";
const SUPPORT_SUBTITLE = "Vui lòng liên hệ với chúng tôi khi cần hỗ trợ";
const SUPPORT_HOTLINE = "0369855018";
const SUPPORT_HOTLINE_TEL = "tel:+84369855018";
const SUPPORT_ZALO_URL = "https://zalo.me/g/ivxolkmmyzn8eys4dho3";
const SUPPORT_FACEBOOK_URL = "https://www.facebook.com/share/g/18pWjQmVrF/";
const SUPPORT_ZALO_LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/120px-Icon_of_Zalo.svg.png";
const SUPPORT_FACEBOOK_LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/120px-2023_Facebook_icon.svg.png";

const supportItems = [
  {
    key: "hotline",
    label: "Hotline hỗ trợ",
    description: SUPPORT_HOTLINE,
    href: SUPPORT_HOTLINE_TEL,
    icon: PhoneCall,
    tone: "emerald" as const,
    disabled: false,
  },
  {
    key: "zalo",
    label: "Nhóm Zalo hỗ trợ",
    description: SUPPORT_ZALO_URL ? "Mở nhóm Zalo" : "Chưa cấu hình link",
    href: SUPPORT_ZALO_URL,
    icon: SUPPORT_ZALO_LOGO,
    tone: "sky" as const,
    disabled: !SUPPORT_ZALO_URL,
  },
  {
    key: "facebook",
    label: "Facebook hỗ trợ",
    description: SUPPORT_FACEBOOK_URL ? "Mở Facebook" : "Chưa cấu hình link",
    href: SUPPORT_FACEBOOK_URL,
    icon: SUPPORT_FACEBOOK_LOGO,
    tone: "blue" as const,
    disabled: !SUPPORT_FACEBOOK_URL,
  },
] as const;

export function StudentSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNudgeVisible, setIsNudgeVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      return undefined;
    }

    const nudgeDurationMs = 15000;
    const initialDelayMs = 60000;
    const repeatGapMs = 60000;

    let hideTimer: number | undefined;
    let repeatTimer: number | undefined;
    let cancelled = false;

    const triggerNudge = () => {
      if (cancelled) {
        return;
      }

      setIsNudgeVisible(true);
      hideTimer = window.setTimeout(() => {
        setIsNudgeVisible(false);
        repeatTimer = window.setTimeout(triggerNudge, repeatGapMs);
      }, nudgeDurationMs);
    };

    const showTimer = window.setTimeout(triggerNudge, initialDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(showTimer);
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      if (repeatTimer) {
        window.clearTimeout(repeatTimer);
      }
    };
  }, [isOpen]);

  const showNudge = isNudgeVisible && !isOpen;

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-[130] sm:bottom-6 sm:right-6">
      {isOpen ? (
        <button
          type="button"
          aria-label="Đóng thông tin hỗ trợ App"
          className="fixed inset-0 z-[129] cursor-default bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <div
        id="student-support-panel"
        className={`absolute bottom-full right-0 z-[131] mb-3 w-[min(20rem,calc(100vw-1.5rem))] origin-bottom-right rounded-[24px] border border-[rgba(212,229,216,0.95)] bg-white/98 p-3 shadow-[0_22px_50px_-22px_rgba(6,78,59,0.28)] backdrop-blur-sm transition-all duration-200 ${
          isOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--mevi-text-primary)]">
              {SUPPORT_TITLE}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-[var(--mevi-text-muted)]">
              {SUPPORT_SUBTITLE}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--mevi-border)] text-[var(--mevi-text-muted)] transition hover:bg-[var(--mevi-green-50)] hover:text-[var(--mevi-green-700)]"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng thông tin hỗ trợ App"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {supportItems.map((item) => {
            const toneClasses =
              item.tone === "emerald"
                ? "bg-emerald-50 text-emerald-700"
                : item.tone === "sky"
                  ? "bg-sky-50 text-sky-700"
                  : "bg-blue-50 text-blue-700";

            const content = (
              <>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneClasses}`}
                >
                  {item.key === "hotline" ? (
                    <PhoneCall className="h-4 w-4" />
                  ) : (
                    <Image
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-semibold leading-5 text-[var(--mevi-text-primary)]">
                    {item.label}
                  </span>
                  <span className="block text-xs leading-4 text-[var(--mevi-text-muted)]">
                    {item.description}
                  </span>
                </span>
              </>
            );

            if (item.disabled) {
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled
                  className="flex w-full items-center gap-3 rounded-2xl border border-[rgba(212,229,216,0.55)] bg-[rgba(248,245,236,0.72)] px-3 py-2.5 opacity-70"
                >
                  {content}
                </button>
              );
            }

            return (
              <a
                key={item.key}
                href={item.href}
                target={item.key === "hotline" ? undefined : "_blank"}
                rel={item.key === "hotline" ? undefined : "noreferrer"}
                className="flex items-center gap-3 rounded-2xl border border-[rgba(212,229,216,0.75)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 transition hover:-translate-y-0.5 hover:bg-[rgba(240,249,255,0.9)]"
              >
                {content}
              </a>
            );
          })}
        </div>
      </div>

      {showNudge ? (
        <div className="absolute bottom-1/2 right-[4rem] z-[132] mb-1 translate-y-1/2">
          <div className="relative max-w-[min(17rem,calc(100vw-5rem))] rounded-full border border-[rgba(212,229,216,0.95)] bg-white/98 px-4 py-2.5 shadow-[0_16px_34px_-20px_rgba(6,78,59,0.28)] backdrop-blur-sm animate-fade-in-up">
            <p className="whitespace-nowrap text-[11px] font-semibold leading-none text-[var(--mevi-text-primary)] sm:text-sm">
              Bạn cần hỗ trợ? Liên hệ ở đây
            </p>
            <span className="absolute right-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-[rgba(212,229,216,0.95)] bg-white/98" />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => {
            const next = !current;

            if (next) {
              setIsNudgeVisible(false);
            }

            return next;
          });
        }}
        className="group relative z-[131] inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(212,229,216,0.8)] bg-white shadow-[0_16px_34px_-18px_rgba(6,78,59,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_-16px_rgba(6,78,59,0.45)]"
        aria-label="Mở thông tin hỗ trợ App"
        aria-expanded={isOpen}
        aria-controls="student-support-panel"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--mevi-green-100),var(--mevi-green-200))] text-[var(--mevi-green-700)] transition-all duration-300 group-hover:scale-[1.03]">
          <GraduationCap className="h-6 w-6" />
        </span>
      </button>
    </div>
  );
}
