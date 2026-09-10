"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Tag,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [provider, setProvider] = useState<"vietqr" | "vnpay" | "momo" | "stripe">("vietqr");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/pricing");
        const data = await res.json();
        if (data.plans) setPlans(data.plans);
      } catch (err) {
        console.error(err);
      }
    }
    fetchPlans();
  }, []);

  const selectedPlan = plans.find((p) => p.slug === selectedPlanSlug) || plans.find((p) => p.slug === "pro");
  const baseAmount = selectedPlan
    ? billingCycle === "yearly"
      ? selectedPlan.priceYearly
      : selectedPlan.priceMonthly
    : 199000;

  const discountAmount = couponResult ? couponResult.discountAmount : 0;
  const finalAmount = Math.max(0, baseAmount - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          planId: selectedPlan.id,
          originalAmount: baseAmount,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponResult(data);
      } else {
        setCouponError(data.error || "Mã giảm giá không hợp lệ");
      }
    } catch (err: any) {
      setCouponError("Lỗi kiểm tra mã giảm giá");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    if (selectedPlan.slug === "free") {
      router.push("/register");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle,
          provider,
          couponCode: couponResult ? couponCode.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setCheckoutError(data.error || "Lỗi khởi tạo thanh toán");
        setCheckoutLoading(false);
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Lỗi kết nối máy chủ");
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-sm text-neutral-400 hover:text-white">
            ← Quay lại trang chủ
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đầu tư cho năng suất cuộc sống</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Bảng Giá Dịch Vụ LifeOS
          </h1>
          <p className="text-neutral-400 text-base">
            Thanh toán an toàn, linh hoạt qua VNPay, MoMo hoặc Stripe. Hỗ trợ kích hoạt tức thì.
          </p>
        </div>

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((p) => {
            const isSelected = selectedPlanSlug === p.slug;
            const price = billingCycle === "yearly" ? p.priceYearly : p.priceMonthly;

            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPlanSlug(p.slug);
                  setCouponResult(null);
                  setCouponError("");
                }}
                className={`cursor-pointer rounded-3xl p-6 border-2 transition relative flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-950/20 shadow-xl shadow-indigo-500/15"
                    : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg text-white">{p.name}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-indigo-500 bg-indigo-600 text-white" : "border-neutral-700"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mb-4 min-h-[32px]">{p.description}</p>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                    {price === 0 ? "0đ" : `${price.toLocaleString("vi-VN")}đ`}
                    <span className="text-xs font-normal text-neutral-500 ml-1">
                      /{billingCycle === "yearly" ? "năm" : "tháng"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 text-xs text-neutral-300 space-y-2">
                  <div>• Dự án: {p.slug === "free" ? "3 dự án" : "Không giới hạn"}</div>
                  <div>• Công việc: {p.slug === "free" ? "100 việc" : "Không giới hạn"}</div>
                  <div>• AI Credits: {p.slug === "free" ? "20/tháng" : p.slug === "pro" ? "300/tháng" : "1.000/tháng"}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CHECKOUT BOX */}
        {selectedPlan && selectedPlan.slug !== "free" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Chi tiết đơn hàng & Thanh toán</h3>

            {/* Cycle Selection */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Chu kỳ thanh toán
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBillingCycle("monthly");
                    setCouponResult(null);
                  }}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition ${
                    billingCycle === "monthly"
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  Theo tháng ({selectedPlan.priceMonthly.toLocaleString("vi-VN")}đ/tháng)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBillingCycle("yearly");
                    setCouponResult(null);
                  }}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                    billingCycle === "yearly"
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <span>Theo năm (-20%)</span>
                </button>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Phương thức thanh toán tự động
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "vietqr", label: "VietQR Ngân Hàng", icon: QrCode, badge: "Nhanh nhất" },
                  { id: "vnpay", label: "VNPay QR / ATM", icon: QrCode },
                  { id: "momo", label: "Ví MoMo", icon: CreditCard },
                  { id: "stripe", label: "Thẻ Quốc Tế", icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setProvider(m.id as any)}
                      className={`py-3 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition relative ${
                        provider === m.id
                          ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                          : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      {m.badge && (
                        <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase">
                          {m.badge}
                        </span>
                      )}
                      <Icon className={`w-4 h-4 ${provider === m.id ? "text-amber-400" : "text-neutral-400"}`} />
                      <span className="text-center">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Mã giảm giá (Coupon)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã (ví dụ: WELCOME20, PRO50K)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition uppercase font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold text-white disabled:opacity-50 transition"
                >
                  {couponLoading ? "Kiểm tra..." : "Áp dụng"}
                </button>
              </div>

              {couponResult && (
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{couponResult.message}</span>
                </div>
              )}
              {couponError && (
                <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{couponError}</span>
                </div>
              )}
            </div>

            {/* Order Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 mb-6 text-sm space-y-2.5">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Gói cước: {selectedPlan.name} ({billingCycle === "yearly" ? "1 năm" : "1 tháng"})</span>
                <span className="text-white font-medium">{baseAmount.toLocaleString("vi-VN")}đ</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Giảm giá từ mã khuyến mãi</span>
                  <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between font-bold text-base text-white">
                <span>Tổng tiền thanh toán</span>
                <span className="text-xl text-gradient-brand">{finalAmount.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            {checkoutError && (
              <div className="p-3 mb-6 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Checkout CTA */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full py-4 rounded-2xl bg-gradient-brand text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 hover:opacity-95 transition active:scale-[0.98] disabled:opacity-50"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang kết nối cổng thanh toán...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận & Thanh toán ngay</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 mt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Giao dịch bảo mật chuẩn SSL / HMAC chữ ký số</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
