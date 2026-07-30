"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Download, LaptopMinimal, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const APPLE_GUIDE_IMAGES = [
  {
    src: "/install-guide-1.webp",
    alt: "Bước 1: Mở menu trình duyệt",
    title: "Bước 1",
  },
  {
    src: "/install-guide-2.webp",
    alt: "Bước 2: Nhấn nút Chia sẻ",
    title: "Bước 2",
  },
  {
    src: "/install-guide-3.webp",
    alt: "Bước 3: Nhấn vào nút Thêm",
    title: "Bước 3",
  },
  {
    src: "/install-guide-4.webp",
    alt: "Bước 4: Chọn Thêm vào Màn hình chính",
    title: "Bước 4",
  },
  {
    src: "/install-guide-5.webp",
    alt: "Bước 5: Xác nhận thêm ứng dụng",
    title: "Bước 5",
  },
  {
    src: "/install-guide-6.webp",
    alt: "Bước 6: Hoàn thành và mở MEVI",
    title: "Bước 6",
  },
] as const;

function isAppleDevice() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() ?? "";
  return (
    /iphone|ipad|ipod/.test(ua) ||
    (platform.includes("mac") && "ontouchend" in document)
  );
}

function isAndroidDevice() {
  if (typeof navigator === "undefined") return false;
  return /android/.test(navigator.userAgent.toLowerCase());
}

function isStandaloneApp() {
  if (typeof window === "undefined") return false;

  const standaloneNavigator = (
    navigator as Navigator & {
      standalone?: boolean;
    }
  ).standalone;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    standaloneNavigator === true
  );
}

