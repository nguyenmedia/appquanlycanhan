"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker in production or localhost
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }

    // 2. Check if already installed / standalone
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      setIsStandalone(Boolean(isStandaloneMode));
    }

    // 3. Listen to beforeinstallprompt on Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user dismissed prompt recently
      const dismissedTime = localStorage.getItem("lifeos_pwa_dismissed");
      if (dismissedTime) {
        const diffHours = (Date.now() - Number(dismissedTime)) / (1000 * 60 * 60);
        if (diffHours < 24) {
          // Do not annoy user within 24 hours unless triggered manually
          return;
        }
      }

      setShowPrompt(true);
    };

    // 4. Custom trigger event for manual buttons (in settings/menu)
    const handleManualTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice: any) => {
          if (choice.outcome === "accepted") {
            setInstalledSuccessfully(true);
            setTimeout(() => setInstalledSuccessfully(false), 4000);
          }
          setDeferredPrompt(null);
          setShowPrompt(false);
        });
      } else {
        alert(
          "Để cài đặt LifeOS trên Android:\n1. Mở menu trình duyệt Chrome (dấu 3 chấm ở góc trên)\n2. Chọn 'Cài đặt ứng dụng' hoặc 'Thêm vào Màn hình chính'"
        );
      }
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      setInstalledSuccessfully(true);
      setTimeout(() => setInstalledSuccessfully(false), 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("lifeos-trigger-pwa-install", handleManualTrigger);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("lifeos-trigger-pwa-install", handleManualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setInstalledSuccessfully(true);
      setTimeout(() => setInstalledSuccessfully(false), 4000);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("lifeos_pwa_dismissed", Date.now().toString());
  };

  if (isStandalone) {
    return null; // Already running as installed PWA app
  }

  return (
    <>
      {/* SUCCESS INSTALL BANNER */}
      {installedSuccessfully && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-emerald-500/90 text-white backdrop-blur-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>LifeOS đã được cài đặt vào điện thoại Android của bạn!</span>
        </div>
      )}

      {/* ANDROID BOTTOM INSTALL PROMPT */}
      {showPrompt && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 p-4 rounded-3xl bg-neutral-900/95 border border-indigo-500/30 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <img
                  src="/icons/icon-192x192.png"
                  alt="LifeOS App Icon"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Cài đặt LifeOS cho Android</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
                  Trải nghiệm mượt mà, mở toàn màn hình không có thanh địa chỉ
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-neutral-500 hover:text-white transition"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition"
            >
              Để sau
            </button>
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cài đặt ngay</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
