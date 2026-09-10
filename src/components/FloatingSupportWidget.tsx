"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones, LifeBuoy, MessageSquare, X, ArrowRight, ShieldCheck } from "lucide-react";

export default function FloatingSupportWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Do not render on support page itself or admin dashboard to prevent clutter
  if (pathname?.startsWith("/support") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-[76px] right-3.5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Quick Preview Popup */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-28px)] max-w-sm sm:w-80 rounded-2xl bg-[#0e0e16]/95 border border-indigo-500/30 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Hỗ Trợ Khách Hàng</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Admin & Kỹ thuật đang trực tuyến</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-neutral-300 leading-relaxed">
            Bạn cần hỗ trợ về tài khoản, nâng cấp gói Pro VietQR, hoặc phản hồi tính năng? Hãy gửi yêu cầu bảo mật 1:1 ngay.
          </div>

          <Link
            href="/support"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
          >
            <span>Mở Trung Tâm Hỗ Trợ 1:1</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="flex items-center gap-2">
        {/* Helper Badge (Only when popup is closed) */}
        {!isOpen && (
          <Link
            href="/support"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-xs font-medium text-neutral-200 shadow-xl backdrop-blur-md hover:border-indigo-500 transition group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="group-hover:text-indigo-300 transition">Hỗ trợ 24/7</span>
          </Link>
        )}

        {/* Main Floating Circle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Hỗ trợ khách hàng"
          className="relative w-11 h-11 sm:w-13 sm:h-13 p-2.5 sm:p-3 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/35 hover:scale-105 active:scale-95 transition duration-200 flex items-center justify-center group border border-indigo-400/40"
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <>
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-6 transition-transform" />
              {/* Green online indicator */}
              <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-[#09090b] rounded-full animate-pulse" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
