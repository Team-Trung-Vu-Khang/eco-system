"use client";

import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneDisplay);
  const [isPrompting, setIsPrompting] = useState(false);

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

  const handleInstall = async () => {
    if (isInstalled) {
      return;
    }

    if (!deferredPrompt) {
      alert(
        "Trình duyệt này chưa hỗ trợ cài đặt tự động. Hãy mở menu trình duyệt và chọn Add to Home Screen."
      );
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
    <button
      type="button"
      className="mevi-btn-secondary inline-flex min-h-[2.75rem] items-center justify-center gap-2 px-4 py-2 text-sm font-semibold"
      onClick={handleInstall}
      disabled={isPrompting}
    >
      <Download className={`h-4 w-4 ${isPrompting ? "animate-bounce" : ""}`} />
      {isPrompting ? "Đang mở..." : label}
    </button>
  );
}
