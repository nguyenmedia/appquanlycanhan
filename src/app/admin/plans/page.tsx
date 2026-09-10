"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Layers,
  Plus,
  Trash2,
  Sparkles,
  Zap,
} from "lucide-react";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit states
  const [priceMonthly, setPriceMonthly] = useState("");
  const [priceYearly, setPriceYearly] = useState("");
  const [description, setDescription] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [aiLimit, setAiLimit] = useState("");
  const [saving, setSaving] = useState(false);

  // New Plan states
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newPriceMonthly, setNewPriceMonthly] = useState("99000");
  const [newPriceYearly, setNewPriceYearly] = useState("990000");
  const [newDesc, setNewDesc] = useState("");
  const [newAiLimit, setNewAiLimit] = useState("50");
  const [addLoading, setAddLoading] = useState(false);

  const loadPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans");
      const json = await res.json();
      if (json.success) setPlans(json.plans);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const startEdit = (p: any) => {
    setEditingPlan(p);
    setPriceMonthly(String(p.priceMonthly));
    setPriceYearly(String(p.priceYearly));
    setDescription(p.description);
    setIsPopular(Boolean(p.isPopular));
    setIsActive(Boolean(p.isActive));
    const ai = p.limits?.find((l: any) => l.limitKey === "ai_credits")?.limitValue;
    setAiLimit(String(ai !== undefined ? ai : 20));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlan.id,
          priceMonthly: Number(priceMonthly),
          priceYearly: Number(priceYearly),
          description,
          isPopular,
          isActive,
          limits: {
            ai_credits: Number(aiLimit),
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingPlan(null);
        loadPlans();
      } else {
        alert(json.error || "Lỗi lưu cấu hình gói");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSlug) return;
    setAddLoading(true);

    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          slug: newSlug,
          priceMonthly: Number(newPriceMonthly),
          priceYearly: Number(newPriceYearly),
          description: newDesc,
          limits: {
            ai_credits: Number(newAiLimit),
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setNewName("");
        setNewSlug("");
        setNewDesc("");
        loadPlans();
      } else {
        alert(json.error || "Lỗi tạo gói cước");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Xác nhận xóa gói cước "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        loadPlans();
      } else {
        alert(json.error || "Không thể xóa gói");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span>Quản Trị Gói Dịch Vụ (Plan Builder)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cấu hình giá bán theo tháng / năm, hạn mức tài nguyên AI và huy hiệu nổi bật của từng gói
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo gói cước mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const aiLim = p.limits?.find((l: any) => l.limitKey === "ai_credits")?.limitValue;
          return (
            <div
              key={p.id}
              className={`p-6 rounded-3xl border transition flex flex-col justify-between relative ${
                p.isPopular
                  ? "border-amber-500/60 bg-gradient-to-b from-amber-500/10 via-neutral-900/90 to-neutral-900/70 shadow-xl shadow-amber-500/10"
                  : "border-neutral-800 bg-neutral-900/70"
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-extrabold uppercase shadow">
                  Phổ biến nhất
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">{p.name}</h3>
                    <span className="text-[10px] text-neutral-500 font-mono">Slug: {p.slug}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    p.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-neutral-800 text-neutral-500 border-neutral-700"
                  }`}>
                    {p.isActive ? "Hoạt động" : "Tạm ẩn"}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-800/80">
                  <div className="text-2xl font-black text-white">
                    {p.priceMonthly.toLocaleString("vi-VN")}đ
                    <span className="text-xs font-normal text-neutral-400"> / tháng</span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Gói năm: <strong className="text-neutral-200">{p.priceYearly.toLocaleString("vi-VN")}đ</strong>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 min-h-[40px] leading-relaxed">
                  {p.description}
                </p>

                <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-pink-400" /> Hạn mức AI Credit:
                    </span>
                    <strong className="text-white font-mono">{aiLim !== undefined ? aiLim : 20} / tháng</strong>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Số thuê bao kích hoạt:</span>
                    <strong className="text-amber-400 font-mono">{p._count?.subscriptions || 0} users</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-neutral-800">
                {!["free", "pro", "premium"].includes(p.slug) && (
                  <button
                    onClick={() => handleDeletePlan(p.id, p.name)}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-rose-400 text-xs transition"
                    title="Xóa gói"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => startEdit(p)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition flex-1 justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sửa giá & Hạn mức</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: EDIT PLAN */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Cấu Hình Gói: {editingPlan.name}</h3>
              <button type="button" onClick={() => setEditingPlan(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Giá theo tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Giá theo năm (VNĐ)</label>
                  <input
                    type="number"
                    value={priceYearly}
                    onChange={(e) => setPriceYearly(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Mô tả hiển thị</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Hạn mức AI Credits / tháng</label>
                <input
                  type="number"
                  value={aiLimit}
                  onChange={(e) => setAiLimit(e.target.value)}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>Gắn huy hiệu "Phổ biến nhất"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <span>Bật kích hoạt (Active)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD PLAN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePlan} className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Tạo Gói Cước Mới</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Tên gói cước *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: LifeOS Starter, LifeOS Team..."
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Slug định danh (viết liền không dấu) *</label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="starter, team_pass..."
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Giá tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={newPriceMonthly}
                    onChange={(e) => setNewPriceMonthly(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Giá năm (VNĐ)</label>
                  <input
                    type="number"
                    value={newPriceYearly}
                    onChange={(e) => setNewPriceYearly(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Mô tả gói</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả lợi ích của gói..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Hạn mức AI credits / tháng</label>
                <input
                  type="number"
                  value={newAiLimit}
                  onChange={(e) => setNewAiLimit(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
              >
                {addLoading ? "Đang tạo..." : "Xác nhận tạo gói"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
