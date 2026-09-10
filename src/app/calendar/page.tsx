"use client";

import React, { useState, useEffect, Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Trash2,
  CheckCircle2,
  CheckSquare,
  Timer,
  Tag,
  Filter,
} from "lucide-react";

function CalendarContent() {
  const searchParams = useSearchParams();
  const queryFilter = searchParams.get("filter");

  const [events, setEvents] = useState<any[]>([]);
  const [dueTasks, setDueTasks] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"all" | "events" | "tasks">(
    queryFilter === "events" ? "events" : queryFilter === "tasks" ? "tasks" : "all"
  );

  useEffect(() => {
    if (queryFilter === "events" || queryFilter === "tasks" || queryFilter === "all") {
      setFilterType(queryFilter);
    }
  }, [queryFilter]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("work");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [calRes, tasksRes] = await Promise.all([
        fetch("/api/calendar").then((r) => r.json()),
        fetch("/api/tasks").then((r) => r.json()),
      ]);
      if (calRes.success) setEvents(calRes.events);
      if (tasksRes.tasks) {
        // filter tasks that have due dates
        const withDueDate = tasksRes.tasks.filter((t: any) => t.dueDate);
        setDueTasks(withDueDate);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          startTime,
          endTime,
          location,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTitle("");
        setDescription("");
        setLocation("");
        setIsModalOpen(false);
        loadData();
      } else {
        alert(json.error || "Lỗi tạo sự kiện");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sự kiện này khỏi lịch?")) return;
    setEvents(events.filter((e) => e.id !== id));
    try {
      await fetch(`/api/calendar?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "done" ? "todo" : "done";
    setDueTasks(dueTasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));
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

  // Combine items for the timeline
  const combinedTimeline = [
    ...(filterType === "tasks"
      ? []
      : events.map((e) => ({
          ...e,
          itemType: "event",
          sortDate: new Date(e.startTime).getTime(),
        }))),
    ...(filterType === "events"
      ? []
      : dueTasks.map((t) => ({
          ...t,
          itemType: "task",
          sortDate: new Date(t.dueDate).getTime(),
        }))),
  ].sort((a, b) => a.sortDate - b.sortDate);

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 text-blue-400" />
              <span>Lịch biểu & Hạn chót (Calendar)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tích hợp đồng bộ Lịch sự kiện, Cuộc họp và Hạn chót hoàn thành Công việc
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            <div className="inline-flex p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === "all" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                Tất cả ({events.length + dueTasks.length})
              </button>
              <button
                onClick={() => setFilterType("events")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === "events" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                Sự kiện ({events.length})
              </button>
              <button
                onClick={() => setFilterType("tasks")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === "tasks" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                Hạn chót việc ({dueTasks.length})
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sự kiện</span>
            </button>
          </div>
        </div>

        {/* TIMELINE LIST */}
        {combinedTimeline.length === 0 ? (
          <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
            <CalendarIcon className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">Chưa có sự kiện hoặc hạn chót nào</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Lên lịch các cuộc hẹn hoặc thêm hạn chót cho công việc để quản lý thời gian hiệu quả.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow"
            >
              Thêm sự kiện đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {combinedTimeline.map((item: any) => {
              const isTask = item.itemType === "task";

              if (isTask) {
                return (
                  <div
                    key={`task-${item.id}`}
                    className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => handleToggleTask(item.id, item.status)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition flex-shrink-0 ${
                          item.status === "done"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-neutral-700 hover:border-indigo-400"
                        }`}
                        title="Đánh dấu hoàn tất"
                      >
                        {item.status === "done" && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              item.status === "done" ? "line-through text-neutral-500" : "text-white"
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-950 border border-indigo-500/30 px-2 py-0.2 rounded">
                            Hạn chót công việc
                          </span>
                          {item.project && (
                            <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.2 rounded">
                              {item.project.name}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1.5">
                          <span className="text-amber-400 font-medium">
                            Hạn đến: {new Date(item.dueDate).toLocaleDateString("vi-VN")}
                          </span>
                          <span>•</span>
                          <span className="uppercase text-[10px] font-bold text-neutral-400">
                            Ưu tiên: {item.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/pomodoro?taskId=${item.id}`}
                        className="px-2.5 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-orange-500/20 transition"
                        title="Tập trung Pomodoro cho công việc này"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Pomodoro</span>
                      </Link>
                    </div>
                  </div>
                );
              }

              // Event Card
              return (
                <div
                  key={`event-${item.id}`}
                  className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-800 px-2 py-0.2 rounded">
                          {item.category}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-neutral-400 mt-1">{item.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 mt-2">
                        <span>Bắt đầu: {new Date(item.startTime).toLocaleString("vi-VN")}</span>
                        <span>•</span>
                        <span>Kết thúc: {new Date(item.endTime).toLocaleString("vi-VN")}</span>
                        {item.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-neutral-400">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-neutral-600 hover:text-rose-400 p-1.5 transition"
                    title="Xóa sự kiện"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL CREATE EVENT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Thêm sự kiện lịch biểu</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tiêu đề sự kiện</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Họp nhóm Q4, Lịch tập Gym"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Mô tả chi tiết</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nội dung hoặc liên kết Google Meet"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Bắt đầu</label>
                    <input
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Kết thúc</label>
                    <input
                      type="datetime-local"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Danh mục</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="work">Công việc (Work)</option>
                      <option value="meeting">Cuộc họp (Meeting)</option>
                      <option value="personal">Cá nhân (Personal)</option>
                      <option value="health">Sức khỏe / Thể thao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Địa điểm</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Online / Văn phòng"
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
                    Lưu sự kiện
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

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm text-neutral-400">
          Đang tải lịch biểu...
        </div>
      }
    >
      <CalendarContent />
    </Suspense>
  );
}

