"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import UpgradeModal from "@/components/UpgradeModal";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Trash2,
  Pin,
  Search,
  Folder,
  CheckSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folder, setFolder] = useState("General");
  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [taskCreatedMsg, setTaskCreatedMsg] = useState("");

  const loadNotes = async (q = "") => {
    try {
      const res = await fetch(`/api/notes${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const json = await res.json();
      if (json.success) setNotes(json.notes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadNotes(search);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, folder }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTitle("");
        setContent("");
        setIsModalOpen(false);
        loadNotes();
      } else if (json.requiresUpgrade) {
        setUpgradeMessage(json.error);
        setUpgradeModalOpen(true);
      } else {
        alert(json.error || "Lỗi tạo ghi chú");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    }
  };

  const handleConvertToTask = async (note: any) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `[Ghi chú] ${note.title}`,
          description: note.content,
          priority: "medium",
          status: "todo",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTaskCreatedMsg(`✓ Đã tạo công việc thành công từ ghi chú "${note.title}"!`);
        setTimeout(() => setTaskCreatedMsg(""), 3500);
      } else {
        alert(json.error || "Lỗi tạo công việc");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isPinned: !currentPinned } : n)));
    try {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned: !currentPinned }),
      });
      loadNotes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa ghi chú này?")) return;
    setNotes(notes.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell>
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Đạt giới hạn ghi chú gói Free"
        description={upgradeMessage || "Gói miễn phí giới hạn 100 ghi chú. Hãy nâng cấp Pro để lưu trữ không giới hạn."}
        featureName="Không giới hạn Notes"
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Toast Notification when Note converted to Task */}
        {taskCreatedMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xl">
            <span>{taskCreatedMsg}</span>
            <Link href="/tasks" className="underline font-bold text-white hover:text-emerald-200">
              Xem danh sách công việc →
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-purple-400" />
              <span>Ghi chú & Sổ tay (Notes)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Lưu giữ ý tưởng, biên bản và chuyển đổi nhanh chóng thành Công việc cần thực thi
            </p>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm ghi chú..."
                className="bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
            </form>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi chú mới</span>
            </button>
          </div>
        </div>

        {/* NOTES GRID */}
        {notes.length === 0 ? (
          <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
            <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">Chưa có ghi chú nào</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Viết ra những ý tưởng bất chợt để không bao giờ bỏ lỡ cơ hội.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow"
            >
              Tạo ghi chú đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-5 rounded-3xl border transition flex flex-col justify-between ${
                  note.isPinned
                    ? "border-purple-500/40 bg-purple-950/20 shadow-lg shadow-purple-950/20"
                    : "border-neutral-800 bg-neutral-900/70 hover:border-neutral-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-base text-white line-clamp-1">{note.title}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(note.id, note.isPinned)}
                        className={`p-1 rounded transition ${
                          note.isPinned ? "text-purple-400" : "text-neutral-600 hover:text-neutral-300"
                        }`}
                        title={note.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-neutral-600 hover:text-rose-400 p-1"
                        title="Xóa ghi chú"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 whitespace-pre-line line-clamp-4 leading-relaxed mb-4">
                    {note.content}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Folder className="w-3 h-3 text-purple-400" />
                      {note.folder || "General"}
                    </span>
                    <span>{new Date(note.updatedAt).toLocaleDateString("vi-VN")}</span>
                  </div>

                  {/* Interconnection: 1-click convert note to task */}
                  <button
                    onClick={() => handleConvertToTask(note)}
                    className="w-full py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Tạo công việc từ ghi chú này</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Tạo ghi chú mới</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tiêu đề ghi chú"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Thư mục phân loại</label>
                  <input
                    type="text"
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    placeholder="General / Work / Idea"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Nội dung ghi chú</label>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nội dung ý tưởng, thông tin..."
                    rows={6}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
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
                    Lưu ghi chú
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
