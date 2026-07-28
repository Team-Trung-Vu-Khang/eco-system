"use client";

import {
  Download,
  ExternalLink,
  MonitorSmartphone,
  MoveRight,
  Share2,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function getBrowserInfo() {
  if (typeof window === "undefined") {
    return { isSafari: false, isIos: false, isMac: false };
  }

  const ua = window.navigator.userAgent;
  const vendor = window.navigator.vendor;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isMac = /Macintosh/.test(ua) && !isIos;
  const isSafari =
    /Safari/.test(ua) && /Apple Computer, Inc./.test(vendor) && !/CriOS|FxiOS|EdgiOS/.test(ua);

  return { isSafari, isIos, isMac };
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneDisplay);
  const [isPrompting, setIsPrompting] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [{ isSafari, isIos, isMac }] = useState(getBrowserInfo);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const label = useMemo(() => {
    if (isInstalled) {
      return "Đã cài đặt";
    }

    if (deferredPrompt) {
      return "Tải ứng dụng";
    }

    return "Cài ứng dụng";
  }, [deferredPrompt, isInstalled]);

  const helpTitle = useMemo(() => {
    if (isIos) {
      return "Cài MEVI trên iPhone";
    }

    if (isMac) {
      return "Cài MEVI trên Mac";
    }

    if (isSafari) {
      return "Cài MEVI trên Safari";
    }

    return "Cài MEVI";
  }, [isIos, isMac, isSafari]);

  const handleInstall = async () => {
    if (isInstalled) {
      return;
    }

    if (!deferredPrompt) {
      setIsHelpOpen(true);
      return;
    }

    setIsPrompting(true);

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setIsPrompting(false);
    }
  };

  if (isInstalled) {
    return (
      <button
        type="button"
        className="mevi-btn-secondary inline-flex min-h-[2.75rem] items-center justify-center gap-2 px-4 py-2 text-sm font-semibold"
        aria-disabled="true"
      >
        <Download className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className="mevi-btn-secondary inline-flex min-h-[2.75rem] items-center justify-center gap-2 px-4 py-2 text-sm font-semibold"
        onClick={handleInstall}
        disabled={isPrompting}
      >
        <Download
          className={`h-4 w-4 ${isPrompting ? "animate-bounce" : ""}`}
        />
        {isPrompting ? "Đang mở..." : label}
      </button>

      {isHelpOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-help-title"
        >
          <div className="w-full max-w-lg rounded-[1.5rem] border border-[var(--mevi-border)] bg-white p-5 shadow-[0_30px_100px_rgba(6,78,59,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--mevi-green-700)]">
                  PWA install
                </p>
                <h3
                  id="install-help-title"
                  className="mt-1 text-xl font-extrabold text-[var(--mevi-text-primary)]"
                >
                  {helpTitle}
                </h3>
              </div>

              <button
                type="button"
                className="rounded-full border border-[var(--mevi-border)] p-2 text-[var(--mevi-text-secondary)] transition hover:bg-[var(--mevi-paper)]"
                onClick={() => setIsHelpOpen(false)}
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--mevi-text-secondary)]">
              {isIos ? (
                <>
                  <StepItem
                    icon={<Share2 className="h-4 w-4" />}
                    title="Mở nút Share"
                    text="Trong Safari, bấm nút Chia sẻ ở thanh công cụ."
                  />
                  <StepItem
                    icon={<Smartphone className="h-4 w-4" />}
                    title="Chọn Add to Home Screen"
                    text="Kéo xuống và chọn Add to Home Screen, sau đó bật Open as Web App nếu thấy tùy chọn này."
                  />
                </>
              ) : isMac ? (
                <>
                  <StepItem
                    icon={<Share2 className="h-4 w-4" />}
                    title="Mở menu Share"
                    text="Trong Safari trên Mac, bấm nút Share ở thanh công cụ."
                  />
                  <StepItem
                    icon={<MonitorSmartphone className="h-4 w-4" />}
                    title="Chọn Add to Dock"
                    text="Chọn Add to Dock để tạo biểu tượng MEVI như một ứng dụng."
                  />
                </>
              ) : (
                <>
                  <StepItem
                    icon={<Share2 className="h-4 w-4" />}
                    title="Mở menu trình duyệt"
                    text="Tìm tùy chọn cài ứng dụng hoặc thêm vào màn hình chính trong menu trình duyệt."
                  />
                  <StepItem
                    icon={<ExternalLink className="h-4 w-4" />}
                    title="Nếu không thấy nút cài"
                    text="Safari thường cần thao tác thủ công qua Share > Add to Home Screen."
                  />
                </>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="mevi-btn-primary inline-flex min-h-[2.75rem] items-center justify-center gap-2 px-4 py-2 text-sm font-semibold"
                onClick={() => setIsHelpOpen(false)}
              >
                <MoveRight className="h-4 w-4" />
                Đã hiểu
              </button>
              <a
                href="/manifest.webmanifest"
                target="_blank"
                rel="noreferrer"
                className="mevi-btn-secondary inline-flex min-h-[2.75rem] items-center justify-center gap-2 px-4 py-2 text-sm font-semibold"
              >
                <Download className="h-4 w-4" />
                Xem manifest
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function StepItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[var(--mevi-border)] bg-[var(--mevi-paper)] p-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--mevi-green-700)] shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[var(--mevi-text-primary)]">{title}</p>
        <p className="mt-0.5">{text}</p>
      </div>
    </div>
  );
}
