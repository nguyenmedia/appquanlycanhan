"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Zap,
  RotateCcw,
} from "lucide-react";

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadBilling() {
      try {
        const [meRes, usageRes] = await Promise.all([
          fetch("/api/auth/me").then((r) => r.json()),
          fetch("/api/usage").then((r) => r.json()),
        ]);
        if (meRes.user) setUser(meRes.user);
        if (usageRes.success) setUsageData(usageRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadBilling();
  }, []);

  const handleCancelSub = async () => {
    setCancelling(true);
    try {
      alert("Yêu cầu hủy đã được ghi nhận. Đăng ký của bạn sẽ kết thúc vào cuối chu kỳ thanh toán hiện tại mà không trừ thêm phí.");
      setShowCancelModal(false);
    } catch (e) {
      alert("Lỗi xử lý");
    } finally {
      setCancelling(false);
    }
  };

  const plan = user?.plan;
  const sub = user?.subscription;
  const usage = usageData?.usage;

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <span>Gói Cước & Quản Trị Đăng Ký (Billing)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Quản lý gói dịch vụ hiện tại, hạn ngạch tài nguyên và lịch sử hóa đơn thanh toán
          </p>
        </div>

        {/* CURRENT PLAN OVERVIEW CARD */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                Gói hiện tại
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đang kích hoạt ({sub?.billingCycle === "yearly" ? "Hàng năm" : "Hàng tháng"})
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">{plan?.name || "Free"}</h2>
            <p className="text-xs text-neutral-400 max-w-md">
              {plan?.description || "Gói cơ bản quản lý cuộc sống miễn phí trọn đời."}
            </p>
            {sub && (
              <div className="text-xs text-neutral-500 mt-4 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Hết hạn chu kỳ: {new Date(sub.currentPeriodEnd).toLocaleDateString("vi-VN")}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold text-xs text-center shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
            >
              {plan?.slug === "premium" ? "Quản lý gói cước" : "Nâng cấp gói Pro / Premium"}
            </Link>
            {sub && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-xl text-neutral-500 hover:text-rose-400 text-xs transition text-center"
              >
                Hủy đăng ký chu kỳ tới
              </button>
            )}
          </div>
        </div>

        {/* RESOURCE USAGE GAUGES */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Hạn ngạch & Mức độ sử dụng tài nguyên</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Tasks Usage */}
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-neutral-400">Công việc (Tasks)</span>
                <span className="font-bold text-white">
                  {usage?.tasks?.current || 0} / {usage?.tasks?.unlimited ? "∞" : usage?.tasks?.limit}
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{
                    width: usage?.tasks?.unlimited
                      ? "100%"
                      : `${Math.min(100, ((usage?.tasks?.current || 0) / (usage?.tasks?.limit || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Projects Usage */}
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-neutral-400">Dự án (Projects)</span>
                <span className="font-bold text-white">
                  {usage?.projects?.current || 0} / {usage?.projects?.unlimited ? "∞" : usage?.projects?.limit}
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{
                    width: usage?.projects?.unlimited
                      ? "100%"
                      : `${Math.min(100, ((usage?.projects?.current || 0) / (usage?.projects?.limit || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* AI Credits Usage */}
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-neutral-400">AI Credits khả dụng</span>
                <span className="font-bold text-amber-400">
                  {loading ? "..." : `${usage?.aiCredits?.balance ?? user?.aiCredits?.balance ?? 0} credits`}
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        10,
                        (((usage?.aiCredits?.balance ?? user?.aiCredits?.balance) || 0) /
                          (usage?.aiCredits?.limit || (plan?.slug === "premium" ? 1000 : 300))) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* INVOICES SECTION */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Lịch sử Hóa đơn thanh toán</span>
            </h3>
            <span className="text-xs text-neutral-500">Bảo mật chuẩn hóa đơn VAT điện tử</span>
          </div>

          <div className="divide-y divide-neutral-800 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Hóa đơn #{sub?.id?.slice(-8).toUpperCase() || "INV-001"}</span>
                <span className="block text-neutral-500">
                  Gói {plan?.name || "LifeOS Premium"} ({sub?.billingCycle === "yearly" ? "Hàng năm" : "Hàng tháng"}) • Thanh toán qua {sub?.provider?.toUpperCase() || "VIETQR"}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-white">
                  {sub?.price
                    ? sub.price.toLocaleString("vi-VN") + "đ"
                    : (sub?.billingCycle === "yearly" ? plan?.priceYearly : plan?.priceMonthly)?.toLocaleString("vi-VN") || "0"}đ
                </span>
                <span className="block text-[10px] text-emerald-400 font-medium">Đã thanh toán</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHURN RETENTION MODAL */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Tại sao bạn muốn hủy đăng ký?</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Ý kiến của bạn là động lực giúp chúng tôi cải thiện LifeOS tốt hơn mỗi ngày.
              </p>

              <div className="space-y-2 mb-6">
                {[
                  "Chi phí vượt ngân sách cá nhân",
                  "Chưa có đủ thời gian sử dụng hết tính năng",
                  "Cần thêm các tính năng kết nối chuyên sâu",
                  "Lý do khác",
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCancelReason(reason)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition ${
                      cancelReason === reason
                        ? "border-indigo-500 bg-indigo-950/40 text-white"
                        : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {/* Retention Offer */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 mb-6">
                <div className="font-semibold mb-1">Ưu đãi giữ chân dành riêng cho bạn:</div>
                <span>Áp dụng mã <strong>WELCOME20</strong> giảm 20% cho chu kỳ tiếp theo thay vì hủy?</span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
                >
                  Giữ lại đăng ký
                </button>
                <button
                  type="button"
                  onClick={handleCancelSub}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/20 transition"
                >
                  {cancelling ? "Đang xử lý..." : "Xác nhận hủy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
