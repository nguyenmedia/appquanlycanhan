"use client";

import React, { useState, useEffect, Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import { useSearchParams } from "next/navigation";
import {
  BookMarked,
  Sparkles,
  Smile,
  Calendar,
  Save,
  Heart,
} from "lucide-react";

function JournalContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"entry" | "gratitude">(
    queryTab === "gratitude" ? "gratitude" : "entry"
  );
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (queryTab === "gratitude" || queryTab === "entry") {
      setActiveTab(queryTab);
    }
  }, [queryTab]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState(4);
  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [learnings, setLearnings] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadEntries = async () => {
    try {
      const res = await fetch("/api/journal");
      const json = await res.json();
      if (json.success) {
        setEntries(json.entries);
        const todayEntry = json.entries.find((e: any) => e.date === date);
        if (todayEntry) {
          setMood(todayEntry.mood);
          setTitle(todayEntry.title || "");
          setReflection(todayEntry.reflection || "");
          setGratitude(todayEntry.gratitude || "");
          setLearnings(todayEntry.learnings || "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [date]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          mood,
          title,
          reflection,
          gratitude,
          learnings,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        loadEntries();
      } else {
        alert(json.error || "Lỗi lưu nhật ký");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const moods = [
    { score: 1, label: "Tệ", emoji: "😞" },
    { score: 2, label: "Kém", emoji: "🙁" },
    { score: 3, label: "Bình thường", emoji: "😐" },
    { score: 4, label: "Tốt", emoji: "🙂" },
    { score: 5, label: "Tuyệt vời", emoji: "🤩" },
  ];

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BookMarked className="w-6 h-6 text-purple-400" />
            <span>Nhật ký Phản tư (Daily Journal)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Ghi lại cảm xúc, lòng biết ơn và bài học mỗi ngày để nuôi dưỡng tâm thức tích cực
          </p>
        </div>

        {/* SUB-TABS: ENTRY vs GRATITUDE */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab("entry")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "entry" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Viết nhật ký ngày ({entries.length})
            </button>
            <button
              onClick={() => setActiveTab("gratitude")}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === "gratitude" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Tâm trạng & Lòng biết ơn ({entries.filter((e) => e.gratitude).length})</span>
            </button>
          </div>
        </div>

        {/* TAB 2: GRATITUDE WALL & MOOD TRACKER */}
        {activeTab === "gratitude" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900 to-rose-950/30">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Khoảnh khắc biết ơn</span>
                </div>
                <div className="text-3xl font-black text-rose-400">
                  {entries.filter((e) => e.gratitude).length} điều
                </div>
                <div className="text-[11px] text-neutral-500 mt-2">
                  Nuôi dưỡng năng lượng tích cực
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-amber-400" />
                  <span>Tâm trạng trung bình</span>
                </div>
                <div className="text-3xl font-black text-white">
                  {entries.length > 0
                    ? (entries.reduce((sum, e) => sum + (e.mood || 3), 0) / entries.length).toFixed(1)
                    : "4.0"}{" "}
                  / 5.0
                </div>
                <div className="text-[11px] text-neutral-500 mt-2">
                  Trạng thái cảm xúc ổn định
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Bài học đúc kết</span>
                </div>
                <div className="text-3xl font-black text-indigo-400">
                  {entries.filter((e) => e.learnings).length} bài học
                </div>
                <div className="text-[11px] text-neutral-500 mt-2">
                  Trí tuệ tích lũy từ cuộc sống
                </div>
              </div>
            </div>

            {/* Gratitude Notes Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entries.filter((e) => e.gratitude).length === 0 ? (
                <div className="col-span-2 p-12 text-center text-xs text-neutral-500 rounded-3xl border border-neutral-800 bg-neutral-900/40">
                  Chưa có dòng biết ơn nào. Chuyển sang tab "Viết nhật ký ngày" để ghi lại điều bạn biết ơn hôm nay!
                </div>
              ) : (
                entries
                  .filter((e) => e.gratitude)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="p-5 rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/90 to-neutral-900/50 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                        <span className="font-semibold text-white">{entry.date}</span>
                        <span className="text-lg">
                          {moods.find((m) => m.score === entry.mood)?.emoji || "🙂"}
                        </span>
                      </div>
                      <div className="text-xs text-rose-300 font-medium leading-relaxed italic">
                        "{entry.gratitude}"
                      </div>
                      {entry.learnings && (
                        <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                          <strong className="text-neutral-300">Bài học:</strong> {entry.learnings}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 1: DAILY ENTRY FORM & HISTORY */}
        {activeTab === "entry" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* EDITOR COLUMN (2 Cols) */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSave} className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-5 shadow-xl">
              {/* Date & Mood Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-medium">Tâm trạng:</span>
                  <div className="flex gap-1.5">
                    {moods.map((m) => (
                      <button
                        key={m.score}
                        type="button"
                        onClick={() => setMood(m.score)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition ${
                          mood === m.score
                            ? "bg-indigo-600 scale-110 shadow-md shadow-indigo-600/30"
                            : "bg-neutral-800 hover:bg-neutral-700 opacity-60 hover:opacity-100"
                        }`}
                        title={m.label}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Tiêu đề ngày hôm nay
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Một ngày làm việc nhiều cảm hứng..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Phản tư trong ngày (Reflection)
                </label>
                <textarea
                  required
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Hôm nay bạn đã làm được những gì? Điều gì đem lại cho bạn cảm xúc đáng nhớ?"
                  rows={5}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  3 điều bạn biết ơn (Gratitude)
                </label>
                <textarea
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="1. Biết ơn vì có sức khỏe tốt...&#10;2. Biết ơn vì gia đình luôn yêu thương...&#10;3. Biết ơn vì những bài học hôm nay..."
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Bài học rút ra (Learnings)
                </label>
                <input
                  type="text"
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  placeholder="Ví dụ: Cần kiên nhẫn hơn khi đối diện với thử thách."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                {savedSuccess ? (
                  <span className="text-xs text-emerald-400 font-semibold animate-in fade-in">
                    ✓ Đã lưu nhật ký thành công!
                  </span>
                ) : (
                  <span className="text-xs text-neutral-500">Tự động gắn thẻ ngày theo múi giờ cá nhân</span>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Đang lưu..." : "Lưu nhật ký"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* RECENT ENTRIES SIDEBAR (1 Col) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
              Các ngày đã ghi gần đây
            </h3>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setDate(entry.date);
                    setMood(entry.mood);
                    setTitle(entry.title || "");
                    setReflection(entry.reflection);
                    setGratitude(entry.gratitude || "");
                    setLearnings(entry.learnings || "");
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition ${
                    date === entry.date
                      ? "border-indigo-500 bg-indigo-950/30 text-white"
                      : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">{entry.date}</span>
                    <span className="text-base">{moods.find((m) => m.score === entry.mood)?.emoji}</span>
                  </div>
                  <div className="text-xs font-medium text-neutral-300 line-clamp-1">
                    {entry.title || "Nhật ký không đề"}
                  </div>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                    {entry.reflection}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </AppShell>
  );
}

export default function JournalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm text-neutral-400">
          Đang tải nhật ký...
        </div>
      }
    >
      <JournalContent />
    </Suspense>
  );
}
