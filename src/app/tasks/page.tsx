"use client";

import React, { useState, useEffect, Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import UpgradeModal from "@/components/UpgradeModal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Tag,
  AlertCircle,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  Timer,
  Search,
  FolderKanban,
  ExternalLink,
} from "lucide-react";

function TasksContent() {
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get("projectId");
  const queryView = searchParams.get("view");
  const queryPriority = searchParams.get("priority");
  const queryStatus = searchParams.get("status");
  const queryNew = searchParams.get("new");

  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "list">(queryView === "list" ? "list" : "kanban");
  const [filterPriority, setFilterPriority] = useState<string>(queryPriority || "all");
  const [filterStatus, setFilterStatus] = useState<string>(queryStatus || "all");
  const [filterProject, setFilterProject] = useState<string>(queryProjectId || "all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isNewModalOpen, setIsNewModalOpen] = useState(queryNew === "true");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [projectId, setProjectId] = useState(queryProjectId || "");
  const [dueDate, setDueDate] = useState("");
  const [defaultStatusForNew, setDefaultStatusForNew] = useState("todo");

  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const loadData = async () => {
    try {
      const [tasksRes, projsRes] = await Promise.all([
        fetch("/api/tasks").then((r) => r.json()),
        fetch("/api/projects").then((r) => r.json()),
      ]);
      if (tasksRes.tasks) setTasks(tasksRes.tasks);
      if (projsRes.projects) setProjects(projsRes.projects);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (queryProjectId) {
      setFilterProject(queryProjectId);
      setProjectId(queryProjectId);
    }
  }, [queryProjectId]);

  useEffect(() => {
    if (queryView === "list" || queryView === "kanban") {
      setViewMode(queryView);
    }
  }, [queryView]);

  useEffect(() => {
    if (queryPriority) {
      setFilterPriority(queryPriority);
    }
  }, [queryPriority]);

  useEffect(() => {
    if (queryStatus) {
      setFilterStatus(queryStatus);
    }
  }, [queryStatus]);

  useEffect(() => {
    if (queryNew === "true") {
      setIsNewModalOpen(true);
    }
  }, [queryNew]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          projectId: projectId || null,
          dueDate: dueDate || null,
          status: defaultStatusForNew,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTitle("");
        setDescription("");
        setDueDate("");
        setIsNewModalOpen(false);
        loadData();
      } else if (data.requiresUpgrade) {
        setUpgradeMessage(data.error);
        setUpgradeModalOpen(true);
      } else {
        alert(data.error || "Lỗi tạo công việc");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    }
  };

  const handleUpdateStatus = async (taskId: string, nextStatus: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: nextStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
    setTasks(tasks.filter((t) => t.id !== taskId));
    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchProject = filterProject === "all" || t.projectId === filterProject;
    const matchSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchPriority && matchStatus && matchProject && matchSearch;
  });

  const columns = [
    { id: "todo", label: "Cần làm", color: "border-neutral-700" },
    { id: "in_progress", label: "Đang xử lý", color: "border-indigo-500" },
    { id: "review", label: "Đang rà soát", color: "border-amber-500" },
    { id: "done", label: "Hoàn tất", color: "border-emerald-500" },
  ];

  return (
    <AppShell>
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Đạt giới hạn công việc gói Free"
        description={upgradeMessage || "Gói miễn phí giới hạn tối đa 100 công việc. Hãy nâng cấp lên gói Pro để tạo không giới hạn."}
        featureName="Không giới hạn Tasks"
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <CheckSquare className="w-6 h-6 text-indigo-400" />
              <span>Quản lý Công việc (Tasks)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tổ chức công việc theo Kanban hoặc Danh sách, gắn kết Dự án và đồng hồ Pomodoro Focus
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm công việc..."
                className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="todo">Cần làm</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="review">Đang rà soát</option>
              <option value="done">Đã hoàn tất</option>
            </select>

            {/* Project Filter */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Mọi ưu tiên</option>
              <option value="urgent">Khẩn cấp</option>
              <option value="high">Ưu tiên cao</option>
              <option value="medium">Bình thường</option>
              <option value="low">Thấp</option>
            </select>

            {/* View Mode Switch */}
            <div className="flex rounded-xl bg-neutral-900 border border-neutral-800 p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === "kanban" ? "bg-neutral-800 text-white shadow" : "text-neutral-500 hover:text-white"
                }`}
                title="Dạng Kanban"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === "list" ? "bg-neutral-800 text-white shadow" : "text-neutral-500 hover:text-white"
                }`}
                title="Dạng danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setDefaultStatusForNew("todo");
                setIsNewModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm việc</span>
            </button>
          </div>
        </div>

        {/* KANBAN BOARD VIEW */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-3.5 flex flex-col min-h-[520px]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full border-2 ${col.color}`} />
                      <span className="font-bold text-xs text-white uppercase tracking-wider">{col.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-500 px-2 py-0.5 rounded-full bg-neutral-800">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl border border-neutral-800/90 bg-neutral-900 hover:border-neutral-700 shadow-sm transition group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-neutral-100 leading-snug">{task.title}</span>
                          <div className="flex items-center gap-1">
                            {/* Pomodoro Link Button */}
                            <Link
                              href={`/pomodoro?taskId=${task.id}`}
                              className="p-1 rounded bg-orange-950/40 text-orange-400 hover:bg-orange-900/60 transition"
                              title="Bắt đầu phiên Pomodoro tập trung cho công việc này"
                            >
                              <Timer className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-neutral-600 hover:text-rose-400 p-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-neutral-400 mb-2 line-clamp-2">{task.description}</p>
                        )}

                        {/* Project & Due Date Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 my-2">
                          {task.project && (
                            <Link
                              href={`/projects`}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-500/20 hover:underline"
                            >
                              <FolderKanban className="w-3 h-3" />
                              <span>{task.project.name}</span>
                            </Link>
                          )}
                          {task.dueDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
                              <CalendarIcon className="w-3 h-3 text-neutral-500" />
                              <span>{new Date(task.dueDate).toLocaleDateString("vi-VN")}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] pt-2 border-t border-neutral-800/60 mt-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              task.priority === "urgent"
                                ? "bg-rose-500/20 text-rose-300"
                                : task.priority === "high"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-neutral-800 text-neutral-400"
                            }`}
                          >
                            {task.priority}
                          </span>

                          <div className="flex items-center gap-1">
                            {col.id !== "todo" && (
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    task.id,
                                    col.id === "done" ? "review" : col.id === "review" ? "in_progress" : "todo"
                                  )
                                }
                                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                                title="Lùi trạng thái"
                              >
                                ←
                              </button>
                            )}
                            {col.id !== "done" && (
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    task.id,
                                    col.id === "todo" ? "in_progress" : col.id === "in_progress" ? "review" : "done"
                                  )
                                }
                                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                                title="Tiến trạng thái"
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setDefaultStatusForNew(col.id);
                      setIsNewModalOpen(true);
                    }}
                    className="w-full py-2 mt-3 rounded-xl border border-dashed border-neutral-800 hover:border-neutral-700 text-neutral-500 hover:text-neutral-300 text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm thẻ vào đây</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500">
                Không tìm thấy công việc nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {filteredTasks.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateStatus(t.id, t.status === "done" ? "todo" : "done")}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                          t.status === "done"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-neutral-700 hover:border-indigo-400"
                        }`}
                      >
                        {t.status === "done" && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <div>
                        <span
                          className={`text-sm font-semibold block ${
                            t.status === "done" ? "line-through text-neutral-500" : "text-white"
                          }`}
                        >
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                          {t.project && <span className="text-indigo-400">{t.project.name}</span>}
                          {t.dueDate && (
                            <span>• Hạn: {new Date(t.dueDate).toLocaleDateString("vi-VN")}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/pomodoro?taskId=${t.id}`}
                        className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold flex items-center gap-1 hover:bg-orange-500/20 transition"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>Pomodoro</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-neutral-600 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL CREATE TASK */}
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Tạo công việc mới</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tiêu đề công việc</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Rà soát ngân sách tháng, Gặp gỡ đối tác..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Mô tả (tùy chọn)</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ghi chú chi tiết hoặc checklist..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Dự án</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="">-- Không chọn --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Độ ưu tiên</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Bình thường</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Hạn chót (Due Date)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow"
                  >
                    Lưu công việc
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

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] text-white p-8">Đang tải công việc...</div>}>
      <TasksContent />
    </Suspense>
  );
}
