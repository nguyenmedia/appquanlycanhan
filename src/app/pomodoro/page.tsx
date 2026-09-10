"use client";

import React, { useState, useEffect, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Flame,
  CheckSquare,
  Volume2,
  VolumeX,
  History,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PomodoroContent() {
  const searchParams = useSearchParams();
  const queryTaskId = searchParams.get("taskId");
  const queryTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"timer" | "history">(queryTab === "history" ? "history" : "timer");
  const [mode, setMode] = useState<"work" | "short_break" | "long_break">("work");

  useEffect(() => {
    if (queryTab === "history" || queryTab === "timer") {
      setActiveTab(queryTab);
    }
  }, [queryTab]);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [sessionsHistory, setSessionsHistory] = useState<any[]>([]);

  // Interconnection with Tasks
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);

  // Audio Context for crisp bell chime
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log("Audio play error", e);
    }
  };

  // Load Pomodoro stats and active Tasks
  const loadData = async () => {
    try {
      const [pomoRes, tasksRes] = await Promise.all([
        fetch("/api/pomodoro").then((r) => r.json()),
        fetch("/api/tasks").then((r) => r.json()),
      ]);

      if (pomoRes.success) {
        setCompletedSessions(pomoRes.sessions?.length || 0);
        setTotalFocusMinutes(pomoRes.totalFocusMinutes || 0);
        setSessionsHistory(pomoRes.sessions || []);
      }

      if (tasksRes.tasks) {
        // filter for active tasks (not done)
        const active = tasksRes.tasks.filter((t: any) => t.status !== "done");
        setTasks(active);

        // Pre-select if query param exists
        if (queryTaskId) {
          const match = tasksRes.tasks.find((t: any) => t.id === queryTaskId);
          if (match) {
            setSelectedTaskId(match.id);
            setSelectedTask(match);
          }
        } else if (active.length > 0 && !selectedTaskId) {
          setSelectedTaskId(active[0].id);
          setSelectedTask(active[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryTaskId]);

  useEffect(() => {
    if (selectedTaskId && tasks.length > 0) {
      const found = tasks.find((t) => t.id === selectedTaskId);
      setSelectedTask(found || null);
    }
  }, [selectedTaskId, tasks]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleFinishSession();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleFinishSession = async () => {
    const minutes = mode === "work" ? 25 : mode === "short_break" ? 5 : 15;
    playBeep();

    try {
      const res = await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: minutes,
          type: mode,
          taskId: selectedTaskId || null,
        }),
      });
      const json = await res.json();

      if (json.success) {
        if (mode === "work") {
          setCompletedSessions((prev) => prev + 1);
          setTotalFocusMinutes((prev) => prev + 25);
          setCompletedModalOpen(true);
        }
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkTaskDone = async () => {
    if (!selectedTaskId) return;
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTaskId, status: "done" }),
      });
      setCompletedModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const switchMode = (newMode: "work" | "short_break" | "long_break") => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "work") setTimeLeft(25 * 60);
    else if (newMode === "short_break") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Timer className="w-6 h-6 text-orange-400" />
              <span>Đồng hồ Tập trung (Pomodoro Focus)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kỹ thuật Pomodoro khoa học: 25 phút làm việc sâu, gắn kết trực tiếp với Công việc & Nhiệm vụ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
              <span>{soundEnabled ? "Âm thanh: Bật" : "Âm thanh: Tắt"}</span>
            </button>
            <Link
              href="/tasks"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Quản lý Công việc</span>
            </Link>
          </div>
        </div>

        {/* SUB-TABS: TIMER vs HISTORY */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab("timer")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "timer" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Đồng hồ tập trung
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === "history" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5 text-orange-400" />
              <span>Lịch sử Deep Work ({sessionsHistory.length})</span>
            </button>
          </div>
        </div>

        {/* 4 PRIMARY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <span className="text-xs text-neutral-400">Phiên hoàn thành</span>
            <div className="text-2xl font-bold text-white mt-1">{completedSessions} phiên</div>
          </div>
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <span className="text-xs text-neutral-400">Tổng Deep Work</span>
            <div className="text-2xl font-bold text-orange-400 mt-1">{totalFocusMinutes} phút</div>
          </div>
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <span className="text-xs text-neutral-400">Số giờ tương đương</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{(totalFocusMinutes / 60).toFixed(1)} giờ</div>
          </div>
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center gap-3">
            <Flame className="w-8 h-8 text-amber-400" />
            <div>
              <span className="text-xs text-neutral-400">Hiệu suất tập trung</span>
              <div className="text-sm font-bold text-white">Xuất sắc 🔥</div>
            </div>
          </div>
        </div>

        {/* TAB 1: TIMER VIEW */}
        {activeTab === "timer" && (
          <>
            {/* TASK SELECTOR ROW (Interconnection with Tasks module) */}
            <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-300 block">Công việc đang tập trung giải quyết:</span>
                  {selectedTask ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-semibold text-white">{selectedTask.title}</span>
                      {selectedTask.project && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">
                          {selectedTask.project.name}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-500">Chưa chọn công việc cụ thể</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Chọn công việc từ danh sách --</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} {t.project ? `(${t.project.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* MAIN TIMER CARD */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 sm:p-12 text-center shadow-2xl flex flex-col items-center relative overflow-hidden">
              {/* Ambient Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-600/10 blur-[90px] rounded-full pointer-events-none" />

              {/* Mode Switcher */}
              <div className="inline-flex p-1 rounded-2xl bg-neutral-950 border border-neutral-800 mb-8 z-10">
                <button
                  onClick={() => switchMode("work")}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
                    mode === "work" ? "bg-orange-600 text-white shadow-md shadow-orange-600/20" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Làm việc (25m)
                </button>
                <button
                  onClick={() => switchMode("short_break")}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
                    mode === "short_break" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Nghỉ ngắn (5m)
                </button>
                <button
                  onClick={() => switchMode("long_break")}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
                    mode === "long_break" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Nghỉ dài (15m)
                </button>
              </div>

              {/* Huge Timer Digits */}
              <div className="text-7xl sm:text-9xl font-extrabold font-mono tracking-tighter text-white mb-8 drop-shadow-lg z-10">
                {timeFormatted}
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-4 z-10">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center font-bold text-white shadow-xl transition active:scale-95 ${
                    isRunning
                      ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/25"
                      : "bg-gradient-brand hover:opacity-95 shadow-indigo-600/25"
                  }`}
                >
                  {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </button>
                <button
                  onClick={() => switchMode(mode)}
                  title="Đặt lại"
                  className="w-12 h-12 rounded-2xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Finish session early button */}
              {isRunning && (
                <button
                  onClick={handleFinishSession}
                  className="mt-6 text-xs text-neutral-400 hover:text-neutral-200 underline z-10 transition"
                >
                  Hoàn thành sớm & lưu phiên tập trung
                </button>
              )}
            </div>
          </>
        )}

        {/* SESSION HISTORY TABLE */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-orange-400" />
              <span>{activeTab === "history" ? "Toàn bộ lịch sử các phiên Deep Work" : "Lịch sử phiên gần đây"}</span>
            </h3>
            <span className="text-xs text-neutral-500">{sessionsHistory.length} phiên đã lưu</span>
          </div>

          {sessionsHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500">
              Chưa có phiên tập trung nào. Bắt đầu bấm giờ để lưu lại chuỗi Deep Work!
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {sessionsHistory.slice(0, 8).map((s: any) => (
                <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <div>
                      <span className="font-semibold text-white block">
                        {s.task ? s.task.title : "Phiên tự do không gắn việc"}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(s.startedAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-300 font-medium">
                      +{s.durationMinutes} phút
                    </span>
                    <span className="text-emerald-400 font-medium">✓ Xong</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SESSION FINISHED CELEBRATION MODAL */}
        {completedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Xuất Sắc! Hoàn Thành Phiên 25 Phút</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Bạn đã duy trì sự tập trung cao độ và đóng góp thêm 25 phút vào tổng thời gian Deep Work hôm nay.
              </p>

              {selectedTask && (
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-left">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Công việc vừa làm:</span>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedTask.title}</div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {selectedTask && (
                  <button
                    onClick={handleMarkTaskDone}
                    className="w-full py-3 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-95 transition"
                  >
                    Đánh dấu công việc này "Đã Hoàn Thành" ✓
                  </button>
                )}
                <button
                  onClick={() => setCompletedModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition"
                >
                  Nghỉ ngơi 5 phút (Short Break)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function PomodoroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] text-white p-8">Đang tải Pomodoro...</div>}>
      <PomodoroContent />
    </Suspense>
  );
}
