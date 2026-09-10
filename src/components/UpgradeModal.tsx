"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Check, X, ShieldAlert, ArrowRight } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  featureName?: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  title = "Nâng cấp lên gói LifeOS Pro",
  description = "Mở khóa toàn bộ tiềm năng quản lý cuộc sống với không giới hạn công việc, dự án và trợ lý AI.",
  featureName,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 md:p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{featureName ? `Tính năng ${featureName}` : "Mở khóa giới hạn"}</span>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-400 mb-6">{description}</p>

        {/* Benefits list */}
        <div className="space-y-2.5 mb-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4">
          {[
            "Không giới hạn công việc & dự án",
            "AI Assistant & Lập kế hoạch ngày thông minh",
            "Đầy đủ công cụ Tài chính, Báo cáo & Phân tích",
            "Đồng bộ liên tục & Bảo mật nâng cao",
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm text-neutral-300">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/pricing"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-brand text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-indigo-500/25 transition active:scale-[0.98]"
          >
            <span>Nâng cấp ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800/60 text-sm font-medium transition"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}
