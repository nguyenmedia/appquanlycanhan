"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import UpgradeModal from "@/components/UpgradeModal";
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  CheckSquare,
  Sparkles,
} from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("career");
  const [targetValue, setTargetValue] = useState("100");
  const [unit, setUnit] = useState("%");
  const [targetDate, setTargetDate] = useState("");
  const [milestonesInput, setMilestonesInput] = useState("");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const loadGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      const json = await res.json();
      if (json.success) setGoals(json.goals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const milestones = milestonesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          targetValue: Number(targetValue) || 100,
          unit,
          targetDate: targetDate || null,
          milestones,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTitle("");
        setDescription("");
        setMilestonesInput("");
        setIsModalOpen(false);
        loadGoals();
      } else if (json.requiresUpgrade) {
        setUpgradeMessage(json.error);
        setUpgradeModalOpen(true);
      } else {
        alert(json.error || "Lỗi tạo mục tiêu");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: goalId,
          toggleMilestoneId: milestoneId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        loadGoals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa mục tiêu này?")) return;
    setGoals(goals.filter((g) => g.id !== id));
    try {
      await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell>
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Đạt giới hạn mục tiêu gói Free"
        description={upgradeMessage || "Gói miễn phí giới hạn tối đa 5 mục tiêu. Hãy nâng cấp Pro để tạo không giới hạn."}
        featureName="Không giới hạn Goals"
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Target className="w-6 h-6 text-rose-400" />
              <span>Mục tiêu Dài hạn & OKR (Goals)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Thiết lập mục tiêu lớn, phân rã cột mốc (Milestones) và đo lường tiến độ chính xác
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mục tiêu mới</span>
          </button>
        </div>

        {/* GOALS LIST */}
        {goals.length === 0 ? (
          <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
            <Target className="w-12 h-12 text-rose-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">Chưa có mục tiêu nào</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Mục tiêu rõ ràng là bước đầu tiên để biến những điều vô hình thành hữu hình.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow"
            >
              Đặt mục tiêu đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                        {goal.category}
                      </span>
                      <h3 className="font-bold text-lg text-white mt-1.5">{goal.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-neutral-600 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-neutral-400 mb-4">{goal.description}</p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-neutral-400">Tiến độ hiện tại</span>
                      <span className="text-rose-400">
                        {goal.currentProgress} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (goal.currentProgress / goal.targetValue) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Milestones list */}
                  {goal.milestones?.length > 0 && (
                    <div className="space-y-2 mb-4 bg-neutral-950/50 p-3 rounded-2xl border border-neutral-800/80">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Cột mốc thực hiện
                      </span>
                      {goal.milestones.map((ms: any) => (
                        <button
                          key={ms.id}
                          type="button"
                          onClick={() => handleToggleMilestone(goal.id, ms.id)}
                          className="w-full flex items-center gap-2.5 text-left text-xs py-1 transition group"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              ms.isCompleted
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-neutral-700 group-hover:border-neutral-500"
                            }`}
                          >
                            {ms.isCompleted && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span
                            className={
                              ms.isCompleted ? "line-through text-neutral-500" : "text-neutral-300"
                            }
                          >
                            {ms.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
                  <span className="capitalize font-medium">Trạng thái: {goal.status}</span>
                  {goal.targetDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(goal.targetDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Thiết lập mục tiêu mới</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tiêu đề mục tiêu</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Đạt 1,000 khách hàng trả phí"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Mô tả / Ý nghĩa</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tại sao mục tiêu này quan trọng?"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Lĩnh vực</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="career">Sự nghiệp (Career)</option>
                      <option value="financial">Tài chính (Financial)</option>
                      <option value="health">Sức khỏe (Health)</option>
                      <option value="personal">Cá nhân (Personal)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Chỉ tiêu đích</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        className="w-2/3 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="%"
                        className="w-1/3 bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Cột mốc chia nhỏ (Mỗi dòng 1 cột mốc)
                  </label>
                  <textarea
                    value={milestonesInput}
                    onChange={(e) => setMilestonesInput(e.target.value)}
                    placeholder="Xây dựng xong MVP&#10;Ra mắt 100 khách đầu tiên&#10;Tối ưu tỷ lệ chuyển đổi"
                    rows={3}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Ngày mục tiêu</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
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
                    Lưu mục tiêu
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
