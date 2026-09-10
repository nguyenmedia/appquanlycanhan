"use client";

import React, { useState, useEffect, Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import UpgradeModal from "@/components/UpgradeModal";
import { useSearchParams } from "next/navigation";
import {
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  Flame,
  Award,
  Calendar,
  Sparkles,
  Trophy,
} from "lucide-react";

function HabitsContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [habits, setHabits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"today" | "streaks">(queryTab === "streaks" ? "streaks" : "today");
  const [todayStr, setTodayStr] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [color, setColor] = useState("#10b981");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    if (queryTab === "streaks" || queryTab === "today") {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const loadData = async () => {
    try {
      const res = await fetch("/api/habits");
      const json = await res.json();
      if (json.success) {
        setHabits(json.habits);
        setTodayStr(json.today);
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

  const handleToggle = async (habitId: string, currentCompleted: boolean) => {
    const nextCompleted = !currentCompleted;
    setHabits(
      habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completedToday: nextCompleted,
              streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h
      )
    );

    try {
      await fetch("/api/habits/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, completed: nextCompleted }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          frequency,
          color,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTitle("");
        setDescription("");
        setIsModalOpen(false);
        loadData();
      } else if (json.requiresUpgrade) {
        setUpgradeMessage(json.error);
        setUpgradeModalOpen(true);
      } else {
        alert(json.error || "Lỗi tạo thói quen");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa thói quen này?")) return;
    setHabits(habits.filter((h) => h.id !== id));
    try {
      await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  // Generate 7 days for the mini heatmap
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  return (
    <AppShell>
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Đạt giới hạn thói quen gói Free"
        description={upgradeMessage || "Gói miễn phí giới hạn tối đa 5 thói quen. Nâng cấp Pro để tạo không giới hạn."}
        featureName="Không giới hạn Habits"
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Zap className="w-6 h-6 text-emerald-400" />
              <span>Xây dựng Thói quen (Habits Tracker)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Duy trì chuỗi streak kiên trì mỗi ngày để hình thành lối sống kỷ luật
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thói quen</span>
          </button>
        </div>

        {/* SUB-TABS: TODAY CHECKLIST vs STREAKS HALL OF FAME */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab("today")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "today" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Điểm danh hôm nay ({habits.filter((h) => h.completedToday).length}/{habits.length})
            </button>
            <button
              onClick={() => setActiveTab("streaks")}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === "streaks" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Chuỗi Streak kỷ lục ({habits.reduce((max, h) => Math.max(max, h.streak || 0), 0)} ngày)</span>
            </button>
          </div>
        </div>

        {/* TAB 2: STREAKS HALL OF FAME */}
        {activeTab === "streaks" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Streak Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/30">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Chuỗi Streak dài nhất hiện tại</span>
                </div>
                <div className="text-3xl font-black text-amber-400">
                  {habits.reduce((max, h) => Math.max(max, h.streak || 0), 0)} ngày liên tiếp
                </div>
                <div className="text-[11px] text-neutral-500 mt-2">
                  Giữ lửa kỷ luật không ngắt quãng
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span>Thói quen đạt mốc 21 ngày</span>
                </div>
                <div className="text-3xl font-black text-emerald-400">
                  {habits.filter((h) => (h.streak || 0) >= 21).length}/{habits.length}
                </div>
                <div className="text-[11px] text-neutral-500 mt-2">
                  Đã hình thành phản xạ thần kinh tự nhiên
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Tổng số lượt check-in tích lũy</span>
                </div>
                <div className="text-3xl font-black text-white">
                  {habits.reduce((acc, h) => acc + (h.streak || 0), 0)} lượt
                </div>
                <div className="text-[11px] text-neutral-500 mt-2">
                  Toàn bộ nỗ lực không ngừng nghỉ
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Bảng vinh danh Thói quen kiên trì nhất</span>
              </h3>

              <div className="space-y-3">
                {[...habits]
                  .sort((a, b) => (b.streak || 0) - (a.streak || 0))
                  .map((habit, idx) => {
                    const streak = habit.streak || 0;
                    const badge =
                      streak >= 100
                        ? { label: "Huyền thoại (100d+)", color: "text-purple-400 bg-purple-950/50 border-purple-500/30" }
                        : streak >= 66
                        ? { label: "Kỷ luật thép (66d+)", color: "text-amber-400 bg-amber-950/50 border-amber-500/30" }
                        : streak >= 21
                        ? { label: "Phản xạ tự nhiên (21d+)", color: "text-emerald-400 bg-emerald-950/50 border-emerald-500/30" }
                        : streak >= 7
                        ? { label: "Khởi đầu vững (7d+)", color: "text-indigo-400 bg-indigo-950/50 border-indigo-500/30" }
                        : { label: "Đang tạo đà", color: "text-neutral-400 bg-neutral-800 border-neutral-700" };

                    return (
                      <div
                        key={habit.id}
                        className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                              idx === 0
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : idx === 1
                                ? "bg-neutral-300/20 text-neutral-200 border border-neutral-300/30"
                                : idx === 2
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                : "bg-neutral-800 text-neutral-500"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-sm text-white">{habit.title}</div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              Tần suất: {habit.frequency === "daily" ? "Hàng ngày" : "Hàng tuần"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-sm">
                            <Flame className="w-4 h-4 text-amber-400" />
                            <span>{streak} ngày</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: HABITS GRID (TODAY CHECKLIST) */}
        {activeTab === "today" && (habits.length === 0 ? (
          <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
            <Zap className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">Chưa có thói quen nào</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Bắt đầu với những thói quen đơn giản như "Đọc sách 20 phút" hoặc "Chạy bộ mỗi sáng".
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo thói quen đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 flex flex-col justify-between hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(habit.id, habit.completedToday)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                          habit.completedToday
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "border-neutral-700 hover:border-neutral-500 bg-neutral-800"
                        }`}
                      >
                        {habit.completedToday && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      <div>
                        <h4 className="font-bold text-sm text-white">{habit.title}</h4>
                        <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                          {habit.frequency}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="text-neutral-600 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {habit.description && (
                    <p className="text-xs text-neutral-400 mb-4">{habit.description}</p>
                  )}

                  {/* 7-day mini activity grid */}
                  <div className="mb-4">
                    <div className="text-[10px] text-neutral-500 mb-1.5 flex justify-between">
                      <span>7 ngày gần đây</span>
                      <span>Hôm nay</span>
                    </div>
                    <div className="flex gap-1.5">
                      {recentDays.map((d) => {
                        const isDone = habit.logs?.some((l: any) => l.date === d && l.completed);
                        const isToday = d === todayStr;
                        return (
                          <div
                            key={d}
                            className={`flex-1 h-6 rounded-md flex items-center justify-center text-[9px] font-mono transition ${
                              isDone
                                ? "bg-emerald-500 text-neutral-950 font-bold"
                                : isToday
                                ? "border border-dashed border-neutral-600 bg-neutral-800"
                                : "bg-neutral-800/80 text-neutral-600"
                            }`}
                          >
                            {d.slice(-2)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Flame className="w-4 h-4" />
                    <span>Streak: {habit.streak} ngày</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Kỷ lục: {habit.bestStreak}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* MODAL HABIT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Thêm thói quen mới</h3>
              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tên thói quen</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Đọc sách 30 phút, Uống 2L nước"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Mục tiêu thói quen</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Lý do hoặc ghi chú..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Tần suất</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="daily">Hàng ngày (Daily)</option>
                      <option value="weekly">Hàng tuần (Weekly)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Màu sắc</label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="#10b981">Xanh lá (Emerald)</option>
                      <option value="#6366f1">Tím chàm (Indigo)</option>
                      <option value="#3b82f6">Xanh dương (Blue)</option>
                      <option value="#ec4899">Hồng (Pink)</option>
                      <option value="#f59e0b">Hổ phách (Amber)</option>
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
                    Tạo thói quen
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

export default function HabitsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm text-neutral-400">
          Đang tải thói quen...
        </div>
      }
    >
      <HabitsContent />
    </Suspense>
  );
}

