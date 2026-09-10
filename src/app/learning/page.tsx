"use client";

import React, { useState, useEffect, Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Book,
  Video,
  Trash2,
  CheckCircle2,
  Star,
  Timer,
  ExternalLink,
  BookOpen,
} from "lucide-react";

function LearningContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "books" | "courses">(
    queryTab === "books" ? "books" : queryTab === "courses" ? "courses" : "all"
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("book");
  const [author, setAuthor] = useState("");
  const [totalUnits, setTotalUnits] = useState("300");
  const [completedUnits, setCompletedUnits] = useState("0");
  const [unitType, setUnitType] = useState("trang");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (queryTab === "books" || queryTab === "courses" || queryTab === "all") {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const loadItems = async () => {
    try {
      const res = await fetch("/api/learning");
      const json = await res.json();
      if (json.success) setItems(json.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          author,
          totalUnits: Number(totalUnits) || 100,
          completedUnits: Number(completedUnits) || 0,
          unitType,
          notes,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setTitle("");
        setAuthor("");
        setNotes("");
        setIsModalOpen(false);
        loadItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProgress = async (id: string, newUnits: number, total: number) => {
    const nextUnits = Math.min(total, Math.max(0, newUnits));
    const status = nextUnits >= total ? "completed" : "reading";

    setItems(items.map((it) => (it.id === id ? { ...it, completedUnits: nextUnits, status } : it)));

    try {
      await fetch("/api/learning", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completedUnits: nextUnits, status }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa mục này?")) return;
    setItems(items.filter((it) => it.id !== id));
    try {
      await fetch(`/api/learning?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
              <span>Học Tập & Phát Triển (Learning Hub)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Theo dõi tiến độ sách đang đọc, khóa học kỹ năng và kết nối giờ học với Pomodoro
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sách / Khóa học</span>
          </button>
        </div>

        {/* SUB-TABS: ALL vs BOOKS vs COURSES */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "all" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Tất cả ({items.length})
            </button>
            <button
              onClick={() => setActiveTab("books")}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === "books" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tủ sách đang đọc ({items.filter((i) => i.type === "book").length})</span>
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === "courses" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>Khóa học & Kỹ năng ({items.filter((i) => i.type === "course").length})</span>
            </button>
          </div>
        </div>

        {/* ITEMS LIST */}
        {(activeTab === "books"
          ? items.filter((i) => i.type === "book")
          : activeTab === "courses"
          ? items.filter((i) => i.type === "course")
          : items
        ).length === 0 ? (
          <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
            <GraduationCap className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">
              {activeTab === "books"
                ? "Chưa có cuốn sách nào trong tủ sách"
                : activeTab === "courses"
                ? "Chưa có khóa học nào được lưu"
                : "Chưa có tài liệu học tập nào"}
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Lập danh sách những cuốn sách hay khóa học bạn muốn chinh phục trong năm nay.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow"
            >
              Thêm mục mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(activeTab === "books"
              ? items.filter((i) => i.type === "book")
              : activeTab === "courses"
              ? items.filter((i) => i.type === "course")
              : items
            ).map((item) => {
              const pct = item.totalUnits > 0 ? Math.round((item.completedUnits / item.totalUnits) * 100) : 0;
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 flex flex-col justify-between transition shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                        {item.status === "completed" && (
                          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            ✓ Đã hoàn thành
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-neutral-600 hover:text-rose-400 p-1"
                        title="Xóa mục này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-base text-white line-clamp-1">{item.title}</h4>
                    {item.author && (
                      <span className="block text-xs text-neutral-400 mb-3">{item.author}</span>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 my-4">
                      <div className="flex justify-between text-xs text-neutral-400 font-medium">
                        <span>
                          {item.completedUnits} / {item.totalUnits} {item.unitType}
                        </span>
                        <span className="text-white font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 100 ? "bg-emerald-500" : "bg-indigo-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-neutral-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 text-[11px]">Tiến độ nhanh:</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateProgress(item.id, item.completedUnits + 10, item.totalUnits)
                          }
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold transition"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateProgress(item.id, item.completedUnits + 25, item.totalUnits)
                          }
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-semibold transition"
                        >
                          +25
                        </button>
                        {item.completedUnits < item.totalUnits && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateProgress(item.id, item.totalUnits, item.totalUnits)
                            }
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-[11px] font-semibold transition"
                          >
                            Xong
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pomodoro Focus Link */}
                    <Link
                      href="/pomodoro"
                      className="w-full py-1.5 rounded-xl bg-orange-950/40 border border-orange-500/20 hover:bg-orange-900/40 text-orange-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>Bật Pomodoro tập trung học</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Thêm sách / Khóa học mới</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Atomic Habits, Thiết kế kiến trúc phần mềm..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Loại tài liệu</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="book">Sách (Book)</option>
                      <option value="course">Khóa học (Course)</option>
                      <option value="skill">Kỹ năng (Skill)</option>
                      <option value="article">Bài viết (Article)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Tác giả / Giảng viên</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="James Clear..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Tổng số đơn vị</label>
                    <input
                      type="number"
                      required
                      value={totalUnits}
                      onChange={(e) => setTotalUnits(e.target.value)}
                      placeholder="300"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Đơn vị đo lường</label>
                    <select
                      value={unitType}
                      onChange={(e) => setUnitType(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="trang">Trang (Pages)</option>
                      <option value="bài">Bài học (Lessons)</option>
                      <option value="giờ">Giờ (Hours)</option>
                      <option value="%">% hoàn thành</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow"
                  >
                    Lưu vào tủ sách
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

export default function LearningPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm text-neutral-400">
          Đang tải tủ sách học tập...
        </div>
      }
    >
      <LearningContent />
    </Suspense>
  );
}

