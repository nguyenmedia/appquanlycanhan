"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  RefreshCw,
  LogIn,
  CheckCircle2,
  Clock,
  Sparkles,
  LifeBuoy,
  Mail,
  ShieldCheck,
  Server,
  ArrowRight,
} from "lucide-react";

export default function MaintenancePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/maintenance/status?t=${Date.now()}`);
      const data = await res.json();
      if (!data.maintenance) {
        setStatusMsg("Hệ thống đã hoạt động trở lại! Đang chuyển hướng...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } else {
        setStatusMsg("Hệ thống vẫn đang trong quá trình bảo trì. Vui lòng quay lại sau ít phút!");
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch {
      setStatusMsg("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setChecking(false);
    }
  };

  // Auto check status every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetch(`/api/maintenance/status?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.maintenance) {
            router.push("/dashboard");
          }
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-600/15 via-orange-600/10 to-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center font-black text-black text-lg shadow-xl shadow-amber-500/20">
            L
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white block leading-tight">
              LifeOS
            </span>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
              System Infrastructure
            </span>
          </div>
        </div>

        {/* Maintenance Box */}
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/70 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top Status Pill */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>Chế độ bảo trì hệ thống (Maintenance Mode)</span>
            </div>
          </div>

          {/* Central Animated Illustration */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 shadow-2xl">
                <Server className="w-10 h-10 animate-pulse text-amber-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/30">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Titles */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hệ Thống Đang Nâng Cấp Định Kỳ
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
              LifeOS đang tiến hành tối ưu hóa cơ sở dữ liệu và nâng cấp hạ tầng máy chủ nhằm mang lại trải nghiệm mượt mà, ổn định và an toàn nhất.
            </p>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-neutral-300">Toàn bộ dữ liệu được bảo vệ an toàn</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/60">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-neutral-300">Dự kiến hoàn tất trong ít phút</span>
            </div>
          </div>

          {/* Status Message Notification */}
          {statusMsg && (
            <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-medium animate-fadeIn flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={checkStatus}
              disabled={checking}
              className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all duration-200 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "Đang kiểm tra kết nối..." : "Kiểm tra & Thử truy cập lại"}</span>
            </button>

            <Link
              href="/login"
              className="w-full py-3 px-5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Cổng đăng nhập Quản Trị Viên (Admin)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto text-neutral-500" />
            </Link>
          </div>
        </div>

        {/* Footer Support */}
        <div className="mt-8 text-center text-xs text-neutral-500 space-y-2">
          <p>
            Cần hỗ trợ khẩn cấp? Vui lòng liên hệ quản trị viên qua email{" "}
            <a
              href="mailto:support@lifeos.app"
              className="text-amber-400 hover:underline font-medium"
            >
              support@lifeos.app
            </a>
          </p>
          <p className="text-[11px] text-neutral-600">
            © {new Date().getFullYear()} LifeOS Cloud Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
