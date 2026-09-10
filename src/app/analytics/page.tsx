"use client";

import React, { useState, useEffect, Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Zap,
  Target,
  Wallet,
  Clock,
  Award,
  HeartPulse,
  BookMarked,
  Timer,
  Droplets,
  Moon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
} from "lucide-react";

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"all" | "productivity" | "finance" | "wellness">(
    (queryTab as any) || "all"
  );
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [pomodoroStats, setPomodoroStats] = useState<any>(null);
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (queryTab && ["all", "productivity", "finance", "wellness"].includes(queryTab)) {
      setActiveTab(queryTab as any);
    }
  }, [queryTab]);

  useEffect(() => {
    async function loadAll() {
      try {
        const [tRes, hRes, gRes, fRes, pRes, hlRes, jRes] = await Promise.all([
          fetch("/api/tasks").then((r) => r.json()),
          fetch("/api/habits").then((r) => r.json()),
          fetch("/api/goals").then((r) => r.json()),
          fetch("/api/finance").then((r) => r.json()),
          fetch("/api/pomodoro").then((r) => r.json()),
          fetch("/api/health").then((r) => r.json()),
          fetch("/api/journal").then((r) => r.json()),
        ]);
        if (tRes.tasks) setTasks(tRes.tasks);
        if (hRes.habits) setHabits(hRes.habits);
        if (gRes.goals) setGoals(gRes.goals);
        if (fRes.summary) setFinance(fRes);
        if (pRes.success) setPomodoroStats(pRes);
        if (hlRes.logs) setHealthLogs(hlRes.logs);
        if (jRes.entries) setJournalEntries(jRes.entries);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Productivity Calculations
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const habitsCompletedToday = habits.filter((h) => h.completedToday).length;
  const habitsAdherence = habits.length > 0 ? Math.round((habitsCompletedToday / habits.length) * 100) : 0;
  const netCashflow = finance?.summary?.netCashflow || 0;
  const totalFocusMinutes = pomodoroStats?.totalFocusMinutes || 0;
  const completedFocusSessions = pomodoroStats?.sessions?.length || 0;

  // Health Averages
  const avgSleep =
    healthLogs.length > 0
      ? (healthLogs.reduce((sum, l) => sum + (l.sleepHours || 0), 0) / healthLogs.length).toFixed(1)
      : "7.5";
  const avgWater =
    healthLogs.length > 0
      ? Math.round(healthLogs.reduce((sum, l) => sum + (l.waterMl || 0), 0) / healthLogs.length)
      : 1800;

  // Composite Productivity Score (0 - 100)
  const taskScore = Math.min(40, Math.round((taskCompletionRate / 100) * 40));
  const habitScore = Math.min(30, Math.round((habitsAdherence / 100) * 30));
  const focusScore = Math.min(30, Math.round((completedFocusSessions / 4) * 30));
  const totalProductivityScore = Math.max(30, taskScore + habitScore + focusScore);

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
              <span>Báo cáo & Phân tích Toàn diện (Analytics)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Báo cáo hiệu suất hợp nhất từ Công việc, Thói quen, Deep Work, Dòng tiền và Sức khỏe
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Điểm Năng Suất Tổng Thể: <strong>{totalProductivityScore}/100</strong></span>
          </div>
        </div>

        {/* SUB-TABS: ALL / PRODUCTIVITY / FINANCE / WELLNESS */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="inline-flex flex-wrap p-1 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs gap-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "all" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Báo cáo tổng hợp 360°
            </button>
            <button
              onClick={() => setActiveTab("productivity")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "productivity" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Xu hướng Năng suất
            </button>
            <button
              onClick={() => setActiveTab("finance")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "finance" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Phân tích Tài chính
            </button>
            <button
              onClick={() => setActiveTab("wellness")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "wellness" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Sức khỏe & Thân tâm
            </button>
          </div>
        </div>

        {/* 4 PRIMARY METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-lg">
            <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Hoàn thành công việc
              </span>
              <span className="text-white font-bold">{completedTasks}/{tasks.length}</span>
            </div>
            <div className="text-3xl font-black text-white mt-1">{taskCompletionRate}%</div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${taskCompletionRate}%` }} />
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-lg">
            <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Kỷ luật thói quen hôm nay
              </span>
              <span className="text-emerald-400 font-bold">{habitsCompletedToday}/{habits.length}</span>
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-1">{habitsAdherence}%</div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${habitsAdherence}%` }} />
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-lg">
            <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-orange-400" />
                Deep Work Pomodoro
              </span>
              <span className="text-orange-400 font-bold">{completedFocusSessions} phiên</span>
            </div>
            <div className="text-3xl font-black text-orange-400 mt-1">{totalFocusMinutes} phút</div>
            <div className="text-[11px] text-neutral-500 mt-2">
              Tương đương {(totalFocusMinutes / 60).toFixed(1)} giờ tập trung sâu
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-lg">
            <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-amber-400" />
                Tiết kiệm ròng tháng
              </span>
              <span className="text-emerald-400 font-bold">Dương</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1 truncate">
              {netCashflow >= 0 ? "+" : ""}{netCashflow.toLocaleString("vi-VN")}đ
            </div>
            <div className="text-[11px] text-neutral-500 mt-2">
              Dòng tiền sau khi trừ chi phí
            </div>
          </div>
        </div>

        {/* DETAILED PILLARS BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health & Wellness Card */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/70 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <span>Chỉ số Thể lực & Giấc ngủ</span>
              </h3>
              <Link href="/health" className="text-xs text-indigo-400 hover:underline">
                Xem chi tiết →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                  Trung bình ngủ
                </span>
                <div className="text-xl font-bold text-white mt-1">{avgSleep} giờ / ngày</div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  Nước uống TB
                </span>
                <div className="text-xl font-bold text-white mt-1">{avgWater} ml / ngày</div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Bạn đang duy trì lượng nước và giấc ngủ khá đồng đều. Đề xuất đi ngủ trước 23:00 để giữ trạng thái tinh thần tốt nhất.
            </p>
          </div>

          {/* Goals & Vision Progress */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/70 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" />
                <span>Mục tiêu Cuộc đời (OKRs)</span>
              </h3>
              <Link href="/goals" className="text-xs text-indigo-400 hover:underline">
                Xem tất cả ({goals.length}) →
              </Link>
            </div>

            {goals.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">Chưa có mục tiêu nào được tạo.</p>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((g) => (
                  <div key={g.id} className="space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-200">
                      <span className="font-semibold truncate">{g.title}</span>
                      <span className="text-rose-400 font-bold">
                        {Math.round((g.currentValue / g.targetValue) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Journal Reflection Mood */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/70 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-purple-400" />
                <span>Nhật ký & Tâm thức</span>
              </h3>
              <Link href="/journal" className="text-xs text-indigo-400 hover:underline">
                Viết nhật ký →
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
              <span className="text-neutral-400 block text-[11px] mb-1">Bản ghi nhật ký gần nhất:</span>
              {journalEntries.length > 0 ? (
                <div>
                  <div className="font-bold text-white">{journalEntries[0].title || "Phản tư ngày"}</div>
                  <p className="text-neutral-400 line-clamp-2 mt-1 italic">
                    "{journalEntries[0].reflection}"
                  </p>
                </div>
              ) : (
                <span className="text-neutral-500">Chưa viết nhật ký hôm nay.</span>
              )}
            </div>

            <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1">
              <span>Số ngày đã ghi nhận: <strong>{journalEntries.length} ngày</strong></span>
              <span className="text-purple-400 font-semibold">Tâm trạng: Tích cực 🤩</span>
            </div>
          </div>
        </div>

        {/* ACTIONABLE AI INSIGHTS */}
        <div className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-indigo-950/30 via-neutral-900/80 to-neutral-900 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Đánh Giá Năng Suất & Khuyến Nghị Tự Động</span>
            </h3>
            <Link
              href="/ai"
              className="text-xs font-semibold text-pink-300 hover:text-pink-200 flex items-center gap-1"
            >
              <span>Trò chuyện với AI Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80">
              <h4 className="text-xs font-bold text-emerald-400 mb-2">Thế mạnh tuần qua</h4>
              <ul className="text-xs text-neutral-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Duy trì thói quen kiên định với tỷ lệ hoàn thành đạt {habitsAdherence}%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Đã tích lũy được {totalFocusMinutes} phút Deep Work tập trung chất lượng cao.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80">
              <h4 className="text-xs font-bold text-amber-400 mb-2">Kế hoạch tối ưu tuần tới</h4>
              <ul className="text-xs text-neutral-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">→</span>
                  <span>Giải quyết các công việc có hạn chót sắp đến trong trang Lịch biểu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">→</span>
                  <span>Rà soát các khoản nợ phải thu trong sổ nợ Tài chính để thu hồi tiền mặt.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm text-neutral-400">
          Đang tổng hợp báo cáo 360°...
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}

