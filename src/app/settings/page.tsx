"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Key,
  Lock,
  Bell,
  Palette,
  Globe,
  DollarSign,
  Download,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CreditCard,
  Zap,
  Award,
  Layers,
  Clock,
  LogOut,
  ChevronRight,
  Sliders,
  Database,
} from "lucide-react";

// Preset avatar styles
const AVATAR_PRESETS = [
  { id: "1", label: "Gradient Cyber", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Felix" },
  { id: "2", label: "Futuristic Neon", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Aria" },
  { id: "3", label: "Pro Executive", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander" },
  { id: "4", label: "Creative Designer", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" },
  { id: "5", label: "Minimalist Zen", url: "https://api.dicebear.com/7.x/identicon/svg?seed=Zen" },
  { id: "6", label: "Pixel Hacker", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Matrix" },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // User & Profile State
  const [userData, setUserData] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [currency, setCurrency] = useState("VND");

  // Preferences
  const [themeMode, setThemeMode] = useState("dark");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [privacyBlur, setPrivacyBlur] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Referral copy state
  const [copiedRef, setCopiedRef] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.authenticated && json.user) {
          const u = json.user;
          setUserData(u);
          setFullName(u.profile?.fullName || "");
          setPhone(u.profile?.phone || "");
          setBio(u.profile?.bio || "");
          setAvatarUrl(u.profile?.avatarUrl || "");
          setTimezone(u.profile?.timezone || "Asia/Ho_Chi_Minh");
          setCurrency(u.profile?.currency || "VND");

          if (u.profile?.preferencesJson) {
            try {
              const prefs = JSON.parse(u.profile.preferencesJson);
              if (prefs.theme) setThemeMode(prefs.theme);
              if (prefs.sound !== undefined) setSoundEnabled(prefs.sound);
              if (prefs.privacyBlur !== undefined) setPrivacyBlur(prefs.privacyBlur);
              if (prefs.emailDigest !== undefined) setEmailDigest(prefs.emailDigest);
            } catch (e) {
              // ignore json parse error
            }
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const preferences = {
      theme: themeMode,
      sound: soundEnabled,
      privacyBlur: privacyBlur,
      emailDigest: emailDigest,
    };

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          bio,
          avatarUrl,
          timezone,
          currency,
          preferencesJson: JSON.stringify(preferences),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Không thể cập nhật hồ sơ");
      }

      setUserData(data.user);
      setMessage({ type: "success", text: "Đã lưu cập nhật hồ sơ thành công!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Đã xảy ra lỗi khi lưu" });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      return;
    }

    setPasswordLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Không thể đổi mật khẩu");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: "Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn." });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi khi đổi mật khẩu" });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Export JSON Backup
  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage({ type: "success", text: "Đã tải về tệp sao lưu dữ liệu JSON thành công!" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Không thể tải tệp sao lưu" });
    } finally {
      setExporting(false);
    }
  };

  const copyReferralCode = () => {
    if (userData?.referralCode) {
      const refUrl = `${window.location.origin}/register?ref=${userData.referralCode}`;
      navigator.clipboard.writeText(refUrl);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 3000);
    }
  };

  // Password strength score
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "Chưa nhập", color: "bg-neutral-700" };
    if (pass.length < 6) return { score: 1, text: "Yếu", color: "bg-red-500" };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    if (pass.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { score: 3, text: "Rất mạnh", color: "bg-emerald-500" };
    }
    if (pass.length >= 6 && hasLetters && hasNumbers) {
      return { score: 2, text: "Khá", color: "bg-amber-500" };
    }
    return { score: 1, text: "Trung bình", color: "bg-amber-400" };
  };

  const passStrength = getPasswordStrength(newPassword);
  const plan = userData?.plan;
  const isPro = plan?.slug === "pro" || plan?.slug === "premium" || plan?.slug === "lifetime";
  const aiBalance =
    typeof userData?.aiCredits === "object"
      ? (userData?.aiCredits?.balance ?? 20)
      : (typeof userData?.aiCredits === "number" ? userData.aiCredits : 20);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-sm text-neutral-400">Đang tải thông tin tài khoản...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TOP NOTIFICATION TOAST */}
        {message && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs opacity-70 hover:opacity-100 underline"
            >
              Đóng
            </button>
          </div>
        )}

        {/* HERO PROFILE BANNER */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-neutral-900 via-[#10101a] to-neutral-950 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* User Avatar & Identity */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-xl ring-2 transition-all overflow-hidden ${
                    isPro
                      ? "bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 ring-indigo-400/40 shadow-indigo-500/20"
                      : "bg-gradient-to-tr from-neutral-700 to-neutral-600 ring-white/10"
                  }`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span>{fullName?.charAt(0)?.toUpperCase() || userData?.email?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-black ring-2 ring-neutral-950 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Online
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {fullName || "Người dùng LifeOS"}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1 ${
                      isPro
                        ? "bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border-amber-500/30"
                        : "bg-white/[0.06] text-neutral-400 border-white/[0.08]"
                    }`}
                  >
                    <Award className="w-3 h-3 text-amber-400" />
                    {plan?.name || "Free Tier"}
                  </span>
                  {userData?.role === "ADMIN" || userData?.role === "SUPER_ADMIN" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Admin
                    </span>
                  ) : null}
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{userData?.email}</span>
                </p>

                <p className="text-xs text-neutral-500 line-clamp-1 italic max-w-md">
                  {bio ? `"${bio}"` : "Chưa cập nhật giới thiệu cá nhân"}
                </p>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap md:flex-col items-stretch gap-2.5 w-full md:w-auto">
              <Link
                href="/settings/billing"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Quản trị gói cước ({plan?.name || "Free"})</span>
              </Link>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-neutral-200 border border-white/[0.08] text-xs font-semibold transition active:scale-95"
              >
                <Download className={`w-3.5 h-3.5 ${exporting ? "animate-bounce" : ""}`} />
                <span>{exporting ? "Đang xuất file..." : "Sao lưu dữ liệu (JSON)"}</span>
              </button>
            </div>
          </div>

          {/* KPI Mini Strip */}
          <div className="mt-6 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Credits</span>
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {aiBalance} <span className="text-xs text-neutral-500 font-normal">khả dụng</span>
              </div>
            </div>

            <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đồng bộ Cloud</span>
              </div>
              <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Realtime</span>
              </div>
            </div>

            <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mã giới thiệu</span>
              </div>
              <button
                onClick={copyReferralCode}
                className="group flex items-center gap-1.5 text-sm font-mono font-bold text-indigo-300 mt-1 hover:text-white transition"
              >
                <span>{userData?.referralCode || "LIFEOS"}</span>
                {copiedRef ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                )}
              </button>
            </div>

            <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Múi giờ làm việc</span>
              </div>
              <div className="text-sm font-semibold text-neutral-300 mt-1 truncate">
                {timezone}
              </div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "profile", label: "Hồ sơ cá nhân", icon: User },
            { id: "security", label: "Bảo mật & Mật khẩu", icon: Lock },
            { id: "preferences", label: "Tùy biến trải nghiệm", icon: Sliders },
            { id: "data", label: "Dữ liệu & Bản sao lưu", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.replace(`/settings?tab=${tab.id}`);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT: PROFILE */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-neutral-900/70 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span>Thông Tin Định Danh & Liên Hệ</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Cập nhật thông tin xuất hiện trên hồ sơ, báo cáo và trợ lý AI của bạn
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>

              {/* Avatar Preset Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Chọn ảnh đại diện nhanh (Avatar Presets)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`group relative p-2 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                        avatarUrl === preset.url
                          ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-10 h-10 rounded-xl object-cover bg-neutral-800"
                      />
                      <span className="text-[10px] text-neutral-400 truncate group-hover:text-white max-w-full">
                        {preset.label}
                      </span>
                      {avatarUrl === preset.url && (
                        <CheckCircle2 className="w-3 h-3 text-indigo-400 absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Họ và tên hiển thị *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Alex Nguyễn"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Email tài khoản <span className="text-neutral-500 font-normal">(Bảo mật đăng nhập)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={userData?.email || ""}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/50 border border-white/[0.05] text-sm text-neutral-400 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
                      Đã xác thực
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Số điện thoại liên hệ</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="VD: 0901234567"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">URL ảnh đại diện tùy chọn</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Múi giờ hệ thống</label>
                  <div className="relative">
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
                    >
                      <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7 Hà Nội, TP.HCM)</option>
                      <option value="Asia/Tokyo">Nhật Bản / Hàn Quốc (GMT+9 Tokyo)</option>
                      <option value="Asia/Singapore">Singapore / Malaysia (GMT+8)</option>
                      <option value="Europe/London">Vương Quốc Anh (GMT+0 London)</option>
                      <option value="America/New_York">Bờ Đông Hoa Kỳ (GMT-5 New York)</option>
                      <option value="America/Los_Angeles">Bờ Tây Hoa Kỳ (GMT-8 Los Angeles)</option>
                    </select>
                    <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Đơn vị tiền tệ chính</label>
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
                    >
                      <option value="VND">VND (₫) - Đồng Việt Nam</option>
                      <option value="USD">USD ($) - Đô la Mỹ</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="JPY">JPY (¥) - Yên Nhật</option>
                    </select>
                    <DollarSign className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Giới thiệu ngắn / Châm ngôn cá nhân (Bio)
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Mục tiêu năm nay, nguyên tắc làm việc hoặc câu nói truyền cảm hứng..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Đang lưu thay đổi..." : "Lưu cập nhật hồ sơ"}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB CONTENT: SECURITY */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Password Form */}
            <form onSubmit={handleChangePassword} className="bg-neutral-900/70 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-400" />
                  <span>Đổi Mật Khẩu Đăng Nhập</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Bảo vệ tài khoản bằng mật khẩu mạnh kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
                </p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Mật khẩu hiện tại *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đang dùng"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-neutral-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="p-1.5 text-neutral-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Mật khẩu mới *</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-neutral-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="p-1.5 text-neutral-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Độ mạnh mật khẩu:</span>
                        <span className="font-semibold text-neutral-200">{passStrength.text}</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passStrength.color} transition-all`}
                          style={{ width: `${(passStrength.score / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{passwordLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
                </button>
              </div>
            </form>

            {/* Active Sessions & Security Info */}
            <div className="bg-neutral-900/70 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Phiên Đăng Nhập & Thiết Bị Hoạt Động</span>
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>Thiết bị hiện tại (Web Browser)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Phiên làm việc bảo mật JWT • Hết hạn sau 7 ngày
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="bg-neutral-900/70 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>Tùy Chỉnh Trải Nghiệm & Giao Diện</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cá nhân hóa các thông số vận hành và phong cách hiển thị của LifeOS
              </p>
            </div>

            <div className="divide-y divide-white/[0.06] space-y-4">
              {/* Theme Preference */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <span>Chủ đề giao diện</span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Giao diện tối chuyên sâu tối ưu cho làm việc ban đêm và tiết kiệm pin OLED
                  </div>
                </div>
                <select
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="dark">Midnight Dark (Khuyên dùng)</option>
                  <option value="cyber">Cyberpunk Neon</option>
                  <option value="amoled">AMOLED Pitch Black</option>
                </select>
              </div>

              {/* Sound Effects */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>Âm thanh Pomodoro & Hoàn thành Task</span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Phát chuông dịu nhẹ khi kết thúc phiên làm việc sâu hoặc tick xong mục tiêu
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    soundEnabled ? "bg-indigo-600" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      soundEnabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Privacy Blur Mode */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-purple-400" />
                    <span>Chế độ ẩn số dư nơi công cộng (Privacy Blur)</span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Tự động làm mờ số tiền trong Sổ ví và Tài chính khi mở ứng dụng ở quán cà phê
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacyBlur(!privacyBlur)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    privacyBlur ? "bg-indigo-600" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      privacyBlur ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Email Digest */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-400" />
                    <span>Báo cáo tuần & Lời nhắc nhở</span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Nhận bản tin tóm tắt tiến độ công việc và tài chính cá nhân vào sáng thứ Hai
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailDigest(!emailDigest)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    emailDigest ? "bg-indigo-600" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      emailDigest ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Đang lưu..." : "Lưu tùy chọn giao diện"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB CONTENT: DATA & BACKUP */}
        {activeTab === "data" && (
          <div className="bg-neutral-900/70 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>Quản Trị Dữ Liệu & Quyền Riêng Tư</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Bạn hoàn toàn làm chủ dữ liệu của mình. Xuất bản sao lưu hoặc quản lý lưu trữ bất kỳ lúc nào.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Backup Card */}
              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/[0.08] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Xuất toàn bộ dữ liệu (JSON Export)</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Tải về trọn vẹn danh sách công việc, ghi chú, giao dịch tài chính, thói quen và mục tiêu để lưu trữ offline
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={exporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition active:scale-95"
                >
                  <Download className={`w-4 h-4 ${exporting ? "animate-bounce" : ""}`} />
                  <span>{exporting ? "Đang nén dữ liệu..." : "Tải về tệp sao lưu (.json)"}</span>
                </button>
              </div>

              {/* Sync Status Card */}
              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/[0.08] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Đồng bộ Cloud đa thiết bị</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Dữ liệu được mã hóa đường truyền SSL/TLS 256-bit và tự động đồng bộ thời gian thực qua Supabase Realtime
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Trạng thái kết nối
                  </span>
                  <span className="font-semibold font-mono">Hoạt động tốt</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-red-500/20 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
                Khu vực nhạy cảm (Danger Zone)
              </h3>
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-red-300">Xóa tài khoản & Xóa dữ liệu cá nhân</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 max-w-md">
                    Toàn bộ tài liệu, lịch sử giao dịch và tiến độ thói quen sẽ bị xóa vĩnh viễn theo chuẩn bảo mật GDPR.
                  </div>
                </div>
                <Link
                  href="/support?topic=delete_account"
                  className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold whitespace-nowrap transition"
                >
                  Yêu cầu hỗ trợ xóa tài khoản
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-sm text-neutral-400">Đang tải cài đặt tài khoản...</span>
            </div>
          </div>
        </AppShell>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
