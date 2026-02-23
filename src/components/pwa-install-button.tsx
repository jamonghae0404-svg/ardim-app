"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled,   setIsInstalled]   = useState(false);
  const [isDismissed,   setIsDismissed]   = useState(false);

  useEffect(() => {
    // 이미 standalone(설치됨) 모드인지 확인
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isInstalled || isDismissed || !installPrompt) return null;

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-3 py-2.5 rounded-2xl shadow-xl shadow-blue-300/50 animate-fade-in">
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all"
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
        앱 설치하기
      </button>
      <button
        onClick={() => setIsDismissed(true)}
        className="ml-1 -mr-0.5 rounded-full p-0.5 hover:bg-white/20 transition-colors"
        aria-label="닫기"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
