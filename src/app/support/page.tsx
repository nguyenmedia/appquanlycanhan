"use client";

import React, { useState, useEffect, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  User,
  Sparkles,
} from "lucide-react";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const selectedTicketRef = useRef<any>(null);
  selectedTicketRef.current = selectedTicket;

  const loadTickets = async () => {
    try {
      const res = await fetch("/api/support");
      const json = await res.json();
      if (json.success) {
        setTickets(json.tickets);
        const current = selectedTicketRef.current;
        if (json.tickets.length > 0) {
          if (!current) {
            setSelectedTicket(json.tickets[0]);
          } else {
            const refreshed = json.tickets.find((t: any) => t.id === current.id);
            if (refreshed) setSelectedTicket(refreshed);
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

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_ticket",
          subject,
          category,
          priority,
          message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubject("");
        setMessage("");
        setIsNewModalOpen(false);
        showToast("🎉 Đã gửi yêu cầu hỗ trợ! Quản trị viên đã nhận được thông báo và sẽ phản hồi sớm.");
        await loadTickets();
        if (json.ticket) setSelectedTicket(json.ticket);
      } else {
        alert(json.error || "Lỗi tạo ticket");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          ticketId: selectedTicket.id,
          message: replyMessage.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyMessage("");
        showToast("💬 Đã gửi câu trả lời đến Quản trị viên!");
        await loadTickets();
      } else {
        alert(json.error || "Lỗi gửi phản hồi");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    }
  };

  return (
    <AppShell>
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <LifeBuoy className="w-6 h-6 text-indigo-400" />
              <span>Trung Tâm Hỗ Trợ Khách Hàng (Support Center)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kênh hỗ trợ bảo mật 1:1 giữa bạn và Quản trị viên LifeOS. Mọi yêu cầu được phản hồi nhanh chóng.
            </p>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Gửi yêu cầu hỗ trợ mới</span>
          </button>
        </div>

        {/* TWO COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TICKET LIST COLUMN (1 Col) */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Danh Sách Yêu Cầu Của Bạn ({tickets.length})
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Riêng tư 1:1
              </span>
            </div>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {tickets.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500 space-y-2">
                  <LifeBuoy className="w-8 h-8 text-neutral-700 mx-auto" />
                  <p>Bạn chưa có yêu cầu hỗ trợ nào.</p>
                  <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="text-indigo-400 hover:underline text-xs"
                  >
                    Tạo yêu cầu đầu tiên ngay
                  </button>
                </div>
              ) : (
                tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition ${
                      selectedTicket?.id === t.id
                        ? "bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10"
                        : "bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">
                        #{t.ticketNumber}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          t.status === "open"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : t.status === "in_progress"
                            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                            : t.status === "resolved"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        }`}
                      >
                        {t.status === "open"
                          ? "Đang chờ Admin"
                          : t.status === "in_progress"
                          ? "Đang xử lý"
                          : t.status === "resolved"
                          ? "Đã giải quyết"
                          : "Đã đóng"}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white truncate">{t.subject}</h4>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2">
                      <span className="uppercase">{t.category}</span>
                      <span>
                        {new Date(t.updatedAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* TICKET THREAD COLUMN (2 Cols) */}
          <div className="lg:col-span-2 rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between min-h-[580px]">
            {selectedTicket ? (
              <>
                <div>
                  {/* Ticket Header */}
                  <div className="pb-4 border-b border-neutral-800 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400 font-bold">
                          #{selectedTicket.ticketNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            selectedTicket.status === "open"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : selectedTicket.status === "in_progress"
                              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                              : selectedTicket.status === "resolved"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}
                        >
                          {selectedTicket.status === "open"
                            ? "Đang chờ phản hồi"
                            : selectedTicket.status === "in_progress"
                            ? "Admin đang xử lý"
                            : selectedTicket.status === "resolved"
                            ? "Đã giải quyết"
                            : "Đã đóng"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">
                        {selectedTicket.subject}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {selectedTicket.category}
                      </span>
                    </div>
                  </div>

                  {/* REAL-TIME PROGRESS STATUS BANNER */}
                  <div className="mb-4 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        selectedTicket.status === 'open' ? 'bg-amber-400 animate-pulse' :
                        selectedTicket.status === 'in_progress' ? 'bg-sky-400 animate-ping' :
                        selectedTicket.status === 'resolved' ? 'bg-emerald-400' : 'bg-neutral-500'
                      }`} />
                      <div>
                        <span className="font-bold text-white block">
                          {selectedTicket.status === "open" && "Trạng thái: Đã tiếp nhận (Chờ Admin)"}
                          {selectedTicket.status === "in_progress" && "Trạng thái: Quản trị viên đang tích cực xử lý"}
                          {selectedTicket.status === "resolved" && "Trạng thái: Đã giải quyết hoàn tất"}
                          {selectedTicket.status === "closed" && "Trạng thái: Đã đóng"}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {selectedTicket.status === "open" && "Quản trị viên đã nhận thông báo và sẽ phản hồi sớm nhất."}
                          {selectedTicket.status === "in_progress" && "Admin đang kiểm tra dữ liệu và hỗ trợ giải quyết sự cố cho bạn."}
                          {selectedTicket.status === "resolved" && "Vấn đề đã được khắc phục hoàn tất. Bạn có thể gửi tin nhắn nếu còn thắc mắc."}
                          {selectedTicket.status === "closed" && "Yêu cầu hỗ trợ đã hoàn thành."}
                        </span>
                      </div>
                    </div>
                    <span className={`self-start sm:self-center px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase whitespace-nowrap ${
                      selectedTicket.status === "open"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : selectedTicket.status === "in_progress"
                        ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                        : selectedTicket.status === "resolved"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-neutral-800 text-neutral-400"
                    }`}>
                      {selectedTicket.status === "open" ? "Đang chờ Admin" : selectedTicket.status === "in_progress" ? "Admin đang xử lý" : selectedTicket.status === "resolved" ? "Đã giải quyết" : "Đã đóng"}
                    </span>
                  </div>

                  {/* PRIVACY GUARANTEE BANNER */}
                  <div className="mb-4 p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-[11px] text-neutral-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Bảo mật riêng tư 1:1:</strong> Yêu cầu này chỉ hiển thị duy nhất giữa bạn và Ban Quản Trị LifeOS. Các thành viên khác tuyệt đối không thể xem.
                    </span>
                  </div>

                  {/* Messages Thread */}
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                    {selectedTicket.messages?.map((msg: any) => {
                      const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT"].includes(msg.senderRole);

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isStaff ? "items-start" : "items-end"} space-y-1`}
                        >
                          {/* Sender label header */}
                          <div className="flex items-center gap-1.5 text-[11px] px-1">
                            {isStaff ? (
                              <>
                                <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                                  A
                                </div>
                                <span className="font-bold text-amber-300 flex items-center gap-1">
                                  <span>Hỗ Trợ Viên LifeOS (Admin)</span>
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 inline" />
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                  • {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-[10px] text-neutral-500">
                                  {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })} •
                                </span>
                                <span className="font-bold text-indigo-300">Bạn</span>
                                <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                                  U
                                </div>
                              </>
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-lg ${
                              isStaff
                                ? "bg-[#14141e] border border-amber-500/30 text-neutral-100 rounded-tl-sm shadow-md"
                                : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-normal rounded-tr-sm shadow-lg shadow-indigo-600/20"
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Reply Box */}
                <form onSubmit={handleReply} className="pt-4 border-t border-neutral-800 flex gap-2 mt-4">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Nhập câu trả lời hoặc gửi thêm thông tin cho Admin..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-neutral-500 text-xs py-20">
                <MessageSquare className="w-10 h-10 mb-3 opacity-40 text-indigo-400" />
                <span className="font-semibold text-neutral-300">Không có ticket nào được chọn</span>
                <span className="text-[11px] text-neutral-500 mt-1">
                  Chọn một ticket từ danh sách bên trái hoặc tạo yêu cầu hỗ trợ mới
                </span>
              </div>
            )}
          </div>
        </div>

        {/* MODAL NEW TICKET */}
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-indigo-400" />
                  <span>Gửi Yêu Cầu Hỗ Trợ Mới</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-neutral-400">
                Quản trị viên sẽ nhận được thông báo ngay tức thì và phản hồi cho bạn qua khung chat này.
              </p>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Tiêu đề yêu cầu
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ví dụ: Hỏi về kích hoạt gói Pro, Lỗi tính năng Pomodoro..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Chủ đề</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="general">Chung (General)</option>
                      <option value="billing">Thanh toán & Gói cước</option>
                      <option value="technical">Kỹ thuật & Lỗi hệ thống</option>
                      <option value="feature_request">Góp ý tính năng mới</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Mức độ ưu tiên</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="low">Bình thường (Low)</option>
                      <option value="medium">Cần hỗ trợ sớm (Medium)</option>
                      <option value="high">Ưu tiên cao (High)</option>
                      <option value="urgent">Khẩn cấp (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Nội dung chi tiết câu hỏi
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mô tả chi tiết câu hỏi, thắc mắc hoặc lỗi bạn gặp phải..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {submitting ? "Đang gửi..." : "Gửi yêu cầu ngay"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
