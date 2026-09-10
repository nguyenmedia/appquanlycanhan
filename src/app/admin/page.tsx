"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  TrendingUp,
  Brain,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
  LifeBuoy,
  Plus,
  RefreshCw,
  Bell,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Server,
  Radio,
  Zap,
  MessageSquare,
} from "lucide-react";
import PendingTransfersManager from "@/components/admin/PendingTransfersManager";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [simProvider, setSimProvider] = useState("vnpay");
  const [simAmount, setSimAmount] = useState(199000);
  const [simLoading, setSimLoading] = useState(false);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastPriority, setBroadcastPriority] = useState("info");
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSimulatePayment = async () => {
    setSimLoading(true);
    try {
      const res = await fetch("/api/admin/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate_transaction",
          provider: simProvider,
          amount: simAmount,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã mô phỏng thanh toán +${simAmount.toLocaleString("vi-VN")}đ thành công!`);
        setShowSimulateModal(false);
        fetchMetrics();
      } else {
        alert(json.error || "Lỗi mô phỏng");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setSimLoading(false);
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    setBroadcastLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMsg,
          priority: broadcastPriority,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Đã phát thông báo toàn hệ thống thành công!");
        setBroadcastTitle("");
        setBroadcastMsg("");
        setShowBroadcastModal(false);
        fetchMetrics();
      } else {
        alert(json.error || "Lỗi phát thông báo");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setBroadcastLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data?.recentTransactions || data.recentTransactions.length === 0) {
      alert("Chưa có dữ liệu giao dịch để xuất");
      return;
    }
    const headers = "ID,Provider,Amount,Status,Order_ID,Paid_At\n";
    const rows = data.recentTransactions
      .map((t: any) => `"${t.id}","${t.provider}",${t.amount},"${t.status}","${t.idempotencyKey}","${t.paidAt || t.createdAt}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LifeOS_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã xuất file báo cáo CSV!");
  };

  const metrics = data?.metrics || {
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    premiumUsers: 0,
    paidUsers: 0,
    mrr: 0,
    arr: 0,
    totalRevenue: 0,
    conversionRate: 0,
    churnRate: 1.8,
    openTickets: 0,
    ai: { totalCreditsUsed: 0, totalTokens: 0, estimatedCostUsd: 0 },
  };

  const txns = data?.recentTransactions || [];
  const auditLogs = data?.recentAuditLogs || [];
  const gateways = data?.gateways || [];

  const freePct = metrics.totalUsers > 0 ? Math.round((metrics.freeUsers / metrics.totalUsers) * 100) : 0;
  const proPct = metrics.totalUsers > 0 ? Math.round((metrics.proUsers / metrics.totalUsers) * 100) : 0;
  const premiumPct = metrics.totalUsers > 0 ? Math.round((metrics.premiumUsers / metrics.totalUsers) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER WITH ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>Bảng Điều Khiển Kinh Doanh SaaS (Executive Dashboard)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Theo dõi doanh thu định kỳ hàng tháng (MRR), đối soát cổng thanh toán và quản trị vận hành
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchMetrics();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition shadow-lg shadow-emerald-500/10"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Mô phỏng thanh toán</span>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Phát thông báo</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* REVENUE KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Doanh thu hàng tháng (MRR)</span>
            <span className="text-emerald-400 font-semibold">+12% MoM</span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics.mrr.toLocaleString("vi-VN")}đ
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">
            ARR ước tính: {metrics.arr.toLocaleString("vi-VN")}đ
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Tổng người dùng</span>
            <span className="text-indigo-400 font-semibold">{metrics.paidUsers} trả phí</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics.totalUsers}</div>
          <div className="text-[11px] text-neutral-500 mt-2">
            Free: {metrics.freeUsers} • Pro: {metrics.proUsers} • Premium: {metrics.premiumUsers}
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Tỷ lệ chuyển đổi (Free → Paid)</span>
            <span className="text-emerald-400 font-semibold">Tốt</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{metrics.conversionRate}%</div>
          <div className="text-[11px] text-neutral-500 mt-2">
            Tỷ lệ rời bỏ (Churn Rate): {metrics.churnRate}%
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-pink-400" />
              Chi phí AI API
            </span>
            <span className="text-pink-400 font-semibold font-mono">${metrics.ai.estimatedCostUsd}</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {metrics.ai.totalCreditsUsed} credits
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">
            Đã xử lý {metrics.ai.totalTokens.toLocaleString()} tokens
          </div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: TRANSACTIONS & PLAN BREAKDOWN */}
        <div className="lg:col-span-2 space-y-6">
          {/* SAAS PLAN BREAKDOWN PROGRESS */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Cơ Cấu Người Dùng Theo Gói Dịch Vụ</span>
              </h3>
              <span className="text-xs text-neutral-400">
                Tổng cộng: <strong className="text-white">{metrics.totalUsers}</strong> thành viên
              </span>
            </div>

            {/* Combined Bar */}
            <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${freePct}%` }} className="bg-neutral-600 transition-all duration-500" title={`Free: ${freePct}%`} />
              <div style={{ width: `${proPct}%` }} className="bg-amber-500 transition-all duration-500" title={`Pro: ${proPct}%`} />
              <div style={{ width: `${premiumPct}%` }} className="bg-indigo-500 transition-all duration-500" title={`Premium: ${premiumPct}%`} />
            </div>

            {/* Plan breakdown cards */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
                  <span>Free Member</span>
                </div>
                <div className="text-lg font-bold text-white">{metrics.freeUsers}</div>
                <div className="text-[10px] text-neutral-500">{freePct}% tổng số</div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950 border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>LifeOS Pro</span>
                </div>
                <div className="text-lg font-bold text-white">{metrics.proUsers}</div>
                <div className="text-[10px] text-neutral-500">{proPct}% • 199.000đ/tháng</div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950 border border-indigo-500/20">
                <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>LifeOS Premium</span>
                </div>
                <div className="text-lg font-bold text-white">{metrics.premiumUsers}</div>
                <div className="text-[10px] text-neutral-500">{premiumPct}% • 499.000đ/tháng</div>
              </div>
            </div>
          </div>

          {/* REAL-TIME PENDING BANK TRANSFER APPROVALS */}
          <PendingTransfersManager onCountChange={() => fetchMetrics()} />

          {/* RECENT TRANSACTIONS TABLE */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Giao dịch thanh toán gần đây (VNPay, MoMo, Stripe)</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Đối soát tự động thời gian thực với ngân hàng và ví điện tử
                </p>
              </div>

              <button
                onClick={() => setShowSimulateModal(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
              >
                + Thêm giao dịch test
              </button>
            </div>

            {txns.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
                <CreditCard className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                <p>Chưa có giao dịch nào được ghi nhận.</p>
                <button
                  onClick={() => setShowSimulateModal(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition"
                >
                  Tạo giao dịch mô phỏng ngay
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800/80 text-xs">
                {txns.map((t: any) => (
                  <div key={t.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-neutral-800/20 px-2 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <span className="font-semibold text-white font-mono">{t.idempotencyKey}</span>
                        <span className="block text-[11px] text-neutral-400">
                          Cổng: <strong className="text-neutral-200 uppercase">{t.provider}</strong> • ID đối tác: {t.providerTransactionId || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-400 text-sm">
                        +{t.amount.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="block text-[10px] text-neutral-500">
                        {new Date(t.paidAt || t.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 1 COL: INFRASTRUCTURE & RECENT AUDIT LOGS */}
        <div className="space-y-6">
          {/* CUSTOMER SUPPORT DESK WIDGET */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <LifeBuoy className="w-3.5 h-3.5 text-sky-400" />
                <span>Trung Tâm Hỗ Trợ Khách Hàng</span>
              </h3>
              <Link
                href="/admin/support"
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <span>Chi tiết</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Yêu cầu mở / Đang xử lý:</span>
                <span className="font-extrabold text-sky-400 font-mono">
                  {metrics.openTickets || 0} tickets
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Thông báo thời gian thực được kích hoạt tự động khi khách hàng gửi ticket mới.
              </p>
              <Link
                href="/admin/support"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-xs font-bold transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Mở hộp thư Support Desk</span>
              </Link>
            </div>
          </div>

          {/* GATEWAY HEALTH & INFRASTRUCTURE */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Trạng Thái Cổng & Hạ Tầng</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Khả dụng
              </span>
            </div>

            <div className="space-y-2 text-xs pt-1">
              {gateways.map((g: any) => (
                <div key={g.name} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-200">{g.name}</div>
                    <div className="text-[10px] text-neutral-500">{g.mode}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                      {g.status}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">{g.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADMIN AUDIT STREAM */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Nhật Ký Quản Trị (Audit Stream)</span>
              </h3>
              <span className="text-[10px] text-neutral-400">{auditLogs.length} ghi nhận</span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500">
                Chưa có thao tác quản trị nào.
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {auditLogs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-amber-400 font-mono">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Bởi: <span className="text-neutral-300 font-medium">{log.adminEmail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: SIMULATE PAYMENT */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span>Mô Phỏng Giao Dịch Thanh Toán</span>
              </h3>
              <button onClick={() => setShowSimulateModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-neutral-400">
              Kiểm tra tính năng đối soát tự động, tăng doanh thu thực tế và cập nhật KPI MRR mà không cần quẹt thẻ thật.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Cổng thanh toán</label>
                <select
                  value={simProvider}
                  onChange={(e) => setSimProvider(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="vnpay">VNPay Sandbox (QR / Thẻ ATM)</option>
                  <option value="momo">MoMo Sandbox (Ví điện tử)</option>
                  <option value="stripe">Stripe International (Visa/Master)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Số tiền thanh toán (VNĐ)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[199000, 499000, 1990000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSimAmount(amt)}
                      className={`py-2 rounded-xl font-bold border transition ${
                        simAmount === amt
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400"
                      }`}
                    >
                      {amt.toLocaleString("vi-VN")}đ
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={simLoading}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition"
              >
                {simLoading ? "Đang xử lý..." : "Xác nhận tạo giao dịch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST ANNOUNCEMENT */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleBroadcastAnnouncement} className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <span>Phát Thông Báo Toàn Hệ Thống (Broadcast)</span>
              </h3>
              <button type="button" onClick={() => setShowBroadcastModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-neutral-400">
              Thông báo này sẽ xuất hiện trên thanh thông báo đầu trang của tất cả người dùng đang sử dụng LifeOS.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Mức độ thông báo</label>
                <select
                  value={broadcastPriority}
                  onChange={(e) => setBroadcastPriority(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="info">ℹ️ Tin tức / Cập nhật tính năng (Info)</option>
                  <option value="promotion">🎉 Khuyến mãi / Flash Sale (Promotion)</option>
                  <option value="warning">⚠️ Bảo trì / Cảnh báo quan trọng (Warning)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Tiêu đề thông báo</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Ví dụ: Bảo trì máy chủ định kỳ vào 00:00 hoặc Ra mắt AI Life Coach..."
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Nội dung chi tiết</label>
                <textarea
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  rows={3}
                  placeholder="Nhập nội dung thông báo hiển thị cho khách hàng..."
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={broadcastLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
              >
                {broadcastLoading ? "Đang phát..." : "Phát thông báo ngay"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
