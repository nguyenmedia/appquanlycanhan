"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Heart,
  DollarSign,
  Clock,
  Plus,
  Edit2,
  Tag,
  CheckCircle2,
  Phone,
  Mail,
  Sliders,
} from "lucide-react";

export default function AdminCRMPage() {
  const [pipeline, setPipeline] = useState<any>({
    lead: [],
    registered: [],
    trial: [],
    paid: [],
    active: [],
    at_risk: [],
    churned: [],
  });
  const [loading, setLoading] = useState(true);

  // Edit CRM Modal
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editStage, setEditStage] = useState("");
  const [editHealthScore, setEditHealthScore] = useState(100);
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPipeline = async () => {
    try {
      const res = await fetch("/api/admin/crm");
      const json = await res.json();
      if (json.success) setPipeline(json.pipeline);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const stages = [
    { id: "registered", label: "Mới đăng ký", color: "border-blue-500", bg: "bg-blue-500/10", badge: "text-blue-400" },
    { id: "trial", label: "Dùng thử (Trial)", color: "border-purple-500", bg: "bg-purple-500/10", badge: "text-purple-400" },
    { id: "paid", label: "Đã trả phí (Paid)", color: "border-emerald-500", bg: "bg-emerald-500/10", badge: "text-emerald-400" },
    { id: "active", label: "Tương tác cao (Active)", color: "border-cyan-500", bg: "bg-cyan-500/10", badge: "text-cyan-400" },
    { id: "at_risk", label: "Nguy cơ rời bỏ (At Risk)", color: "border-amber-500", bg: "bg-amber-500/10", badge: "text-amber-400" },
    { id: "churned", label: "Đã hủy (Churned)", color: "border-rose-500", bg: "bg-rose-500/10", badge: "text-rose-400" },
  ];

  const startEdit = (c: any) => {
    setEditingCustomer(c);
    setEditStage(c.lifecycleStage);
    setEditHealthScore(c.healthScore || 100);
    setEditNotes(c.internalNotes || "");
  };

  const handleSaveCRM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingCustomer.userId,
          lifecycleStage: editStage,
          healthScore: Number(editHealthScore),
          internalNotes: editNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingCustomer(null);
        loadPipeline();
      } else {
        alert(json.error || "Lỗi lưu CRM");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-amber-400" />
            <span>Vòng Đời Khách Hàng (Customer CRM Pipeline)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Theo dõi hành trình từ Đăng ký, Dùng thử, Trả phí cho tới Nguy cơ rời bỏ & Chỉ số sức khỏe (Health Score)
          </p>
        </div>
      </div>

      {/* PIPELINE KANBAN COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stages.map((st) => {
          const list = pipeline[st.id] || [];
          return (
            <div key={st.id} className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-3.5 flex flex-col min-h-[550px]">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-neutral-800">
                <span className={`font-bold text-xs truncate ${st.badge}`}>{st.label}</span>
                <span className="text-[10px] font-bold text-neutral-300 px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700">
                  {list.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                {list.length === 0 ? (
                  <div className="py-12 text-center text-[11px] text-neutral-600">
                    Trống
                  </div>
                ) : (
                  list.map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => startEdit(c)}
                      className="p-3 rounded-2xl border border-neutral-800 bg-neutral-950/80 hover:border-amber-500/50 hover:bg-neutral-900 cursor-pointer transition space-y-2 group shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate group-hover:text-amber-400 transition">
                          {c.user?.profile?.fullName || c.user?.email.split("@")[0]}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getHealthColor(c.healthScore)}`}>
                          {c.healthScore}%
                        </span>
                      </div>

                      <div className="text-[10px] text-neutral-400 truncate">
                        {c.user?.email}
                      </div>

                      {c.internalNotes && (
                        <div className="text-[10px] text-neutral-400 bg-neutral-900 p-1.5 rounded-lg border border-neutral-800/80 line-clamp-2 italic">
                          "{c.internalNotes}"
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[10px]">
                        <span className="text-neutral-500 font-medium">
                          {c.user?.subscriptions?.[0]?.plan?.name || "Free"}
                        </span>
                        <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition text-[10px] font-semibold flex items-center gap-0.5">
                          <Edit2 className="w-2.5 h-2.5" /> Chăm sóc
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: EDIT CRM CUSTOMER */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCRM} className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>Chăm Sóc Khách Hàng (CRM)</span>
              </h3>
              <button type="button" onClick={() => setEditingCustomer(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
              <div className="font-bold text-white text-sm">
                {editingCustomer.user?.profile?.fullName || editingCustomer.user?.email}
              </div>
              <div className="text-neutral-400 mt-0.5">{editingCustomer.user?.email}</div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Gói hiện tại: <strong className="text-emerald-400 uppercase">{editingCustomer.user?.subscriptions?.[0]?.plan?.name || "Free"}</strong>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Giai đoạn vòng đời (Lifecycle Stage)</label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="registered">Mới đăng ký</option>
                  <option value="trial">Dùng thử (Trial)</option>
                  <option value="paid">Đã trả phí (Paid)</option>
                  <option value="active">Tương tác cao (Active)</option>
                  <option value="at_risk">Nguy cơ rời bỏ (At Risk)</option>
                  <option value="churned">Đã hủy (Churned)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-400">Chỉ số sức khỏe (Health Score): <strong className="text-white">{editHealthScore}/100</strong></label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getHealthColor(editHealthScore)}`}>
                    {editHealthScore >= 80 ? "Rất tốt" : editHealthScore >= 50 ? "Bình thường" : "Cần can thiệp gấp"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editHealthScore}
                  onChange={(e) => setEditHealthScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Ghi chú chăm sóc nội bộ</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ghi lại lịch sử tư vấn, phản hồi hoặc nhu cầu của khách..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
              >
                {saving ? "Đang lưu..." : "Lưu hồ sơ CRM"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
