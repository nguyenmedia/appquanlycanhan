"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  HeartPulse,
  Plus,
  Scale,
  Moon,
  Droplets,
  Activity,
  Smile,
  Save,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function HealthPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [waterMl, setWaterMl] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [moodScore, setMoodScore] = useState(4);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/health");
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs);
        const todayLog = json.logs.find((l: any) => l.date === date);
        if (todayLog) {
          if (todayLog.weightKg) setWeightKg(String(todayLog.weightKg));
          if (todayLog.sleepHours) setSleepHours(String(todayLog.sleepHours));
          if (todayLog.waterMl) setWaterMl(String(todayLog.waterMl));
          if (todayLog.exerciseMinutes) setExerciseMinutes(String(todayLog.exerciseMinutes));
          if (todayLog.moodScore) setMoodScore(todayLog.moodScore);
          if (todayLog.notes) setNotes(todayLog.notes);
        } else {
          setWeightKg("");
          setSleepHours("");
          setWaterMl("");
          setExerciseMinutes("");
          setNotes("");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [date]);

  const handleQuickAddWater = (ml: number) => {
    const current = Number(waterMl) || 0;
    setWaterMl(String(current + ml));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          weightKg: weightKg ? Number(weightKg) : null,
          sleepHours: sleepHours ? Number(sleepHours) : null,
          waterMl: waterMl ? Number(waterMl) : null,
          exerciseMinutes: exerciseMinutes ? Number(exerciseMinutes) : null,
          moodScore,
          notes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        loadLogs();
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const waterNum = Number(waterMl) || 0;
  const waterPct = Math.min(100, Math.round((waterNum / 2000) * 100));

  const sleepNum = Number(sleepHours) || 0;
  const sleepPct = Math.min(100, Math.round((sleepNum / 8) * 100));

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <HeartPulse className="w-6 h-6 text-rose-400" />
              <span>Theo Dõi Sức Khỏe (Health Tracker)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kiểm soát giấc ngủ, mức độ nạp nước, vận động thể chất và cân nặng định kỳ
            </p>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                ✓ Đã lưu thành công!
              </span>
            )}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* METRICS PREVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Lượng nước đã uống</span>
              <span className="text-cyan-400 font-bold">{waterPct}%</span>
            </div>
            <div className="text-2xl font-bold text-white">{waterNum} ml</div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-400 h-full transition-all" style={{ width: `${waterPct}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Giấc ngủ hôm qua</span>
              <span className="text-purple-400 font-bold">{sleepPct}%</span>
            </div>
            <div className="text-2xl font-bold text-white">{sleepNum} giờ</div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-400 h-full transition-all" style={{ width: `${sleepPct}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Vận động thể thao</span>
              <span className="text-emerald-400 font-bold">Mục tiêu 45p</span>
            </div>
            <div className="text-2xl font-bold text-white">{exerciseMinutes || 0} phút</div>
            <div className="text-[11px] text-neutral-500 mt-1">Cardio / Gym / Đi bộ</div>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Cân nặng cơ thể</span>
              <span className="text-rose-400 font-bold">Ổn định</span>
            </div>
            <div className="text-2xl font-bold text-white">{weightKg || "--"} kg</div>
            <div className="text-[11px] text-neutral-500 mt-1">Chỉ số thể trọng</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORM (2 Cols) */}
          <form onSubmit={handleSave} className="lg:col-span-2 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-sm text-white">Nhập số liệu ngày: {date}</h3>
              <span className="text-xs text-neutral-500">Tự động đồng bộ với Báo cáo & Dashboard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Water Card with Quick Buttons */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                <label className="text-xs text-neutral-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    Lượng nước uống (ml)
                  </span>
                  <span className="text-cyan-400 text-[11px]">Chuẩn 2,000ml</span>
                </label>
                <input
                  type="number"
                  step="50"
                  value={waterMl}
                  onChange={(e) => setWaterMl(e.target.value)}
                  placeholder="2000"
                  className="w-full bg-transparent text-2xl font-black text-white focus:outline-none"
                />
                <div className="flex items-center gap-2 pt-1 border-t border-neutral-850">
                  <button
                    type="button"
                    onClick={() => handleQuickAddWater(250)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-xs font-semibold transition"
                  >
                    +250ml
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddWater(500)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-xs font-semibold transition"
                  >
                    +500ml
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterMl("2000")}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/20 text-xs font-semibold transition ml-auto"
                  >
                    Đạt 2L
                  </button>
                </div>
              </div>

              {/* Sleep Card */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                <label className="text-xs text-neutral-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <Moon className="w-4 h-4 text-purple-400" />
                    Thời gian ngủ (giờ)
                  </span>
                  <span className="text-purple-400 text-[11px]">Chuẩn 7-8h</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="7.5"
                  className="w-full bg-transparent text-2xl font-black text-white focus:outline-none"
                />
                <div className="flex items-center gap-2 pt-1 text-xs text-neutral-500 border-t border-neutral-850">
                  <span>Giấc ngủ sâu hỗ trợ phục hồi cơ & trí nhớ</span>
                </div>
              </div>

              {/* Weight Card */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                <label className="text-xs text-neutral-400 flex items-center gap-1.5 font-semibold text-white">
                  <Scale className="w-4 h-4 text-rose-400" />
                  Cân nặng hiện tại (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="65.0"
                  className="w-full bg-transparent text-2xl font-black text-white focus:outline-none"
                />
              </div>

              {/* Exercise Card */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                <label className="text-xs text-neutral-400 flex items-center gap-1.5 font-semibold text-white">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Thời gian vận động (phút)
                </label>
                <input
                  type="number"
                  value={exerciseMinutes}
                  onChange={(e) => setExerciseMinutes(e.target.value)}
                  placeholder="45"
                  className="w-full bg-transparent text-2xl font-black text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Ghi chú & Cảm nhận sức khỏe</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Chạy bộ 5km buổi sáng, uống đủ 2L nước, cơ thể sảng khoái..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Đang lưu..." : "Lưu chỉ số sức khỏe"}</span>
              </button>
            </div>
          </form>

          {/* LOGS HISTORY (1 Col) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Lịch sử ghi gần đây ({logs.length})
            </h3>
            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500 rounded-2xl border border-neutral-800">
                  Chưa có bản ghi sức khỏe nào.
                </div>
              ) : (
                logs.map((l) => (
                  <div key={l.id} className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/60 text-xs space-y-1">
                    <div className="font-semibold text-white flex justify-between">
                      <span>{l.date}</span>
                      <span className="text-rose-400">{l.weightKg ? `${l.weightKg} kg` : ""}</span>
                    </div>
                    <div className="text-neutral-400 text-[11px]">
                      Ngủ: <strong className="text-neutral-200">{l.sleepHours || 0}h</strong> • Nước: <strong className="text-neutral-200">{l.waterMl || 0}ml</strong> • Vận động: <strong className="text-neutral-200">{l.exerciseMinutes || 0}p</strong>
                    </div>
                    {l.notes && <p className="text-[10px] text-neutral-500 italic mt-1">{l.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
