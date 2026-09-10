"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import UpgradeModal from "@/components/UpgradeModal";
import {
  CheckSquare,
  Zap,
  Wallet,
  Target,
  Sparkles,
  ArrowUpRight,
  Clock,
  Plus,
  TrendingUp,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  Timer,
  HeartPulse,
  BookOpen,
  BookMarked,
  FolderKanban,
  GraduationCap,
  Users,
  BarChart3,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [pomodoroStats, setPomodoroStats] = useState<any>(null);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, tasksRes, habitsRes, goalsRes, finRes, pomoRes] = await Promise.all([
          fetch("/api/auth/me").then((r) => r.json()),
          fetch("/api/tasks").then((r) => r.json()),
          fetch("/api/habits").then((r) => r.json()),
          fetch("/api/goals").then((r) => r.json()),
          fetch("/api/finance").then((r) => r.json()),
          fetch("/api/pomodoro").then((r) => r.json()),
        ]);

        if (meRes.user) setUser(meRes.user);
        if (tasksRes.tasks) setTasks(tasksRes.tasks);
        if (habitsRes.habits) setHabits(habitsRes.habits);
        if (goalsRes.goals) setGoals(goalsRes.goals);
        if (finRes.summary) setFinanceSummary(finRes.summary);
        if (pomoRes.success) setPomodoroStats(pomoRes);
      } catch (e) {
        console.error("Dashboard data load error", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleHabit = async (habitId: string, currentCompleted: boolean) => {
    const nextCompleted = !currentCompleted;
    setHabits(
      habits.map((h) =>
        h.id === habitId ? { ...h, completedToday: nextCompleted, streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1) } : h
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

  const handleGenerateAiDailyPlan = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "ai_planner",
          prompt: "Hãy lập kế hoạch ngày tối ưu dựa trên các nhiệm vụ và thói quen hôm nay của tôi.",
        }),
      });

      const data = await res.json();
      if (res.ok && data.content) {
        setAiAdvice(data.content);
      } else if (data.requiresUpgrade) {
        setUpgradeFeature("AI Planner");
        setUpgradeModalOpen(true);
      } else {
        alert(data.error || "Lỗi tạo kế hoạch AI");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    } finally {
      setAiLoading(false);
    }
  };

  const todayDateStr = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const completedTasks = tasks.filter((t) => t.status === "done");
  const completedHabitsCount = habits.filter((h) => h.completedToday).length;
  const totalFocusMins = pomodoroStats?.totalFocusMinutes || 0;

  return (
    <AppShell>
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Nâng cấp gói LifeOS Pro"
        description="Tính năng AI Planner và lập kế hoạch nâng cao yêu cầu gói LifeOS Pro hoặc Premium."
        featureName={upgradeFeature}
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* WELCOME BANNER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-800/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 capitalize mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{todayDateStr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Xin chào, {user?.profile?.fullName || "bạn"}! 👋
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Hôm nay bạn có <strong>{activeTasks.length} nhiệm vụ</strong> cần làm, <strong>{habits.length - completedHabitsCount} thói quen</strong> chờ điểm danh, và đã tập trung <strong>{totalFocusMins} phút Deep Work</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/tasks"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm việc mới</span>
            </Link>
            <Link
              href="/pomodoro"
              className="px-3.5 py-2 rounded-xl bg-orange-600/20 border border-orange-500/30 hover:bg-orange-600/30 text-orange-300 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Timer className="w-4 h-4" />
              <span>Pomodoro</span>
            </Link>
            <Link
              href="/finance"
              className="px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Ghi chi tiêu</span>
            </Link>
          </div>
        </div>

        {/* METRICS SUMMARY ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Tasks Card */}
          <Link
            href="/tasks"
            className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                Công việc
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">
                {completedTasks.length}/{tasks.length} xong
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{activeTasks.length} việc cần làm</div>
            <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{
                  width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%`,
                }}
              />
            </div>
          </Link>

          {/* Habits Card */}
          <Link
            href="/habits"
            className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                <Zap className="w-4 h-4 text-emerald-400" />
                Thói quen
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">
                {completedHabitsCount}/{habits.length} đạt
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {habits[0]?.streak ? `${habits[0].streak} ngày` : "Khởi động"}
            </div>
            <div className="text-[11px] text-neutral-500">Chuỗi streak thói quen cao nhất</div>
          </Link>

          {/* Finance Balance Card */}
          <Link
            href="/finance"
            className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                <Wallet className="w-4 h-4 text-amber-400" />
                Tài chính
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                VND
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">
              {financeSummary?.totalBalance !== undefined
                ? `${financeSummary.totalBalance.toLocaleString("vi-VN")}đ`
                : "0đ"}
            </div>
            <div className="text-[11px] text-neutral-500">
              Chi tháng: {financeSummary?.totalExpense?.toLocaleString("vi-VN") || 0}đ
            </div>
          </Link>

          {/* Pomodoro Focus Card */}
          <Link
            href="/pomodoro"
            className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                <Timer className="w-4 h-4 text-orange-400" />
                Pomodoro Focus
              </span>
              <span className="text-[11px] font-semibold text-orange-400">
                {pomodoroStats?.sessions?.length || 0} phiên
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {totalFocusMins} phút
            </div>
            <div className="text-[11px] text-neutral-500 truncate">
              Tập trung làm việc sâu
            </div>
          </Link>
        </div>

        {/* AI FOCUS ADVISOR WIDGET */}
        <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-neutral-900 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Trợ lý AI Lập Kế Hoạch Ngày</h3>
                <p className="text-xs text-neutral-400">
                  Tự động phân tích lịch biểu, thói quen và đề xuất lịch làm việc tối ưu nhất
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateAiDailyPlan}
              disabled={aiLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-95 transition disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tổng hợp...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo kế hoạch ngày bằng AI</span>
                </>
              )}
            </button>
          </div>

          {aiAdvice ? (
            <div className="mt-4 p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-200 leading-relaxed whitespace-pre-line animate-in fade-in">
              {aiAdvice}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-neutral-950/40 border border-neutral-800/80 text-xs text-neutral-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>
                Nhấn nút "Tạo kế hoạch ngày bằng AI" để trợ lý LifeOS phân bổ khung giờ Deep Work và nhắc nhở thói quen.
              </span>
            </div>
          )}
        </div>

        {/* 2-COLUMN MAIN CONTENT: TASKS & HABITS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TASKS COLUMN (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span>Nhiệm vụ trọng tâm</span>
              </h2>
              <Link href="/tasks" className="text-xs font-semibold text-indigo-400 hover:underline">
                Xem tất cả ({tasks.length}) →
              </Link>
            </div>

            {activeTasks.length === 0 ? (
              <div className="p-8 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" />
                <h4 className="font-bold text-sm text-white mb-1">Tuyệt vời! Đã hoàn thành mọi việc</h4>
                <p className="text-xs text-neutral-400 mb-4">
                  Không còn nhiệm vụ nào tồn đọng. Hãy thư giãn hoặc đặt thêm mục tiêu mới.
                </p>
                <Link
                  href="/tasks"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm công việc
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700 flex items-center justify-between gap-3 transition group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="w-5 h-5 rounded-lg border border-neutral-600 hover:border-indigo-400 flex items-center justify-center flex-shrink-0 transition"
                      >
                        {task.status === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </button>
                      <div className="overflow-hidden">
                        <span className="block text-sm font-medium text-neutral-200 truncate">
                          {task.title}
                        </span>
                        {task.project && (
                          <span className="inline-block text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.2 rounded-md mt-0.5">
                            {task.project.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Pomodoro link directly from dashboard */}
                      <Link
                        href={`/pomodoro?taskId=${task.id}`}
                        className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs transition"
                        title="Bắt đầu Pomodoro cho việc này"
                      >
                        <Timer className="w-3.5 h-3.5" />
                      </Link>

                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          task.priority === "urgent"
                            ? "bg-rose-500/20 text-rose-300"
                            : task.priority === "high"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HABITS & QUICK ACTIONS (1 Col) */}
          <div className="space-y-6">
            {/* Habits Today Grid */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Điểm danh thói quen</span>
                </h3>
                <Link href="/habits" className="text-xs text-indigo-400 hover:underline">
                  Quản lý
                </Link>
              </div>

              {habits.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-500">
                  Chưa có thói quen.{" "}
                  <Link href="/habits" className="text-indigo-400 underline">
                    Tạo thói quen ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {habits.map((habit) => (
                    <button
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id, habit.completedToday)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        habit.completedToday
                          ? "border-emerald-500/30 bg-emerald-950/20 text-white"
                          : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                            habit.completedToday
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-neutral-700"
                          }`}
                        >
                          {habit.completedToday && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span
                            className={`block text-xs font-semibold ${
                              habit.completedToday ? "line-through text-neutral-400" : "text-white"
                            }`}
                          >
                            {habit.title}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            Streak: {habit.streak} ngày liên tục
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="p-4 rounded-3xl border border-neutral-800/80 bg-neutral-900/40">
              <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Truy cập các Module
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/calendar"
                  className="p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 font-medium flex items-center gap-2 transition"
                >
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Lịch biểu</span>
                </Link>
                <Link
                  href="/journal"
                  className="p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 font-medium flex items-center gap-2 transition"
                >
                  <BookMarked className="w-4 h-4 text-purple-400" />
                  <span>Viết nhật ký</span>
                </Link>
                <Link
                  href="/health"
                  className="p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 font-medium flex items-center gap-2 transition"
                >
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  <span>Sức khỏe</span>
                </Link>
                <Link
                  href="/analytics"
                  className="p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 font-medium flex items-center gap-2 transition"
                >
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Báo cáo 360°</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
