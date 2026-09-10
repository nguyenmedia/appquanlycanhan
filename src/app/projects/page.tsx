"use client";

import React, { useState, useEffect, Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import UpgradeModal from "@/components/UpgradeModal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Layers,
  ArrowRight,
  CheckSquare,
  ExternalLink,
  Milestone,
} from "lucide-react";

function ProjectsContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"projects" | "milestones">(
    queryTab === "milestones" ? "milestones" : "projects"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (queryTab === "milestones" || queryTab === "projects") {
      setActiveTab(queryTab);
    }
  }, [queryTab]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [targetDate, setTargetDate] = useState("");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  // Quick Task Modal for a specific project
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [activeProjectForTask, setActiveProjectForTask] = useState<any>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskPriority, setQuickTaskPriority] = useState("medium");
  const [quickTaskDueDate, setQuickTaskDueDate] = useState("");

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (json.success) setProjects(json.projects);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          color,
          targetDate: targetDate || null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setName("");
        setDescription("");
        setTargetDate("");
        setIsModalOpen(false);
        loadProjects();
      } else if (json.requiresUpgrade) {
        setUpgradeMessage(json.error);
        setUpgradeModalOpen(true);
      } else {
        alert(json.error || "Lỗi tạo dự án");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    }
  };

  const handleCreateQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !activeProjectForTask) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTaskTitle.trim(),
          projectId: activeProjectForTask.id,
          priority: quickTaskPriority,
          dueDate: quickTaskDueDate || null,
          status: "todo",
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setQuickTaskTitle("");
        setQuickTaskDueDate("");
        setQuickTaskModalOpen(false);
        loadProjects();
      } else {
        alert(json.error || "Lỗi thêm việc cho dự án");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa dự án này? Các công việc thuộc dự án sẽ được giữ lại.")) return;
    setProjects(projects.filter((p) => p.id !== id));
    try {
      await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell>
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Đạt giới hạn dự án gói Free"
        description={upgradeMessage || "Gói miễn phí giới hạn tối đa 3 dự án. Hãy nâng cấp Pro để tạo không giới hạn."}
        featureName="Không giới hạn Projects"
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <FolderKanban className="w-6 h-6 text-indigo-400" />
              <span>Quản lý Dự án (Projects)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tổ chức các mục tiêu lớn, quản lý danh sách công việc và theo dõi tỷ lệ hoàn thành tự động
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo dự án mới</span>
          </button>
        </div>

        {/* SUB-TABS: PROJECTS vs MILESTONES */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "projects" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Danh mục dự án ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab("milestones")}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === "milestones" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Milestone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cột mốc & Tiến độ Roadmap</span>
            </button>
          </div>
        </div>

        {/* TAB 2: MILESTONES & ROADMAP */}
        {activeTab === "milestones" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {projects.length === 0 ? (
              <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
                <FolderKanban className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-white mb-1">Chưa có dự án nào</h3>
                <p className="text-xs text-neutral-400 mb-6">
                  Tạo dự án để theo dõi cột mốc và tiến độ thực thi.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow"
                >
                  Tạo dự án mới
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj) => {
                  const tasksList = proj.tasks || [];
                  const doneTasks = tasksList.filter((t: any) => t.status === "done").length;
                  const pct = tasksList.length > 0 ? Math.round((doneTasks / tasksList.length) * 100) : 0;

                  return (
                    <div
                      key={proj.id}
                      className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/70 space-y-4 shadow-xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: proj.color || "#6366f1" }}
                          />
                          <div>
                            <h3 className="font-bold text-base text-white">{proj.name}</h3>
                            <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-3">
                              {proj.targetDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                  Hạn chót: {new Date(proj.targetDate).toLocaleDateString("vi-VN")}
                                </span>
                              )}
                              <span>•</span>
                              <span>
                                {doneTasks}/{tasksList.length} công việc hoàn thành
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-indigo-400 font-mono">{pct}%</span>
                          <Link
                            href={`/tasks?projectId=${proj.id}`}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs text-white font-semibold flex items-center gap-1.5 transition"
                          >
                            <span>Xem bảng Kanban</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: proj.color || "#6366f1",
                          }}
                        />
                      </div>

                      {/* Tasks breakdown in Roadmap */}
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-semibold text-neutral-400">
                          Các nhiệm vụ thuộc cột mốc dự án:
                        </div>
                        {tasksList.length === 0 ? (
                          <div className="text-xs text-neutral-500 italic py-2">
                            Chưa có đầu việc nào. Bấm "Thêm việc" để gán nhiệm vụ vào dự án.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {tasksList.map((t: any) => (
                              <div
                                key={t.id}
                                className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <div
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                      t.status === "done" ? "bg-emerald-400" : "bg-neutral-600"
                                    }`}
                                  />
                                  <span
                                    className={`truncate ${
                                      t.status === "done" ? "line-through text-neutral-500" : "text-white"
                                    }`}
                                  >
                                    {t.title}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded capitalize font-medium flex-shrink-0 ${
                                    t.priority === "urgent"
                                      ? "bg-rose-950 text-rose-400"
                                      : t.priority === "high"
                                      ? "bg-amber-950 text-amber-400"
                                      : "bg-neutral-800 text-neutral-400"
                                  }`}
                                >
                                  {t.priority}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: PROJECTS LIST */}
        {activeTab === "projects" && (projects.length === 0 ? (
          <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
            <FolderKanban className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">Chưa có dự án nào</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Dự án giúp bạn gom các đầu việc liên quan và quản lý tiến độ tập trung.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow"
            >
              Tạo dự án đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 flex flex-col justify-between transition shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: proj.color || "#6366f1" }}
                      />
                      <h4 className="font-bold text-base text-white">{proj.name}</h4>
                    </div>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="text-neutral-600 hover:text-rose-400 p-1 transition"
                      title="Xóa dự án"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-neutral-400 mb-4 line-clamp-2">{proj.description}</p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Tiến độ hoàn thành</span>
                      <span className="font-bold text-white">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 pb-3 mb-3 border-b border-neutral-800/80">
                    <span className="font-medium text-neutral-300">
                      {proj.completedTasks}/{proj.totalTasks} công việc xong
                    </span>
                    {proj.targetDate && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        {new Date(proj.targetDate).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Project Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/tasks?projectId=${proj.id}`}
                    className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Xem các việc</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setActiveProjectForTask(proj);
                      setQuickTaskModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold transition flex items-center gap-1"
                    title="Thêm công việc trực tiếp vào dự án này"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Thêm việc</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* MODAL CREATE PROJECT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Tạo dự án mới</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tên dự án</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Ra mắt sản phẩm Q4, Nâng cấp nhà cửa..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Mô tả dự án</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mục tiêu hoặc kế hoạch..."
                    rows={3}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Màu nhận diện</label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="#6366f1">Tím chàm (Indigo)</option>
                      <option value="#3b82f6">Xanh dương (Blue)</option>
                      <option value="#10b981">Xanh lá (Emerald)</option>
                      <option value="#ec4899">Hồng (Pink)</option>
                      <option value="#f59e0b">Cam vàng (Amber)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Hạn mục tiêu</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
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
                    Tạo dự án
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL QUICK ADD TASK TO PROJECT */}
        {quickTaskModalOpen && activeProjectForTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1">
                Thêm việc cho: <span className="text-indigo-400">{activeProjectForTask.name}</span>
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                Công việc sẽ tự động liên kết với dự án này và tính vào tiến độ hoàn thành.
              </p>
              <form onSubmit={handleCreateQuickTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tiêu đề công việc</label>
                  <input
                    type="text"
                    required
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    placeholder="Ví dụ: Thiết kế giao diện thanh toán..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Mức ưu tiên</label>
                    <select
                      value={quickTaskPriority}
                      onChange={(e) => setQuickTaskPriority(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Bình thường</option>
                      <option value="high">Ưu tiên cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Hạn chót (Due Date)</label>
                    <input
                      type="date"
                      value={quickTaskDueDate}
                      onChange={(e) => setQuickTaskDueDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setQuickTaskModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow"
                  >
                    Lưu vào dự án
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

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm text-neutral-400">
          Đang tải dự án...
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}

