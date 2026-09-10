"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Building,
  User,
  Hash,
  Sparkles,
  Zap,
} from "lucide-react";

function VietQRCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const transactionId = searchParams.get("transactionId") || "";
  const amount = Number(searchParams.get("amount") || 199000);
  const bankId = searchParams.get("bankId") || "MB";
  const accountNumber = searchParams.get("accountNumber") || "0987654321";
  const accountName = searchParams.get("accountName") || "LIFEOS PLATFORM";
  const content = searchParams.get("content") || `LIFEOS ${transactionId}`;
  const qrUrl = searchParams.get("qrUrl") || `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;

  const planName = searchParams.get("planName") || "Nâng cấp gói dịch vụ LifeOS";

  const [copiedField, setCopiedField] = useState<string>("");
  const [isPaid, setIsPaid] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2500);
  };

  // 1. Polling every 2.5s to auto-detect payment completion
  useEffect(() => {
    if (!transactionId || isPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/check-status?transactionId=${transactionId}`);
        const data = await res.json();
        if (data.isPaid || data.status === "success") {
          setIsPaid(true);
          clearInterval(interval);
          setTimeout(() => {
            router.push("/dashboard?upgrade=success");
          }, 2000);
        }
      } catch (e) {
        console.error("Check status poll error", e);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [transactionId, isPaid, router]);

  // 2. Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Notify Admin button
  const handleNotifyAdmin = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/payments/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });
      const data = await res.json();
      if (data.success) {
        setHasNotified(true);
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setChecking(false);
    }
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 sm:p-6">
      {/* SUCCESS OVERLAY */}
      {isPaid && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-4 shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white">Thanh Toán Thành Công!</h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-sm">
            Hệ thống đã tự động kích hoạt gói dịch vụ và cộng đầy đủ AI credits vào tài khoản của bạn.
          </p>
          <div className="mt-6 text-xs text-amber-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Đang chuyển hướng về Bàn làm việc...</span>
          </div>
        </div>
      )}

      {/* MAIN CHECKOUT CONTAINER */}
      <div className="w-full max-w-2xl bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chọn gói khác</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Thời gian giữ đơn: {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}</span>
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đang thanh toán: {planName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
            <QrCode className="w-6 h-6 text-emerald-400" />
            <span>Quét Mã VietQR Thanh Toán Tự Động</span>
          </h1>
          <p className="text-xs text-neutral-400">
            Mở ứng dụng ngân hàng bất kỳ (MB, VCB, Techcombank, MoMo...) và quét mã QR để chuyển khoản
          </p>
        </div>

        {/* TWO COLUMN QR & BANK DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* QR CODE BOX */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-xl">
            <img
              src={qrUrl}
              alt="VietQR Code"
              className="w-full max-w-[240px] aspect-square object-contain"
            />
            <span className="text-[11px] font-bold text-neutral-600 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Mã QR động đã kèm số tiền & nội dung
            </span>
          </div>

          {/* BANK INFO FIELDS */}
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Ngân hàng thụ hưởng</span>
              <div className="flex items-center justify-between mt-0.5">
                <strong className="text-white text-sm">{bankId} (Ngân Hàng Quân Đội)</strong>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">24/7 NAPAS</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Số tài khoản</span>
              <div className="flex items-center justify-between mt-0.5">
                <strong className="text-amber-400 text-base font-mono tracking-wider">{accountNumber}</strong>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountNumber, "account")}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === "account" ? "Đã chép!" : "Sao chép"}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Chủ tài khoản</span>
              <strong className="text-white text-xs block mt-0.5 uppercase">{accountName}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Số tiền cần chuyển</span>
              <div className="flex items-center justify-between mt-0.5">
                <strong className="text-emerald-400 text-lg font-black">{amount.toLocaleString("vi-VN")}đ</strong>
                <button
                  type="button"
                  onClick={() => copyToClipboard(String(amount), "amount")}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === "amount" ? "Đã chép!" : "Sao chép"}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-amber-400 block text-[10px] uppercase font-bold">
                Nội dung chuyển khoản (Bắt buộc chính xác)
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <strong className="text-white text-xs font-mono font-bold tracking-wide">{content}</strong>
                <button
                  type="button"
                  onClick={() => copyToClipboard(content, "content")}
                  className="flex items-center gap-1 text-[11px] bg-amber-500 text-black px-2.5 py-1 rounded-lg font-bold hover:bg-amber-400 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === "content" ? "Đã chép!" : "Sao chép"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM AUTO SYNC STATUS & MANUAL BUTTON */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${hasNotified ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-ping"}`} />
            <span>
              {hasNotified
                ? "⏳ Đã gửi thông báo cho Admin! Đang chờ duyệt & kích hoạt tự động..."
                : "Đang lắng nghe chuyển khoản... Tự động mở khóa khi tiền vào hoặc Admin duyệt"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNotifyAdmin}
            disabled={checking || hasNotified}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5 ${
              hasNotified
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-default"
                : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
            }`}
          >
            {hasNotified ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Đã thông báo Admin (Đang chờ duyệt)</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>{checking ? "Đang gửi..." : "Tôi đã chuyển khoản xong"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VietQRCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">Đang tải trang thanh toán...</div>}>
      <VietQRCheckoutContent />
    </Suspense>
  );
}
