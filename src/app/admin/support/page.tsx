"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Plus,
  Filter,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState("in_progress");
  const [newPriority, setNewPriority] = useState("medium");
  const [statusFilter, setStatusFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New Ticket Modal
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newTicketPriority, setNewTicketPriority] = useState("medium");
  const [newFirstMsg, setNewFirstMsg] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const selectedTicketRef = useRef<any>(null);
  selectedTicketRef.current = selectedTicket;

  const loadTickets = async () => {
    try {
      const res = await fetch("/api/admin/support");
      const json = await res.json();
      if (json.success) {
        setTickets(json.tickets);
        const current = selectedTicketRef.current;
        if (json.tickets.length > 0) {
          if (!current) {
            setSelectedTicket(json.tickets[0]);
            setNewStatus(json.tickets[0].status);
            setNewPriority(json.tickets[0].priority || "medium");
          } else {
            const refreshed = json.tickets.find((t: any) => t.id === current.id);
            if (refreshed) {
              setSelectedTicket(refreshed);
              setNewStatus(refreshed.status);
              setNewPriority(refreshed.priority || "medium");
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    setNewStatus(status);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          newStatus: status,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await loadTickets();
      }
    } catch (e) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: replyMessage.trim() || undefined,
          newStatus,
          newPriority,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyMessage("");
        await loadTickets();
      }
    } catch (e) {
      alert("Lỗi phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newFirstMsg) return;
    setCreateLoading(true);

    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_ticket",
          subject: newSubject,
          category: newCategory,
          priority: newTicketPriority,
          message: newFirstMsg,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowNewTicketModal(false);
        setNewSubject("");
        setNewFirstMsg("");
        loadTickets();
      } else {
        alert(json.error || "Lỗi tạo ticket");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setCreateLoading(false);
    }
  };

  const quickReplies = [
    "Chào bạn, chúng tôi đã tiếp nhận yêu cầu và đang tiến hành xử lý ngay.",
    "Lỗi đã được đội ngũ kỹ thuật khắc phục hoàn tất. Bạn vui lòng tải lại trang và kiểm tra nhé.",
    "Để đối soát giao dịch, bạn vui lòng cung cấp mã đơn hàng hoặc ảnh chụp chuyển khoản giúp chúng tôi.",
    "Cảm ơn bạn đã đóng góp ý kiến! Tính năng này đã được ghi nhận vào lộ trình nâng cấp tiếp theo.",
  ];

  const filteredTickets = statusFilter ? tickets.filter((t) => t.status === statusFilter) : tickets;

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case "urgent": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "high": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "medium": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <LifeBuoy className="w-6 h-6 text-amber-400" />
            <span>Trung Tâm Hỗ Trợ Khách Hàng (Support Desk)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Tiếp nhận yêu cầu kỹ thuật, giải đáp thắc mắc thanh toán và phản hồi trực tiếp với người dùng
          </p>
        </div>

        <button
          onClick={() => setShowNewTicketModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo phiếu hỗ trợ mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 1 COL: TICKETS LIST */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-3 flex flex-col h-[700px]">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="font-bold text-xs text-white">Danh sách yêu cầu ({filteredTickets.length})</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-neutral-400"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="open">Đang mở (Open)</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="py-16 text-center text-xs text-neutral-500">
                Không có ticket nào.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicket(t);
                      setNewStatus(t.status);
                      setNewPriority(t.priority || "medium");
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 shadow-md"
                        : "bg-neutral-950/70 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{t.subject}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase font-mono ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                      <span>{t.user?.profile?.fullName || t.user?.email}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">#{t.ticketNumber}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500">
                      <span>{t.messages?.length || 0} tin nhắn</span>
                      <span className={`font-semibold uppercase ${
                        t.status === "resolved" ? "text-emerald-400" :
                        t.status === "in_progress" ? "text-indigo-400" : "text-amber-400"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT 2 COLS: CHAT & TICKET MANAGEMENT */}
        <div className="lg:col-span-2 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 flex flex-col h-[700px] justify-between">
          {selectedTicket ? (
            <>
              {/* Ticket Top Bar */}
              <div className="pb-4 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 font-bold">#{selectedTicket.ticketNumber}</span>
                    <h3 className="font-bold text-white text-base">{selectedTicket.subject}</h3>
                  </div>
                  <span className="text-xs text-neutral-400">
                    Khách hàng: <strong className="text-neutral-200">{selectedTicket.user?.profile?.fullName}</strong> ({selectedTicket.user?.email})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-neutral-300 font-semibold"
                  >
                    <option value="low">Mức thấp (Low)</option>
                    <option value="medium">Mức vừa (Medium)</option>
                    <option value="high">Mức cao (High)</option>
                    <option value="urgent">Khẩn cấp (Urgent)</option>
                  </select>

                  <select
                    value={newStatus}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-neutral-300 font-semibold focus:border-amber-500 focus:outline-none"
                    title="Thay đổi trạng thái và cập nhật ngay cho khách hàng"
                  >
                    <option value="open">Đang mở (Open)</option>
                    <option value="in_progress">Đang xử lý (In Progress)</option>
                    <option value="resolved">Đã giải quyết (Resolved)</option>
                    <option value="closed">Đã đóng (Closed)</option>
                  </select>

                  {newStatus === "open" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("in_progress")}
                      className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 font-bold text-xs transition whitespace-nowrap"
                    >
                      ⚡ Đang xử lý
                    </button>
                  )}

                  {newStatus === "in_progress" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("resolved")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold text-xs transition whitespace-nowrap"
                    >
                      ✓ Giải quyết
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
                {selectedTicket.messages?.map((m: any) => {
                  const isAdmin = ["ADMIN", "SUPER_ADMIN", "SUPPORT"].includes(m.senderRole);
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-neutral-500">
                        <span>{isAdmin ? "Hỗ trợ viên LifeOS" : selectedTicket.user?.email}</span>
                        <span>•</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString("vi-VN")}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                          isAdmin
                            ? "bg-amber-500 text-black font-medium shadow-md shadow-amber-500/10"
                            : "bg-neutral-800/90 text-neutral-100 border border-neutral-700/60"
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Pills & Send Form */}
              <div className="pt-3 border-t border-neutral-800 space-y-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-neutral-400">
                  <span className="font-semibold text-neutral-500 whitespace-nowrap">Mẫu trả lời:</span>
                  {quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyMessage(qr)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 whitespace-nowrap transition"
                    >
                      {qr.substring(0, 24)}...
                    </button>
                  ))}
                </div>

                <form onSubmit={handleReply} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Nhập nội dung phản hồi cho khách hàng..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="py-32 text-center text-xs text-neutral-500">
              Chọn một yêu cầu bên trái để xem nội dung trao đổi.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: NEW TICKET */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateTicket} className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Tạo Phiếu Hỗ Trợ Mới</span>
              </h3>
              <button type="button" onClick={() => setShowNewTicketModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Chủ đề yêu cầu *</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ví dụ: Lỗi thanh toán VNPay, Đề xuất tính năng Pomodoro..."
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Phân loại</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="general">Chung (General)</option>
                    <option value="billing">Thanh toán (Billing)</option>
                    <option value="technical">Kỹ thuật (Technical)</option>
                    <option value="feature">Đề xuất tính năng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="low">Thấp (Low)</option>
                    <option value="medium">Vừa (Medium)</option>
                    <option value="high">Cao (High)</option>
                    <option value="urgent">Khẩn cấp (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Nội dung ban đầu *</label>
                <textarea
                  rows={3}
                  value={newFirstMsg}
                  onChange={(e) => setNewFirstMsg(e.target.value)}
                  placeholder="Mô tả sự cố hoặc yêu cầu cần hỗ trợ..."
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
              >
                {createLoading ? "Đang tạo..." : "Xác nhận tạo ticket"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
