"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  QrCode,
  UserCheck,
} from "lucide-react";
import { PendingTransferRequest } from "./AdminNotificationCenter";

export default function PendingTransfersManager({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const [requests, setRequests] = useState<PendingTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedTxn, setCopiedTxn] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments/requests");
      const json = await res.json();
      if (json.success && Array.isArray(json.requests)) {
        setRequests(json.requests);
        if (onCountChange) onCountChange(json.requests.length);
      }
    } catch (e) {
      console.error("Failed to load requests:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (reqItem: PendingTransferRequest) => {
    if (
      !confirm(
        `Xác nhận phê duyệt chuyển khoản và NÂNG CẤP ngay gói [${reqItem.planName}] cho khách hàng ${reqItem.user.email}?`
      )
    ) {
      return;
    }

    setProcessingId(reqItem.transactionId);
    try {
      const res = await fetch("/api/admin/payments/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          transactionId: reqItem.transactionId,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessBanner(
          `🎉 Đã phê duyệt và nâng cấp thành công gói [${reqItem.planName}] cho khách hàng ${reqItem.user.email}!`
        );
        setTimeout(() => setSuccessBanner(null), 5000);
        setRequests((prev) => prev.filter((r) => r.transactionId !== reqItem.transactionId));
        if (onCountChange) onCountChange(Math.max(0, requests.length - 1));
      } else {
        alert(json.error || "Không thể phê duyệt");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reqItem: PendingTransferRequest) => {
    const reason = prompt(
      "Nhập lý do từ chối (tuỳ chọn):",
      "Chưa nhận được chuyển khoản hoặc sai cú pháp/số tiền"
    );
    if (reason === null) return;

    setProcessingId(reqItem.transactionId);
    try {
      const res = await fetch("/api/admin/payments/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          transactionId: reqItem.transactionId,
          note: reason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessBanner(`Đã từ chối giao dịch ${reqItem.transactionId}`);
        setTimeout(() => setSuccessBanner(null), 4000);
        setRequests((prev) => prev.filter((r) => r.transactionId !== reqItem.transactionId));
        if (onCountChange) onCountChange(Math.max(0, requests.length - 1));
      } else {
        alert(json.error || "Không thể từ chối");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxn(id);
    setTimeout(() => setCopiedTxn(null), 2000);
  };

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Duyệt Chuyển Khoản & Kích Hoạt Gói Khách Hàng</span>
                {requests.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {requests.length} Chờ Xử Lý
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Admin xác nhận giao dịch ngân hàng VietQR để tự động nâng cấp quyền VIP cho khách hàng
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Làm mới ({requests.length})</span>
        </button>
      </div>

      {/* Success banner */}
      {successBanner && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Table / List */}
      {requests.length === 0 ? (
        <div className="py-8 text-center text-neutral-500 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 space-y-1.5">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/40" />
          <div className="text-xs font-semibold text-neutral-300">
            Không có giao dịch chuyển khoản nào cần duyệt
          </div>
          <div className="text-[11px] text-neutral-500 max-w-sm mx-auto">
            Khi khách hàng quét mã VietQR và xác nhận đã chuyển, giao dịch sẽ xuất hiện ngay tại đây và trên chuông thông báo Admin.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[11px] font-semibold uppercase">
                <th className="pb-3 px-3">Khách Hàng (User)</th>
                <th className="pb-3 px-3">Gói Nâng Cấp</th>
                <th className="pb-3 px-3">Số Tiền (VNĐ)</th>
                <th className="pb-3 px-3">Nội Dung Chuyển Khoản</th>
                <th className="pb-3 px-3">Thời Gian</th>
                <th className="pb-3 px-3 text-right">Hành Động Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {requests.map((req) => {
                const isProcessing = processingId === req.transactionId;
                const isCustomerNotified = req.status === "processing";

                return (
                  <tr key={req.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs">
                        {req.user.fullName || req.user.email}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {req.user.email}
                      </div>
                      {isCustomerNotified && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                          Khách đã bấm chuyển tiền
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        {req.planName}
                      </span>
                      <div className="text-[10px] text-neutral-500 mt-1 capitalize">
                        Chu kỳ: {req.billingCycle}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-extrabold text-sm text-emerald-400">
                        {req.amount.toLocaleString("vi-VN")} {req.currency || "VNĐ"}
                      </div>
                      <div className="text-[10px] text-neutral-400 uppercase">
                        Cổng: {req.provider}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(req.transferContent, req.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-neutral-800 font-mono text-[11px] font-bold text-amber-400 hover:border-amber-500/50"
                        title="Bấm để sao chép cú pháp đối chiếu tài khoản ngân hàng"
                      >
                        <span>{req.transferContent}</span>
                        {copiedTxn === req.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-500" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-neutral-400 text-[11px]">
                      {new Date(req.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleReject(req)}
                          disabled={isProcessing}
                          className="px-2.5 py-1.5 rounded-xl border border-neutral-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-semibold transition disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isProcessing ? "Đang xử lý..." : "Phê duyệt & Nâng cấp"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
