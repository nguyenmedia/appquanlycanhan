"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  UserCheck,
  Copy,
  Check,
  Gift,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ReferPage() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReferral() {
      try {
        const res = await fetch("/api/referrals");
        const json = await res.json();
        if (json.success) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReferral();
  }, []);

  const handleCopy = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            <span>Chương Trình Giới Thiệu Bạn Bè (Referral Program)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Mời bạn bè cùng trải nghiệm LifeOS. Nhận thêm ngày sử dụng gói Pro và AI credits hoàn toàn miễn phí.
          </p>
        </div>

        {/* HERO REFERRAL CARD */}
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-neutral-900 to-neutral-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4">
              <Gift className="w-3.5 h-3.5" />
              <span>Thưởng +7 ngày Pro cho mỗi lượt giới thiệu thành công</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Chia sẻ LifeOS, nâng tầm cuộc sống số
            </h2>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Gửi liên kết giới thiệu độc quyền của bạn. Khi bạn bè đăng ký và bắt đầu nâng cấp tài khoản, cả hai đều nhận được phần thưởng giá trị.
            </p>

            {/* Copy link bar */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={data?.referralLink || "Đang tạo liên kết..."}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-neutral-200 font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Đã sao chép!" : "Sao chép liên kết"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* REWARD STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/60 text-center">
            <span className="text-xs text-neutral-400">Tổng lượt mời</span>
            <div className="text-3xl font-extrabold text-white mt-1">{data?.total || 0}</div>
          </div>
          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/60 text-center">
            <span className="text-xs text-neutral-400">Thành công</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{data?.successful || 0}</div>
          </div>
          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/60 text-center">
            <span className="text-xs text-neutral-400">Đang chờ kích hoạt</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">{data?.pending || 0}</div>
          </div>
          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/60 text-center">
            <span className="text-xs text-neutral-400">Ngày Pro nhận được</span>
            <div className="text-3xl font-extrabold text-indigo-400 mt-1">+{data?.rewardsEarnedDays || 0}d</div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
          <h3 className="font-bold text-base text-white">Cách thức hoạt động</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-3">1</span>
              <h4 className="font-semibold text-white mb-1">Gửi liên kết</h4>
              <p className="text-neutral-400">Chia sẻ liên kết cá nhân cho đồng nghiệp, bạn bè hoặc mạng xã hội.</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-3">2</span>
              <h4 className="font-semibold text-white mb-1">Bạn bè đăng ký</h4>
              <p className="text-neutral-400">Hệ thống tự động ghi nhận mã giới thiệu của bạn khi họ tạo tài khoản.</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-3">3</span>
              <h4 className="font-semibold text-white mb-1">Nhận thưởng Pro</h4>
              <p className="text-neutral-400">Ngay khi bạn bè nâng cấp bất kỳ gói trả phí nào, bạn sẽ được tự động cộng 7 ngày Pro.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