export function AppInstallControl() {
  const isMounted = useSyncExternalStore(
    () => () => null,
    () => true,
    () => false,
  );
  const isCompactViewport = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const mediaQuery = window.matchMedia("(max-width: 1023px)");
      mediaQuery.addEventListener("change", onStoreChange);

      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 1023px)").matches
        : false,
    () => false,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isAndroidHintOpen, setIsAndroidHintOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const platform = useMemo(() => {
    if (!isMounted) return "unknown";
    if (isAppleDevice()) return "apple";
    if (isAndroidDevice()) return "android";
    return "other";
  }, [isMounted]);
  const isInstalledApp = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const mediaQuery = window.matchMedia("(display-mode: standalone)");
      const handler = () => onStoreChange();

      mediaQuery.addEventListener("change", handler);
      window.addEventListener("appinstalled", handler);

      return () => {
        mediaQuery.removeEventListener("change", handler);
        window.removeEventListener("appinstalled", handler);
      };
    },
    isStandaloneApp,
    () => false,
  );
  const shouldShowInstallControl = isCompactViewport && !isInstalledApp;

  useEffect(() => {
    if (!isMounted) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsOpen(false);
      setIsInstalling(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      onBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function openInstallFlow() {
    if (platform === "apple") {
      setIsOpen(true);
      return;
    }

    if (deferredPrompt) {
      setIsInstalling(true);
      void (async () => {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(() => null);
        setDeferredPrompt(null);
        setIsInstalling(false);
      })();
      return;
    }

    if (platform === "android") {
      setIsAndroidHintOpen(true);
    }
  }

  function closeAndroidHint() {
    setIsAndroidHintOpen(false);
  }

  function closeDialog() {
    setIsOpen(false);
  }

  function scrollToSlide(index: number) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollTo({
      left: carousel.clientWidth * index,
      behavior: "smooth",
    });
  }

  function handleCarouselScroll() {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const slideWidth = carousel.clientWidth || 1;
    const nextIndex = Math.round(carousel.scrollLeft / slideWidth);
    const clampedIndex = Math.min(
      APPLE_GUIDE_IMAGES.length - 1,
      Math.max(0, nextIndex),
    );

    setActiveSlide(clampedIndex);
  }

  const tooltipLabel = platform === "apple" ? "Hướng dẫn cài đặt" : "Tải app";

  const dialog =
    platform === "apple" && isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6"
            role="presentation"
            onClick={closeDialog}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Hướng dẫn cài đặt ứng dụng MEVI"
              className="mevi-install-dialog relative w-full max-w-[720px] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-[28px] border border-white/60 bg-white shadow-[0_30px_80px_-24px_rgba(6,78,59,0.45)] sm:max-h-[calc(100dvh-3rem)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className="flex items-center justify-between gap-4 border-b border-[rgba(212,229,216,0.8)] px-5 py-4 sm:px-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(236,253,245,0.9), rgba(248,245,236,0.95))",
                }}
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--mevi-green-700)" }}
                  >
                    Cài MEVI vào thiết bị
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    Vuốt ngang để xem 6 bước cài đặt.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDialog}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                  aria-label="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col">
                <div
                  ref={carouselRef}
                  onScroll={handleCarouselScroll}
                  className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth overscroll-x-contain touch-pan-x"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {APPLE_GUIDE_IMAGES.map((guide, index) => (
                    <div
                      key={guide.src}
                      className="min-w-full snap-center px-4 py-5 sm:px-6 sm:py-6"
                    >
                      <div className="mx-auto flex w-full max-w-[520px] flex-col items-center">
                        <div className="relative flex h-[300px] w-full items-center justify-center sm:h-[360px]">
                          <Image
                            src={guide.src}
                            alt={guide.alt}
                            fill
                            className="object-contain object-center"
                            priority={index === 0}
                          />
                        </div>
                        <div className="mt-4 text-center">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--mevi-text-primary)" }}
                          >
                            {guide.title}
                          </p>
                          <p
                            className="mt-1 text-xs leading-5"
                            style={{ color: "var(--mevi-text-secondary)" }}
                          >
                            {guide.alt}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {APPLE_GUIDE_IMAGES.map((guide, index) => (
                    <button
                      key={guide.src}
                      type="button"
                      onClick={() => scrollToSlide(index)}
                      className="h-2.5 rounded-full transition-all duration-200"
                      style={{
                        width: index === activeSlide ? "2rem" : "0.75rem",
                        background:
                          index === activeSlide
                            ? "var(--mevi-green-700)"
                            : "rgba(11, 122, 90, 0.22)",
                      }}
                      aria-label={`Chuyển đến ${guide.title}`}
                      aria-pressed={index === activeSlide}
                    />
                  ))}
                </div>
                <div className="text-center text-xs text-[var(--mevi-text-muted)] py-2">
                  Vuốt ngang để chuyển slide, hoặc chạm vào chấm bên dưới.
                </div>
                <div className="flex flex-col gap-5 border-t border-[rgba(212,229,216,0.8)] px-5 py-5 sm:px-6 sm:py-6">
                  <div className="space-y-3">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        color: "var(--mevi-green-700)",
                        background: "var(--mevi-green-50)",
                      }}
                    >
                      <LaptopMinimal className="h-3.5 w-3.5" />
                      Dành cho Apple
                    </div>

                    <h3
                      className="text-xl font-bold"
                      style={{ color: "var(--mevi-text-primary)" }}
                    >
                      Cài MEVI từ Safari
                    </h3>

                    <p
                      className="text-sm leading-6"
                      style={{ color: "var(--mevi-text-secondary)" }}
                    >
                      Apple không hỗ trợ nút cài đặt trực tiếp như Android, nên
                      chúng tôi hiển thị hướng dẫn từng bước để bạn thêm MEVI
                      vào màn hình chính.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={closeDialog}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--mevi-green-500), var(--mevi-green-700))",
                      }}
                    >
                      Đã hiểu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  const androidHint =
    platform === "android" &&
    isAndroidHintOpen &&
    typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-black/30 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6"
            role="presentation"
            onClick={closeAndroidHint}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Cách cài MEVI trên Android"
              className="w-full max-w-md rounded-[24px] border border-white/60 bg-white shadow-[0_24px_60px_-20px_rgba(6,78,59,0.4)] overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className="flex items-start justify-between gap-4 border-b border-[rgba(212,229,216,0.8)] px-5 py-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(236,253,245,0.92), rgba(248,245,236,0.96))",
                }}
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--mevi-green-700)" }}
                  >
                    Tải MEVI trên Android
                  </p>
                  <p
                    className="mt-1 text-xs leading-5"
                    style={{ color: "var(--mevi-text-secondary)" }}
                  >
                    Nếu trình duyệt chưa hiện nút cài đặt, hãy mở menu Chrome và
                    chọn “Install app” hoặc “Add to Home screen”.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAndroidHint}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                  aria-label="Đóng"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div
                  className="flex items-start gap-3 rounded-2xl border border-[rgba(212,229,216,0.8)] bg-[rgba(248,245,236,0.65)] p-4"
                  style={{ color: "var(--mevi-text-secondary)" }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "var(--mevi-green-50)",
                      color: "var(--mevi-green-700)",
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--mevi-text-primary)" }}
                    >
                      Tại sao không tự cài ngay?
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      Một số trình duyệt Android chưa cấp quyền cài PWA trực
                      tiếp cho trang này. Nút ở header vẫn là nút tải, nhưng nếu
                      prompt chưa xuất hiện thì bạn cần dùng menu trình duyệt.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeAndroidHint}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--mevi-green-500), var(--mevi-green-700))",
                  }}
                >
                  Hiểu rồi
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return shouldShowInstallControl ? (
    <>
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={openInstallFlow}
          onMouseEnter={() => setIsTooltipOpen(true)}
          onMouseLeave={() => setIsTooltipOpen(false)}
          onFocus={() => setIsTooltipOpen(true)}
          onBlur={() => setIsTooltipOpen(false)}
          className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(212,229,216,0.95)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,253,245,0.92))] text-[var(--mevi-green-700)] shadow-[0_12px_28px_-22px_rgba(6,78,59,0.45)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-[rgba(11,122,90,0.22)] hover:shadow-[0_18px_40px_-24px_rgba(6,78,59,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(11,122,90,0.18)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={tooltipLabel}
          title={tooltipLabel}
          disabled={isInstalling}
        >
          <Download className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-[1.05]" />
        </button>

        {isTooltipOpen ? (
          <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/60 bg-[rgba(26,60,42,0.95)] px-3 py-1.5 text-xs font-semibold leading-none text-white shadow-[0_14px_28px_-18px_rgba(0,0,0,0.42)]">
            {tooltipLabel}
          </div>
        ) : null}
      </div>

      {dialog}
      {androidHint}
    </>
  ) : null;
}
