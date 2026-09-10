"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  CreditCard,
  User,
  Check,
  MessageSquare,
  LifeBuoy,
  Send,
  AlertTriangle,
} from "lucide-react";

export interface PendingTransferRequest {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
  };
  planName: string;
  planId?: string;
  billingCycle: string;
  transferContent: string;
}

export interface SupportNotificationItem {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    planName: string;
  };
  lastMessage: {
    text: string;
    senderRole: string;
    createdAt: string;
    isFromCustomer: boolean;
  } | null;
}

// Chime using Web Audio API
function playChime(type: "notify" | "support" | "success") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "notify") {
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "support") {
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.1);
      osc.frequency.setValueAtTime(659.25, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.5, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    }
  } catch (e) {
    // Audio context may be blocked before user gesture
  }
}

export default function AdminNotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "transfers" | "support">("all");

  const [transfers, setTransfers] = useState<PendingTransferRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedTxn, setCopiedTxn] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const prevTransfersCountRef = useRef<number>(0);
  const prevSupportCountRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchNotifications = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const json = await res.json();
      if (json.success) {
        const newTransfers: PendingTransferRequest[] = json.transfers || [];
        const newTickets: SupportNotificationItem[] = json.supportTickets || [];

        if (!isFirstLoadRef.current) {
          if (newTransfers.length > prevTransfersCountRef.current) {
            playChime("notify");
            showToast(`💳 Có ${newTransfers.length - prevTransfersCountRef.current} yêu cầu chuyển khoản mới cần duyệt!`);
          } else if (newTickets.length > prevSupportCountRef.current) {
            playChime("support");
            const newest = newTickets[0];
            showToast(`💬 Yêu cầu hỗ trợ mới từ ${newest.user.email}: "${newest.subject}"`);
          }
        }

        isFirstLoadRef.current = false;
        prevTransfersCountRef.current = newTransfers.length;
        prevSupportCountRef.current = newTickets.length;

        setTransfers(newTransfers);
        setSupportTickets(newTickets);
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Poll every 5 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleApproveTransfer = async (reqItem: PendingTransferRequest) => {
    if (!confirm(`Xác nhận duyệt chuyển khoản và NÂNG CẤP ngay gói [${reqItem.planName}] cho khách hàng ${reqItem.user.email}?`)) {
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
        playChime("success");
        showToast(`🎉 Đã duyệt và kích hoạt gói ${reqItem.planName} cho ${reqItem.user.email}!`);
        setTransfers((prev) => prev.filter((r) => r.transactionId !== reqItem.transactionId));
        prevTransfersCountRef.current = Math.max(0, prevTransfersCountRef.current - 1);
      } else {
        alert(json.error || "Không thể duyệt giao dịch");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectTransfer = async (reqItem: PendingTransferRequest) => {
    const reason = prompt("Nhập lý do từ chối (tuỳ chọn):", "Chưa nhận được số tiền chuyển khoản hoặc sai cú pháp");
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
        showToast(`Đã từ chối giao dịch ${reqItem.transactionId}`);
        setTransfers((prev) => prev.filter((r) => r.transactionId !== reqItem.transactionId));
        prevTransfersCountRef.current = Math.max(0, prevTransfersCountRef.current - 1);
      } else {
        alert(json.error || "Không thể từ chối");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkTicketInProgress = async (ticketId: string) => {
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          newStatus: "in_progress",
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("✓ Đã tiếp nhận xử lý! Khách hàng sẽ thấy trạng thái 'Admin đang xử lý'.");
        setSupportTickets((prev) => prev.filter((t) => t.id !== ticketId));
        prevSupportCountRef.current = Math.max(0, prevSupportCountRef.current - 1);
        fetchNotifications(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkTicketResolved = async (ticketId: string) => {
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          newStatus: "resolved",
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("✓ Đã giải quyết xong! Khách hàng sẽ thấy trạng thái 'Đã giải quyết'.");
        setSupportTickets((prev) => prev.filter((t) => t.id !== ticketId));
        prevSupportCountRef.current = Math.max(0, prevSupportCountRef.current - 1);
        fetchNotifications(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxn(id);
    setTimeout(() => setCopiedTxn(null), 2000);
  };

  const totalCount = transfers.length + supportTickets.length;

  return (
    <div className="relative">
      {/* BELL TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800 transition text-neutral-300 hover:text-white"
        title="Trung tâm thông báo Admin (Chuyển khoản & Hỗ trợ)"
      >
        <div className="relative">
          <Bell className={`w-4 h-4 ${totalCount > 0 ? "text-amber-400" : "text-neutral-400"}`} />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">
                {totalCount}
              </span>
            </span>
          )}
        </div>
        <span className="text-xs font-semibold hidden sm:inline">
          {totalCount > 0 ? (
            <span className="text-amber-400 font-bold">{totalCount} thông báo mới</span>
          ) : (
            <span className="text-neutral-400">Thông báo</span>
          )}
        </span>
      </button>

      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm bg-neutral-900/95 border border-amber-500/40 shadow-2xl shadow-amber-500/20 backdrop-blur-md text-white p-3.5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium leading-relaxed">{toastMessage}</div>
        </div>
      )}

      {/* DROPDOWN NOTIFICATION PANEL */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-3 w-[92vw] sm:w-[500px] max-w-[520px] z-50 bg-[#0e0e15] border border-neutral-800/90 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Trung Tâm Thông Báo Quản Trị
                    {totalCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {totalCount} cần xử lý
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Chuyển khoản VietQR & Yêu cầu hỗ trợ khách hàng thời gian thực
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fetchNotifications()}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                  title="Tải lại thông báo"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="px-4 pt-2.5 pb-2 bg-neutral-950/60 border-b border-neutral-800 flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTab === "all"
                    ? "bg-neutral-800 text-white border border-neutral-700"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Tất cả ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transfers")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTab === "transfers"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Chuyển khoản ({transfers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("support")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTab === "support"
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Hỗ trợ ({supportTickets.length})</span>
              </button>
            </div>

            {/* Content List */}
            <div className="p-3 overflow-y-auto space-y-3 divide-y divide-neutral-800/40">
              {/* Empty state */}
              {totalCount === 0 && (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/40" />
                  <div className="text-xs font-semibold text-neutral-300">
                    Không có thông báo hoặc yêu cầu nào đang chờ xử lý
                  </div>
                  <div className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                    Mọi chuyển khoản VietQR và yêu cầu hỗ trợ mới từ khách hàng sẽ tự động thông báo tại đây.
                  </div>
                </div>
              )}

              {/* SECTION: SUPPORT TICKETS */}
              {(activeTab === "all" || activeTab === "support") &&
                supportTickets.map((st) => (
                  <div
                    key={st.id}
                    className="pt-3 first:pt-0 space-y-2.5 bg-neutral-900/40 border border-sky-500/20 rounded-xl p-3 hover:border-sky-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                          <span className="font-bold text-xs text-white">
                            {st.user.fullName || st.user.email}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {st.user.planName}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          {st.user.email}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {st.ticketNumber}
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {new Date(st.updatedAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Subject & Preview */}
                    <div className="bg-black/50 rounded-lg p-2 text-[11px] space-y-1 border border-neutral-800">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-sky-400" />
                        <span>{st.subject}</span>
                      </div>
                      {st.lastMessage && (
                        <p className="text-neutral-400 line-clamp-2 italic text-[11px]">
                          "{st.lastMessage.text}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.priority === "urgent"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : st.priority === "high"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-neutral-800 text-neutral-400"
                      }`}>
                        Ưu tiên: {st.priority === "urgent" ? "Khẩn cấp" : st.priority === "high" ? "Cao" : "Bình thường"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMarkTicketInProgress(st.id)}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-[11px] font-semibold transition"
                          title="Đánh dấu đang xử lý (khách hàng sẽ thấy và thông báo sẽ ẩn)"
                        >
                          Đang xử lý
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkTicketResolved(st.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-semibold transition"
                          title="Đánh dấu đã giải quyết xong"
                        >
                          Đã xong
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            router.push("/admin/support");
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500 text-black font-bold text-[11px] hover:bg-sky-400 transition shadow-md shadow-sky-500/20"
                        >
                          <span>Xem</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {/* SECTION: BANK TRANSFERS */}
              {(activeTab === "all" || activeTab === "transfers") &&
                transfers.map((req) => {
                  const isProcessing = processingId === req.transactionId;
                  const isCustomerNotified = req.status === "processing";

                  return (
                    <div
                      key={req.id}
                      className="pt-3 first:pt-0 space-y-2.5 bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-3 hover:border-neutral-700 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">
                              {req.user.fullName || req.user.email}
                            </span>
                            {isCustomerNotified && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                Khách đã báo chuyển
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {req.user.email}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-emerald-400">
                            {req.amount.toLocaleString("vi-VN")} {req.currency || "VNĐ"}
                          </div>
                          <span className="inline-block text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {req.planName}
                          </span>
                        </div>
                      </div>

                      <div className="bg-black/50 rounded-lg p-2 text-[11px] space-y-1.5 border border-neutral-800">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span>Nội dung chuyển khoản:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(req.transferContent, req.id)}
                            className="flex items-center gap-1 font-mono font-bold text-amber-400 hover:text-amber-300"
                          >
                            <span>{req.transferContent}</span>
                            {copiedTxn === req.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-neutral-500" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-neutral-400">
                          <span>Thời gian yêu cầu:</span>
                          <span className="text-neutral-300">
                            {new Date(req.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleRejectTransfer(req)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-lg border border-neutral-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-semibold transition disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveTransfer(req)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isProcessing ? "Đang xử lý..." : "Phê duyệt & Nâng cấp ngay"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-neutral-900/60 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
              <Link
                href="/admin/support"
                onClick={() => setIsOpen(false)}
                className="hover:text-amber-400 transition flex items-center gap-1 font-semibold"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Mở Trung Tâm Hỗ Trợ Đầy Đủ</span>
              </Link>
              <span className="font-semibold text-neutral-300">Real-time: ON</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
