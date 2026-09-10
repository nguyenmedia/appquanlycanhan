"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Brain,
  CreditCard,
  Lock,
  Globe,
  RefreshCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success) setSettings(json.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const getValue = (key: string, defaultVal = "") => {
    return settings.find((s) => s.key === key)?.value || defaultVal;
  };

  const setValue = (key: string, nextValue: string) => {
    const exists = settings.some((s) => s.key === key);
    if (exists) {
      setSettings(settings.map((s) => (s.key === key ? { ...s, value: nextValue } : s)));
    } else {
      setSettings([...settings, { key, value: nextValue }]);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Đã lưu tất cả cài đặt hệ thống thành công!");
      } else {
        alert(json.error || "Lỗi lưu cài đặt");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (!confirm("Khôi phục toàn bộ cấu hình về giá trị mặc định tiêu chuẩn?")) return;
    setValue("app_name", "LifeOS");
    setValue("app_tagline", "Everything for your life, organized in one place.");
    setValue("currency", "VND");
    setValue("support_email", "support@lifeos.app");
    setValue("default_plan", "free");
    setValue("trial_days", "14");
    setValue("trial_enabled", "true");
    setValue("ai_chat_cost", "1");
    setValue("ai_planner_cost", "3");
    setValue("ai_coach_cost", "10");
    setValue("maintenance_mode", "false");
    setValue("registration_enabled", "true");
    showToast("Đã thiết lập cấu hình mặc định (Nhấn Lưu để áp dụng)");
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
            <Settings className="w-6 h-6 text-amber-400" />
            <span>Cài Đặt Hệ Thống SaaS (System Configuration)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Quản trị thương hiệu, chính sách dùng thử, chi phí tài nguyên AI và chế độ bảo trì máy chủ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToDefaults}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Đang lưu..." : "Lưu cài đặt"}</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 text-xs">
        {[
          { id: "general", label: "Cấu hình chung", icon: Globe },
          { id: "plans", label: "Gói & Dùng thử", icon: CreditCard },
          { id: "ai", label: "Chi phí AI Engine", icon: Brain },
          { id: "ops", label: "Vận hành & An toàn", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition ${
                isActive
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        {activeTab === "general" && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Thương Hiệu & Thông Tin Chung</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Tên nền tảng (App Name)</label>
                <input
                  type="text"
                  value={getValue("app_name", "LifeOS")}
                  onChange={(e) => setValue("app_name", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Đơn vị tiền tệ chính (Currency)</label>
                <input
                  type="text"
                  value={getValue("currency", "VND")}
                  onChange={(e) => setValue("currency", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-400 mb-1 font-semibold">Khẩu hiệu (Tagline)</label>
                <input
                  type="text"
                  value={getValue("app_tagline", "Everything for your life, organized in one place.")}
                  onChange={(e) => setValue("app_tagline", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-400 mb-1 font-semibold">Email hỗ trợ khách hàng</label>
                <input
                  type="email"
                  value={getValue("support_email", "support@lifeos.app")}
                  onChange={(e) => setValue("support_email", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "plans" && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Chính Sách Đăng Ký & Dùng Thử</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Gói mặc định khi đăng ký mới</label>
                <select
                  value={getValue("default_plan", "free")}
                  onChange={(e) => setValue("default_plan", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white"
                >
                  <option value="free">Free (Miễn phí)</option>
                  <option value="pro">LifeOS Pro</option>
                  <option value="premium">LifeOS Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Số ngày dùng thử Pro (Trial Days)</label>
                <input
                  type="number"
                  value={getValue("trial_days", "14")}
                  onChange={(e) => setValue("trial_days", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                  <input
                    type="checkbox"
                    checked={getValue("trial_enabled", "true") === "true"}
                    onChange={(e) => setValue("trial_enabled", e.target.checked ? "true" : "false")}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <span>Tự động kích hoạt 14 ngày dùng thử gói Pro khi người dùng đăng ký mới</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-pink-400" />
              <span>Định Giá Tiêu Hao AI Credits</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <label className="block text-neutral-400 mb-1 font-semibold">AI Trợ Lý Chat (credits / tin)</label>
                <input
                  type="number"
                  value={getValue("ai_chat_cost", "1")}
                  onChange={(e) => setValue("ai_chat_cost", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <label className="block text-neutral-400 mb-1 font-semibold">AI Lập Kế Hoạch (credits / lần)</label>
                <input
                  type="number"
                  value={getValue("ai_planner_cost", "3")}
                  onChange={(e) => setValue("ai_planner_cost", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <label className="block text-neutral-400 mb-1 font-semibold">AI Life Coach VIP (credits / buổi)</label>
                <input
                  type="number"
                  value={getValue("ai_coach_cost", "10")}
                  onChange={(e) => setValue("ai_coach_cost", e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "ops" && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Chế Độ Bảo Trì & An Toàn Vận Hành</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className={`p-4 rounded-2xl border transition ${
                getValue("maintenance_mode", "false") === "true"
                  ? "bg-rose-950/20 border-rose-800/60"
                  : "bg-neutral-950 border-neutral-800"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white block">Chế độ bảo trì hệ thống (Maintenance Mode)</span>
                      {getValue("maintenance_mode", "false") === "true" ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-[10px] animate-pulse">
                          ĐANG BẬT BẢO TRÌ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                          Bình thường
                        </span>
                      )}
                    </div>
                    <span className="text-neutral-400 text-[11px] block max-w-xl">
                      Khi bật, chỉ tài khoản Admin mới có thể truy cập, người dùng khác sẽ thấy thông báo bảo trì.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={getValue("maintenance_mode", "false") === "true"}
                    onChange={(e) => setValue("maintenance_mode", e.target.checked ? "true" : "false")}
                    className="rounded accent-rose-500 w-5 h-5 cursor-pointer ml-4"
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-800/50 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">
                    {getValue("maintenance_mode", "false") === "true"
                      ? "⚠️ Tất cả người dùng thông thường và khách sẽ bị chuyển hướng đến /maintenance."
                      : "Người dùng có thể đăng nhập và sử dụng toàn bộ tính năng bình thường."}
                  </span>
                  <a
                    href="/maintenance"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-semibold underline ml-2 whitespace-nowrap"
                  >
                    Xem trước trang bảo trì ↗
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Cho phép mở đăng ký tài khoản mới</span>
                  <span className="text-neutral-400 text-[11px]">
                    Bật hoặc tạm đóng cổng đăng ký người dùng mới trên Landing Page.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={getValue("registration_enabled", "true") === "true"}
                  onChange={(e) => setValue("registration_enabled", e.target.checked ? "true" : "false")}
                  className="rounded accent-emerald-500 w-5 h-5 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
