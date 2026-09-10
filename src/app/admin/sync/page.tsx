"use client";

import React, { useState, useEffect } from "react";
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  Database,
  ShieldCheck,
  Zap,
  Server,
  Users,
  CreditCard,
  CheckSquare,
  Activity,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function AdminSyncPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sync");
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upload_all" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("🎉 Đã tải lên và đồng bộ 100% dữ liệu sang Supabase Cloud thành công!");
        if (json.stats) setStats(json.stats);
        else fetchStats();
      } else {
        alert(json.error || "Lỗi đồng bộ");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSyncing(false);
    }
  };

  const tables = stats?.tables || {};
  const tableKeys = Object.keys(tables);

  const tableLabels: Record<string, { label: string; icon: any }> = {
    users: { label: "Tài khoản người dùng (Users)", icon: Users },
    user_profiles: { label: "Hồ sơ cá nhân (Profiles)", icon: Users },
    plans: { label: "Gói cước dịch vụ (Plans)", icon: CreditCard },
    coupons: { label: "Mã giảm giá (Coupons)", icon: CreditCard },
    subscriptions: { label: "Gói đăng ký VIP (Subscriptions)", icon: Sparkles },
    payment_transactions: { label: "Lịch sử thanh toán (Payments)", icon: CreditCard },
    tasks: { label: "Công việc (Tasks)", icon: CheckSquare },
    habits: { label: "Thói quen (Habits)", icon: Activity },
    goals: { label: "Mục tiêu (Goals)", icon: Zap },
    finance_transactions: { label: "Giao dịch tài chính (Finance)", icon: CreditCard },
    notes: { label: "Ghi chú (Notes)", icon: Database },
    journal_entries: { label: "Nhật ký sống (Journals)", icon: Database },
    health_logs: { label: "Sức khỏe (Health Logs)", icon: Activity },
    learning_items: { label: "Học tập (Learning Items)", icon: Database },
    system_settings: { label: "Cấu hình hệ thống (Settings)", icon: Server },
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Cloud className="w-6 h-6 text-sky-400" />
            <span>Trung Tâm Đồng Bộ Dữ Liệu Supabase Cloud</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Tải lên, đồng bộ hóa và quản trị dữ liệu đám mây PostgreSQL phân tách bảo mật theo từng User
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading || syncing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{syncing ? "Đang đồng bộ..." : "Tải Lên & Đồng Bộ Tất Cả Lên Supabase"}</span>
          </button>
        </div>
      </div>

      {/* CONNECTION STATUS BANNER */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">Trạng Thái Kết Nối Supabase Cloud:</span>
                {stats?.supabaseConnected ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đã kết nối (Online)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Chưa kết nối
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-400 font-mono mt-0.5">
                {stats?.supabaseUrl || "https://ajpsdqdzeuvykgbvmkea.supabase.co"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-neutral-500 block text-[10px] uppercase">Độ trễ (Latency)</span>
              <span className="font-mono font-bold text-emerald-400">{stats?.pingMs || 85} ms</span>
            </div>
            <div className="text-right pl-4 border-l border-neutral-800">
              <span className="text-neutral-500 block text-[10px] uppercase">Bảo mật phân tách</span>
              <span className="font-semibold text-indigo-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cô lập theo User ID</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-400 pt-1">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Đồng bộ đa thiết bị:</strong>
              <span>Khi người dùng đăng nhập trên điện thoại, máy tính bảng hay laptop, dữ liệu tự động đồng bộ từ Supabase Cloud.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Riêng biệt từng khách hàng:</strong>
              <span>Mọi bản ghi dữ liệu (công việc, tài chính, thói quen,...) đều gắn chặt với <code>user_id</code> riêng, tuyệt đối không bị lẫn lộn.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Thời gian thực (Real-time):</strong>
              <span>Tự động cập nhật tức thì khi có thay đổi dữ liệu hoặc chuyển khoản nâng cấp tài khoản.</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SYNC STATUS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Chi Tiết Dữ Liệu Các Bảng Trên Hệ Thống (Table Status)</span>
          </h2>
          <span className="text-xs text-neutral-400">
            {tableKeys.length} Bảng dữ liệu đã sẵn sàng
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tableKeys.map((key) => {
            const item = tables[key];
            const meta = tableLabels[key] || { label: key, icon: Database };
            const Icon = meta.icon;
            const isSynced = item.localCount === item.supabaseCount;

            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-xs text-white truncate max-w-[170px]">
                      {meta.label}
                    </span>
                  </div>

                  {isSynced ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Đồng bộ 100%
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Cần đồng bộ
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase">Máy chủ cục bộ</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {item.localCount} <span className="text-[10px] font-normal text-neutral-400">dòng</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 block uppercase">Supabase Cloud</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {item.supabaseCount} <span className="text-[10px] font-normal text-neutral-400">dòng</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
