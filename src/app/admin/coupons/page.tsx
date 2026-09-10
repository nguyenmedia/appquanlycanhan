"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
} from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("20");
  const [maxRedemptions, setMaxRedemptions] = useState("100");
  const [validDays, setValidDays] = useState("90");
  const [minimumAmount, setMinimumAmount] = useState("100000");
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const loadCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      if (json.success) setCoupons(json.coupons);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          discountType,
          discountValue: Number(discountValue),
          maxRedemptions: Number(maxRedemptions),
          validDays: Number(validDays),
          minimumAmount: Number(minimumAmount),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCode("");
        setName("");
        setIsModalOpen(false);
        showToast(`Đã tạo mã ${code.toUpperCase()} thành công!`);
        loadCoupons();
      } else {
        alert(json.error || "Lỗi tạo coupon");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      loadCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!confirm(`Xác nhận xóa mã coupon "${codeName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("Đã xóa mã coupon");
        loadCoupons();
      }
    } catch (e) {
      alert("Lỗi kết nối");
    }
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    showToast(`Đã sao chép mã: ${c}`);
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-amber-400" />
            <span>Quản Trị Mã Giảm Giá (Coupons)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Tạo chiến dịch khuyến mãi, mã giảm giá theo phần trăm (%) hoặc số tiền cố định (VNĐ)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mã giảm giá mới</span>
        </button>
      </div>

      {/* COUPONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-3xl">
            {loading ? "Đang tải danh sách coupon..." : "Chưa có mã giảm giá nào."}
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                c.isActive
                  ? "border-neutral-800 bg-neutral-900/70 hover:border-neutral-700"
                  : "border-neutral-800/40 bg-neutral-950/40 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-amber-400 font-mono tracking-wider flex items-center gap-1.5">
                    {c.code}
                    <button
                      onClick={() => copyCode(c.code)}
                      className="p-1 text-neutral-400 hover:text-white"
                      title="Sao chép mã"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    c.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-neutral-800 text-neutral-500 border-neutral-700"
                  }`}>
                    {c.isActive ? "Đang áp dụng" : "Đã tạm dừng"}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white mt-1">
                  {c.name || "Khuyến mãi"}
                </div>

                <div className="mt-3 p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Mức giảm:</span>
                    <strong className="text-emerald-400">
                      {c.discountType === "percentage" ? `${c.discountValue}%` : `${c.discountValue.toLocaleString("vi-VN")}đ`}
                    </strong>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Lượt đã dùng:</span>
                    <strong className="text-white font-mono">{c.timesUsed || 0} / {c.maxRedemptions || "∞"}</strong>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Hạn dùng:</span>
                    <span className="text-neutral-400">
                      {c.validUntil ? new Date(c.validUntil).toLocaleDateString("vi-VN") : "Vô thời hạn"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
                <button
                  onClick={() => handleToggle(c.id, c.isActive)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] ${
                    c.isActive
                      ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                      : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  {c.isActive ? "Tạm dừng" : "Kích hoạt"}
                </button>

                <button
                  onClick={() => handleDelete(c.id, c.code)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-rose-400 transition"
                  title="Xóa mã coupon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: CREATE COUPON */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Tạo Mã Khuyến Mãi Mới</span>
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Mã coupon (viết hoa liền nhau) *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SALE50, TET2026..."
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Tên chương trình / Mô tả</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Khuyến mãi mùa hè, Quà tặng bạn mới..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Loại giảm</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">
                    {discountType === "percentage" ? "Mức giảm (%)" : "Mức giảm (VNĐ)"} *
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Số lượt dùng tối đa</label>
                  <input
                    type="number"
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Hạn dùng (ngày)</label>
                  <input
                    type="number"
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
              >
                Tạo mã ngay
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
