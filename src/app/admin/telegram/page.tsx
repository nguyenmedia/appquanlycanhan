"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bell,
  CreditCard,
  LifeBuoy,
  UserPlus,
  ShieldCheck,
  Zap,
  ExternalLink,
} from "lucide-react";

export default function AdminTelegramPage() {
  const [loading, setLoading] = useState(true);
  const [telegramInfo, setTelegramInfo] = useState<any>(null);
  const [testMessage, setTestMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/telegram");
      const data = await res.json();
      if (data.success) {
        setTelegramInfo(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "test",
          message: testMessage || "Kiểm tra kết nối Bot Telegram tự động thành công 100%!",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: "Tin nhắn đã được gửi đến Telegram thành công!" });
        setTestMessage("");
      } else {
        setStatusMessage({ type: "error", text: data.error || "Gửi tin nhắn thất bại" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Lỗi kết nối máy chủ" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-400" />
              <span>Cấu Hình & Trạng Thái Telegram Bot</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold">
              Live Alert 24/7
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Tự động thông báo tức thời mọi giao dịch thanh toán, yêu cầu hỗ trợ khách hàng và đăng ký mới về Telegram Bot.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
          <span>Làm mới trạng thái</span>
        </button>
      </div>

      {/* Bot Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className="p-5 rounded-2xl bg-[#0e0e16] border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Trạng Thái Kết Nối</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white">
                {telegramInfo?.connected ? "ĐANG HOẠT ĐỘNG" : "ĐANG KIỂM TRA"}
              </div>
              <div className="text-xs text-emerald-400 font-medium">Telegram API Connected</div>
            </div>
          </div>
        </div>

        {/* Bot Info */}
        <div className="p-5 rounded-2xl bg-[#0e0e16] border border-neutral-800/80 space-y-3">
          <span className="text-xs font-semibold text-neutral-400">Tên Bot Tiếp Nhận</span>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-sky-400">
                @{telegramInfo?.botInfo?.username || "appquanlycanhan_bot"}
              </div>
              <div className="text-xs text-neutral-400">
                {telegramInfo?.botInfo?.first_name || "appquanlycanhan"}
              </div>
            </div>
            <a
              href={`https://t.me/${telegramInfo?.botInfo?.username || "appquanlycanhan_bot"}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition"
              title="Mở trong Telegram"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Target Chat ID */}
        <div className="p-5 rounded-2xl bg-[#0e0e16] border border-neutral-800/80 space-y-3">
          <span className="text-xs font-semibold text-neutral-400">Chat ID Quản Trị Viên</span>
          <div>
            <div className="text-base font-bold font-mono text-amber-400">
              {telegramInfo?.chatId || "8093505246"}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">Nhận thông báo tự động</div>
          </div>
        </div>
      </div>

      {/* Events Dispatched Grid */}
      <div className="p-6 rounded-3xl bg-[#0e0e16] border border-neutral-800/80 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Danh Sách Sự Kiện Tự Động Gửi Về Telegram</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Khách Báo Chuyển Khoản VietQR</div>
              <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                Khi khách hàng quét mã VietQR và bấm "Tôi đã chuyển khoản", bot gửi ngay số tiền, mã nạp và email khách để Admin kiểm tra.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Giao Dịch Thành Công & Kích Hoạt Pro</div>
              <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                Tự động thông báo khi Admin duyệt nạp tiền hoặc khi Webhook SePay / VNPay / MoMo đối soát thành công.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Yêu Cầu Hỗ Trợ Khách Hàng (Support Desk)</div>
              <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                Báo tức thời khi khách hàng tạo ticket hỗ trợ mới hoặc gửi thêm tin nhắn phản hồi trong cuộc trò chuyện 1:1.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Thành Viên Mới Đăng Ký</div>
              <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                Thông báo ngay họ tên, email thành viên khi có người đăng ký tài khoản mới trên hệ thống LifeOS.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Test Notification Form */}
      <div className="p-6 rounded-3xl bg-[#0e0e16] border border-neutral-800/80 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white">Gửi Thử Nghiệm Tin Nhắn Tới Telegram</h3>
        </div>
        <p className="text-xs text-neutral-400">
          Bạn có thể nhập nội dung tùy ý để kiểm tra tốc độ phản hồi thực tế của Telegram Bot.
        </p>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSendTest} className="space-y-3">
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            rows={3}
            placeholder="Nhập nội dung tin nhắn thử nghiệm (ví dụ: Hệ thống LifeOS đang hoạt động rất tốt!)..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-sky-500/60 transition"
          />

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang gửi đến Telegram...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gửi Tin Nhắn Test Ngay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
