"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Wallet,
  Calendar,
  CheckSquare,
  Target,
  Brain,
  Timer,
  ChevronDown,
  ChevronUp,
  Star,
  Globe,
  Layers,
  Activity,
  BookOpen,
  Users,
  FileText,
  Smile,
  CreditCard,
  Lock,
  RefreshCw,
  TrendingUp,
  Check,
  X,
  Flame,
  Clock,
  Laptop,
  Smartphone,
  HelpCircle,
  Award,
  ArrowUpRight,
  BarChart3,
  Sliders,
  DollarSign,
  HeartPulse,
  FolderKanban,
  BadgeCheck,
  Send,
  LifeBuoy,
  Compass,
  Lightbulb,
  Rocket,
  Bell,
  Play,
  Database,
  CheckCheck,
  Cpu,
} from "lucide-react";

// Feature key Vietnamese translation dictionary
const FEATURE_NAMES_VI: Record<string, string> = {
  ai_assistant: "Trợ lý AI trực tuyến 24/7",
  ai_planner: "AI Lập kế hoạch ngày tự động",
  advanced_analytics: "Báo cáo & Phân tích chuyên sâu 360°",
  export_data: "Xuất toàn bộ dữ liệu (CSV & JSON)",
  priority_support: "Hỗ trợ kỹ thuật ưu tiên 1:1",
  custom_categories: "Tùy biến danh mục không giới hạn",
  unlimited_history: "Lưu trữ lịch sử vĩnh viễn",
  vietqr_instant: "Kích hoạt tức thì qua VietQR",
  projects: "Dự án & Quản lý cột mốc",
  tasks: "Nhiệm vụ & Bảng Kanban",
  habits: "Rèn luyện thói quen & Streak",
  goals: "Mục tiêu dài hạn & OKRs",
  ai_requests: "Lượt tương tác AI mỗi tháng",
  storage_mb: "Dung lượng lưu trữ đám mây",
};

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [plans, setPlans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "finance" | "habits" | "ai">("dashboard");
  const [appsCount, setAppsCount] = useState<number>(5);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch("/api/pricing");
        const data = await res.json();
        if (data.plans) setPlans(data.plans);
      } catch (e) {
        console.error("Error loading plans", e);
      }
    }
    loadPlans();
  }, []);

  // Time & Money Savings Estimations
  const savedHoursPerMonth = Math.round(appsCount * 6.5);
  const savedMoneyPerMonth = appsCount * 145000;

  return (
    <div className="min-h-screen bg-[#070709] text-neutral-100 selection:bg-indigo-500 selection:text-white font-sans">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <aside aria-label="Thông báo hệ thống" className="relative z-50 bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 border-b border-indigo-500/20 py-2.5 px-4 text-center text-xs font-medium text-neutral-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 font-bold text-[11px] shadow-sm">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            LIFEOS 2.0 CHÍNH THỨC
          </span>
          <span>
            Hệ điều hành quản trị cuộc sống số toàn diện • Hợp nhất 14 phân hệ thiết yếu & Trợ lý AI cá nhân hóa.
          </span>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 font-bold text-indigo-300 hover:text-white underline underline-offset-4 ml-1 transition"
          >
            Trải nghiệm miễn phí ngay <ArrowRight className="w-3.5 h-3.5 inline" />
          </Link>
        </div>
      </aside>

      {/* 2. STICKY GLASS NAVBAR */}
      <header className="sticky top-0 left-0 right-0 z-40 border-b border-white/[0.08] bg-[#070709]/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              L
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white whitespace-nowrap">
                  LifeOS
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase whitespace-nowrap">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 tracking-wider whitespace-nowrap hidden sm:block">
                Hệ điều hành cá nhân toàn diện
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
            <a
              href="#showcase"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] transition whitespace-nowrap shrink-0"
            >
              Trải nghiệm mẫu
            </a>
            <a
              href="#comparison"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] transition whitespace-nowrap shrink-0"
            >
              Giải pháp LifeOS
            </a>
            <a
              href="#modules"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] transition whitespace-nowrap shrink-0"
            >
              14 Phân hệ
            </a>
            <a
              href="#ai"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] transition whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Trợ lý AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            </a>
            <a
              href="#calculator"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] transition whitespace-nowrap shrink-0"
            >
              Tiết kiệm chi phí
            </a>
            <a
              href="#pricing"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] transition whitespace-nowrap shrink-0"
            >
              Bảng giá
            </a>
            <a
              href="#faq"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] transition whitespace-nowrap shrink-0"
            >
              Hỏi đáp
            </a>
            <Link
              href="/support"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition whitespace-nowrap shrink-0 flex items-center gap-1.5 font-semibold"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Hỗ trợ 24/7</span>
            </Link>
          </nav>

          {/* Nav Actions */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
            <Link
              href="/login"
              className="text-sm font-semibold text-neutral-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/[0.05] transition whitespace-nowrap shrink-0"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl bg-gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Dùng thử miễn phí</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-300 hover:text-white active:scale-95 transition"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <div className="space-y-1.5">
                <div className="w-5 h-0.5 bg-neutral-300 rounded" />
                <div className="w-5 h-0.5 bg-neutral-300 rounded" />
                <div className="w-3.5 h-0.5 bg-neutral-300 rounded" />
              </div>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-white/[0.08] bg-[#0c0c14]/95 backdrop-blur-2xl px-5 py-6 space-y-4 animate-in fade-in duration-150">
            <nav className="flex flex-col space-y-2 text-sm text-neutral-300 font-medium">
              <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/[0.05]">
                Trải nghiệm mẫu trực tiếp
              </a>
              <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/[0.05]">
                Giải pháp & Lợi ích
              </a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/[0.05]">
                14 Phân hệ quản trị
              </a>
              <a href="#ai" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-pink-300 hover:bg-pink-500/10 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Trợ lý Trí tuệ Nhân tạo AI</span>
              </a>
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/[0.05]">
                Công cụ tính toán tiết kiệm
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/[0.05]">
                Bảng giá & Khuyến mãi
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-white/[0.05]">
                Hỏi đáp thường gặp
              </a>
              <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-indigo-400 font-semibold flex items-center gap-2">
                <LifeBuoy className="w-4 h-4" />
                <span>Trung tâm hỗ trợ 24/7</span>
              </Link>
            </nav>
            <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2.5">
              <Link
                href="/login"
                className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-200"
              >
                Đăng nhập tài khoản
              </Link>
              <Link
                href="/register"
                className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-gradient-brand text-white shadow-lg shadow-indigo-500/25"
              >
                Tạo tài khoản miễn phí ngay
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden bg-gradient-dark">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[400px] bg-purple-600/12 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide mb-6 sm:mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Nền tảng Quản trị Cuộc sống & Sự nghiệp Toàn diện</span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="hidden sm:inline text-neutral-400 font-normal">Công việc • Tiền bạc • Thói quen • AI</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.12]">
            Vận Hành Toàn Bộ Cuộc Sống Từ{" "}
            <br className="hidden sm:inline" />
            <span className="text-gradient-brand">Một Không Gian Số Hóa Duy Nhất</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
            Hợp nhất <strong>14 phân hệ cốt lõi</strong>: Quản lý Công việc & Dự án (Kanban), Sổ quỹ Tài chính đa tài khoản, Rèn luyện Thói quen & Mục tiêu OKR, Nhật ký & Sức khỏe, cùng Trợ lý AI đồng hành 24/7. Chấm dứt hoàn toàn sự phân mảnh giữa hàng chục ứng dụng rời rạc.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12 sm:mb-14">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-brand text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:opacity-95 transition active:scale-[0.98]"
            >
              <span>Bắt đầu miễn phí ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#showcase"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 font-semibold text-base transition flex items-center justify-center gap-2"
            >
              <span>Xem Demo trực quan</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </a>
          </div>

          {/* Trust Metrics & Highlights */}
          <div className="pt-8 border-t border-white/[0.08] max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-neutral-400 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-white font-bold">4.9/5</span>
              <span>(12.800+ người dùng tin cậy)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Bảo mật mã hóa chuẩn AES-256</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Hỗ trợ VietQR, MoMo & Thẻ quốc tế</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Tương thích mọi thiết bị (PWA)</span>
            </div>
          </div>
        </div>

        {/* 4. INTERACTIVE PRODUCT SHOWCASE */}
        <div id="showcase" className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 sm:mt-18 relative z-20">
          {/* Feature Tabs Switcher */}
          <div className="flex items-center justify-center mb-6 overflow-x-auto pb-2 scrollbar-none">
            <div className="inline-flex p-1.5 rounded-2xl bg-neutral-900/90 border border-white/[0.08] backdrop-blur-xl shadow-xl">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Bảng tổng quan (Dashboard)</span>
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "tasks"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Công việc & Dự án</span>
              </button>
              <button
                onClick={() => setActiveTab("finance")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "finance"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Tài chính đa ví tiền</span>
              </button>
              <button
                onClick={() => setActiveTab("habits")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "habits"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Thói quen & Sức khỏe</span>
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "ai"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Brain className="w-4 h-4 text-pink-400" />
                <span>Trợ lý Trí tuệ AI</span>
              </button>
            </div>
          </div>

          {/* Interactive Frame Wrapper */}
          <div className="rounded-3xl border border-white/[0.1] bg-neutral-900/60 backdrop-blur-2xl p-3 sm:p-4 shadow-2xl shadow-indigo-950/40">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-4 sm:p-7 overflow-hidden">
              {/* Window Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                    https://appquanlycanhan.vercel.app/{activeTab}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đồng bộ thời gian thực
                  </span>
                  <Link
                    href="/register"
                    className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition"
                  >
                    Dùng thử tab này
                  </Link>
                </div>
              </div>

              {/* TAB CONTENT 1: DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Điểm năng suất ngày</span>
                        <span className="text-emerald-400 font-bold">+16%</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-white">94/100</div>
                      <div className="w-full bg-white/[0.08] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[94%]" />
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Tổng tài sản ròng</span>
                        <span className="text-emerald-400 font-bold">+8.4%</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-white">135.200.000đ</div>
                      <div className="text-[11px] text-neutral-400 mt-1">4 Ví tài khoản đang liên kết</div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Nhiệm vụ hôm nay</span>
                        <span className="text-indigo-400 font-bold">5/6 xong</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-white">83.3%</div>
                      <div className="w-full bg-white/[0.08] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[83.3%]" />
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Chuỗi Streak dài nhất</span>
                        <span className="text-amber-400 font-bold">🔥 Kỷ lục</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-amber-400">28 Ngày</div>
                      <div className="text-[11px] text-neutral-400 mt-1">Đọc sách & Tập Gym</div>
                    </div>
                  </div>

                  {/* Mid Row: 3 Panels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Panel 1: Tasks today */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs text-neutral-300 font-bold mb-3">
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                          Công việc trọng tâm
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Hôm nay</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white/[0.03] line-through text-neutral-500 flex items-center justify-between">
                          <span>Chạy bộ 5km buổi sáng</span>
                          <span className="text-[10px] text-emerald-400">Hoàn thành</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.03] line-through text-neutral-500 flex items-center justify-between">
                          <span>Duyệt báo cáo doanh thu tuần</span>
                          <span className="text-[10px] text-emerald-400">Hoàn thành</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 flex items-center justify-between">
                          <span className="font-semibold">Họp chiến lược phát triển Q4</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">Khẩn cấp</span>
                        </div>
                      </div>
                    </div>

                    {/* Panel 2: Finance Snapshot */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs text-neutral-300 font-bold mb-3">
                        <span className="flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          Dòng tiền tháng này
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Dương tiền</span>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                          <span className="text-neutral-400">Tổng thu nhập</span>
                          <span className="font-bold text-emerald-400">+48.500.000đ</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                          <span className="text-neutral-400">Tổng chi tiêu</span>
                          <span className="font-bold text-rose-400">-14.200.000đ</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400">Tỷ lệ tích lũy</span>
                          <span className="font-bold text-indigo-400">70.7% (Đạt chỉ tiêu)</span>
                        </div>
                      </div>
                    </div>

                    {/* Panel 3: AI Life Coach Box */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-300 font-bold mb-3">
                          <span className="flex items-center gap-1.5 text-pink-400">
                            <Brain className="w-4 h-4 text-pink-400" />
                            Gợi ý từ Trợ lý AI
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">Tự động</span>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed italic bg-pink-950/20 p-3 rounded-xl border border-pink-500/20">
                          "Bạn đã duy trì thói quen thức dậy lúc 6:00 sáng được 28 ngày liên tục! Năng lượng tập trung cao nhất vào khung 8:30 - 11:30. Đề xuất dành 2 phiên Pomodoro cho task 'Chiến lược phát triển' trước buổi trưa."
                        </p>
                      </div>
                      <div className="mt-3 text-[11px] text-neutral-400 flex items-center justify-between">
                        <span>Đã phân tích từ 36 chỉ số</span>
                        <span className="text-pink-400 font-semibold cursor-pointer hover:underline">Hỏi thêm AI →</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: TASKS & PROJECTS */}
              {activeTab === "tasks" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Col 1: To Do */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-3 pb-2 border-b border-white/[0.08]">
                        <span className="flex items-center gap-1.5 text-neutral-200">
                          <span className="w-2 h-2 rounded-full bg-neutral-400" /> Cần thực hiện
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06]">2</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                          <div className="font-semibold text-white mb-1">Nghiên cứu thị trường phần mềm quản lý</div>
                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Dự án Công nghệ</span>
                            <span>Hạn: 15/09</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                          <div className="font-semibold text-white mb-1">Tối ưu hóa ngân sách tiếp thị tháng 9</div>
                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Tài chính</span>
                            <span>Hạn: 18/09</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: In Progress */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-3 pb-2 border-b border-white/[0.08]">
                        <span className="flex items-center gap-1.5 text-indigo-300">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Đang thực hiện
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">1</span>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
                        <div className="font-semibold text-white mb-1">Thiết kế giao diện LifeOS v2.0</div>
                        <p className="text-[11px] text-neutral-400 mb-2">Đang hoàn thiện tính toán chi phí & bảng giá</p>
                        <div className="flex items-center justify-between text-[11px] text-neutral-300">
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">Ưu tiên cao</span>
                          <span className="text-indigo-400 font-semibold">Tiến độ 90%</span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Done */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-3 pb-2 border-b border-white/[0.08]">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Đã hoàn thành
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">4</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] line-through text-neutral-500">
                          Tích hợp thanh toán VietQR & MoMo tự động
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] line-through text-neutral-500">
                          Thiết lập bảo mật phân quyền Row-Level Security
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 3: FINANCE */}
              {activeTab === "finance" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-neutral-900 border border-indigo-500/30">
                      <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
                        <span>Tài khoản Ngân Hàng Chính</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30">Mặc định</span>
                      </div>
                      <div className="text-2xl font-black text-white">88.500.000đ</div>
                      <div className="text-[11px] text-neutral-400 mt-2">Chi tiêu tuần này: 3.200.000đ</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/60 to-neutral-900 border border-pink-500/30">
                      <div className="flex items-center justify-between text-xs text-pink-300 mb-2">
                        <span>Ví Điện Tử MoMo</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/30">Tiêu dùng</span>
                      </div>
                      <div className="text-2xl font-black text-white">6.250.000đ</div>
                      <div className="text-[11px] text-neutral-400 mt-2">Dùng ăn uống & mua sắm hàng ngày</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-neutral-900 border border-emerald-500/30">
                      <div className="flex items-center justify-between text-xs text-emerald-300 mb-2">
                        <span>Sổ Tiết Kiệm & Quỹ Khẩn Cấp</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/30">Lãi 6.8%/năm</span>
                      </div>
                      <div className="text-2xl font-black text-white">40.450.000đ</div>
                      <div className="text-[11px] text-neutral-400 mt-2">Đủ dự phòng sinh hoạt 6 tháng</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-3">
                      <span>Kiểm soát Ngân sách tháng này</span>
                      <span className="text-neutral-400 text-[11px]">Đã chi 14.200.000đ / Hạn mức 22.000.000đ</span>
                    </div>
                    <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden mb-3">
                      <div className="bg-emerald-400 h-full w-[64.5%]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-neutral-400">
                      <div>Ăn uống: <strong className="text-neutral-200">58%</strong></div>
                      <div>Nhà cửa: <strong className="text-neutral-200">85%</strong></div>
                      <div>Phát triển bản thân: <strong className="text-neutral-200">40%</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 4: HABITS */}
              {activeTab === "habits" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "Đọc sách 30 phút", streak: 28, target: "Mỗi ngày", status: "Đã hoàn thành", color: "text-indigo-400" },
                      { name: "Uống 2.5L nước", streak: 19, target: "Mỗi ngày", status: "Đã hoàn thành", color: "text-cyan-400" },
                      { name: "Tập Gym & Thể thao", streak: 12, target: "5 ngày/tuần", status: "Đang thực hiện", color: "text-emerald-400" },
                      { name: "Viết Nhật Ký Tối", streak: 16, target: "Mỗi ngày", status: "Đã hoàn thành", color: "text-pink-400" },
                    ].map((h, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className={`font-bold ${h.color}`}>{h.target}</span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            🔥 {h.streak} ngày
                          </span>
                        </div>
                        <div className="font-bold text-sm text-white mb-2">{h.name}</div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Trạng thái:</span>
                          <span className="text-emerald-400 font-semibold">{h.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <HeartPulse className="w-6 h-6 text-rose-400 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-sm text-white">Chỉ số Sức khỏe & Thể chất hôm nay</div>
                        <div className="text-xs text-neutral-400">Giấc ngủ: 7h45m • Nước: 2.2L • Tiêu thụ: 650 kcal • Tâm trạng: 5/5 ⭐</div>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex-shrink-0">
                      Chỉ số rất tốt
                    </span>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 5: AI LIFE COACH */}
              {activeTab === "ai" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-pink-950/25 border border-pink-500/30 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center flex-shrink-0 text-pink-400 font-bold">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div className="space-y-2 text-xs leading-relaxed text-neutral-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-pink-300 text-sm">Trợ lý Trí tuệ Nhân tạo LifeOS AI</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-300 font-medium">
                          Báo cáo phân tích tuần
                        </span>
                      </div>
                      <p>
                        "Chào bạn! Tuần qua bạn đã hoàn thành <strong>28/32 công việc</strong> (tỷ lệ 87.5%). Tuy nhiên, chi tiêu cho ăn uống ngoài đã chạm 85% hạn mức ngân sách tháng. Đề xuất: Hãy ưu tiên 2 phiên Pomodoro sáng mai cho mục tiêu OKR lớn nhất để giải phóng thời gian cuối tuần!"
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[11px] font-semibold transition">
                          Áp dụng gợi ý lịch trình
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 text-[11px] transition">
                          Phân tích sâu dòng tiền
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-400">
                    <span>Số dư tín dụng AI: <strong className="text-white">350 Lượt sử dụng</strong></span>
                    <span className="text-indigo-400">Tự động tổng hợp dữ liệu bảo mật từ toàn bộ 14 phân hệ</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROBLEM VS SOLUTION: BEFORE & AFTER LIFEOs */}
      <section id="comparison" className="py-20 sm:py-28 border-t border-white/[0.08] bg-neutral-950/70 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Bước Nhảy Vọt Về Năng Suất & Hiệu Quả
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Tại Sao Bạn Không Thể Tiếp Tục Dùng 10 Ứng Dụng Rời Rạc?
            </h3>
            <p className="text-neutral-400 text-sm sm:text-base">
              Bộ não của bạn sinh ra để tư duy, sáng tạo và tận hưởng cuộc sống, không phải để làm công việc nhập liệu thủ công giữa các phần mềm không kết nối được với nhau.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Problem: Without LifeOS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/50 border border-red-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider border-b border-l border-red-500/20">
                Trước Khi Dùng LifeOS
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mb-6">
                <X className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Hỗn Loạn, Phân Tán & Tốn Chi Phí</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Phải mở đồng thời Notion để ghi chú, Trello xem việc, Money Lover ghi tiền, Habitify theo dõi thói quen, Forest đếm giờ...</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Mất trung bình 45 phút mỗi ngày chỉ để copy-paste và cập nhật trạng thái qua lại giữa các ứng dụng.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Mục tiêu tài chính và ngân sách bị tách rời hoàn toàn với kế hoạch công việc và thói quen hàng ngày.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Tốn từ 600.000đ đến 1.500.000đ mỗi tháng cho tiền gia hạn bản quyền từng ứng dụng riêng lẻ.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Không có bức tranh tổng thể để biết mình đang tiến bộ hay thụt lùi trong cuộc sống.</span>
                </li>
              </ul>
            </div>

            {/* The Solution: With LifeOS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-neutral-900/80 to-neutral-900 border-2 border-indigo-500/50 relative overflow-hidden shadow-2xl shadow-indigo-950/50">
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow">
                Với Hệ Điều Hành LifeOS v2.0
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <Check className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Tập Trung, Tối Giản & Vận Hành Trơn Tru</h4>
              <ul className="space-y-4 text-sm text-neutral-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>1 Màn hình duy nhất:</strong> Đồng bộ tự động 14 phân hệ cuộc sống với độ trễ bằng 0.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Tự động hóa thông minh:</strong> Hoàn thành công việc tự động tính điểm năng suất và chuỗi thói quen.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Trợ lý AI đồng hành:</strong> Đọc hiểu toàn bộ nhịp sống của bạn để đưa ra lời khuyên thực tế và lên lịch làm việc.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Tiết kiệm 80% chi phí:</strong> Chỉ một gói duy nhất, hỗ trợ thanh toán VietQR chuyển khoản tức thì hoặc MoMo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Chủ quyền dữ liệu tuyệt đối:</strong> Sao lưu và xuất toàn bộ dữ liệu ra file CSV/JSON bất kỳ lúc nào.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS - 3 SIMPLE STEPS */}
      <section className="py-20 sm:py-28 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Bắt Đầu Nhanh Chóng
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Làm Chủ Cuộc Sống Chỉ Với 3 Bước
            </h3>
            <p className="text-neutral-400 text-sm sm:text-base">
              Không cần cài đặt phức tạp. Bạn có thể thiết lập không gian sống số hoàn chỉnh chỉ trong 3 phút.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg mb-5 border border-indigo-500/30">
                1
              </div>
              <h4 className="font-bold text-lg text-white mb-2">Đăng Ký Tài Khoản 30 Giây</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Đăng ký dễ dàng bằng email mà không cần thẻ tín dụng. Kích hoạt ngay 14 ngày dùng thử miễn phí đầy đủ tính năng cao cấp.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] relative">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-5 border border-purple-500/30">
                2
              </div>
              <h4 className="font-bold text-lg text-white mb-2">Thiết Lập Mục Tiêu & Ví Tiền</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Thêm các mục tiêu quý, tạo danh mục tài khoản ngân hàng và chọn 3-5 thói quen cốt lõi bạn muốn rèn luyện mỗi ngày.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] relative">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg mb-5 border border-pink-500/30">
                3
              </div>
              <h4 className="font-bold text-lg text-white mb-2">Để Trợ Lý AI Đồng Hành Mỗi Ngày</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Nhấn "Tạo kế hoạch ngày bằng AI" để trợ lý tự động phân bổ khung giờ tập trung, theo dõi ngân sách và nhắc nhở tiến độ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. THE 4 PILLARS & 14 SPECIALIZED MODULES */}
      <section id="modules" className="py-20 sm:py-28 border-t border-white/[0.08] bg-neutral-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Kiến Trúc Đa Tầng Hoàn Chỉnh
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              4 Trụ Cột Vững Chắc & 14 Phân Hệ Chuyên Sâu
            </h3>
            <p className="text-neutral-400 text-sm sm:text-base">
              Không phải là các trang ghi chép rời rạc. Mỗi phân hệ tại LifeOS là một giải pháp hoàn chỉnh với nghiệp vụ chặt chẽ, tối ưu cho cuộc sống hiện đại.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* PILLAR 1: PRODUCTIVITY */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-2.5 font-bold text-sm">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <span>1. Thực Thi & Năng Suất</span>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Công Việc (Tasks)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">Bảng Kanban</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Phân loại ưu tiên 4 cấp độ, hạn chót rõ ràng, phân loại nhãn và liên kết trực tiếp vào Dự án tương ứng.
                </p>
                <div className="text-[11px] text-indigo-400 font-medium">Bảng Kanban & Danh sách • Nhắc việc thông minh</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Dự Án (Projects)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300">Cột mốc mục tiêu</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Theo dõi tiến độ dự án lớn với các mốc then chốt, tự động tính tỷ lệ phần trăm hoàn thành theo số lượng task.
                </p>
                <div className="text-[11px] text-blue-400 font-medium">Tiến độ % tự động • Quản lý chặng đường</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Lịch Biểu (Calendar)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Thời khóa biểu</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Lịch trực quan theo ngày, tuần, tháng. Phân định rõ ràng lịch trình công việc, gia đình và phát triển cá nhân.
                </p>
                <div className="text-[11px] text-cyan-400 font-medium">Thời gian biểu • Sự kiện định kỳ</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Tập Trung Sâu (Pomodoro)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950 text-orange-300">Chu kỳ 25/5p</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Đồng hồ tập trung chuẩn khoa học, đếm phiên làm việc và tự động ghi nhận số phút Deep Work vào hồ sơ năng suất.
                </p>
                <div className="text-[11px] text-orange-400 font-medium">Chống xao nhãng • Thống kê số phút tập trung</div>
              </div>
            </div>

            {/* PILLAR 2: WEALTH & FINANCE */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2.5 font-bold text-sm">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>2. Tài Chính & Thịnh Vượng</span>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Sổ Ví Đa Tài Khoản</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">Đa ví tiền</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Quản lý tiền mặt, các tài khoản ngân hàng (Vietcombank, Techcombank, MB...), ví điện tử MoMo và tài khoản đầu tư.
                </p>
                <div className="text-[11px] text-emerald-400 font-medium">Tổng tài sản ròng • Chuyển quỹ nội bộ</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Thu Chi & Dòng Tiền</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">Thu & Chi</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Ghi chép giao dịch siêu tốc trong 3 giây. Phân tích chi tiết danh mục ăn uống, mua sắm, học tập và đầu tư.
                </p>
                <div className="text-[11px] text-emerald-400 font-medium">Báo cáo dòng tiền • Biểu đồ trực quan</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Ngân Sách Định Mức</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300">Ngân sách</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Thiết lập hạn mức chi tiêu hàng tháng theo từng hạng mục. Hệ thống tự động cảnh báo khi chi chạm ngưỡng 80%.
                </p>
                <div className="text-[11px] text-amber-400 font-medium">Cảnh báo vượt hạn mức • Tỷ lệ chi tiêu an toàn</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Sổ Vay & Nợ</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300">Sổ vay nợ</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Quản lý chặt chẽ các khoản vay ngân hàng, mua trả góp cũng như tiền cho bạn bè, người thân mượn kèm ngày hẹn trả.
                </p>
                <div className="text-[11px] text-rose-400 font-medium">Lịch trả nợ • Không lo quên các khoản cho mượn</div>
              </div>
            </div>

            {/* PILLAR 3: WELLNESS & MIND */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-300 flex items-center gap-2.5 font-bold text-sm">
                <HeartPulse className="w-4 h-4 text-pink-400" />
                <span>3. Thân - Tâm - Trí</span>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Thói Quen (Habits)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-pink-950 text-pink-300">Chuỗi ngày</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Xây dựng thói quen tốt với chuỗi ngày liên tục (Streak), đo lường mức độ kiên trì qua biểu đồ mật độ theo tháng.
                </p>
                <div className="text-[11px] text-pink-400 font-medium">Chuỗi streak liên tục • Biểu đồ nhiệt kiên trì</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Chỉ Số Thể Chất (Health)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300">Thể chất</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Ghi nhận số giờ ngủ, lượng nước nạp vào cơ thể, cân nặng và các buổi luyện tập thể thao hàng ngày.
                </p>
                <div className="text-[11px] text-rose-400 font-medium">Giấc ngủ • Lượng nước • Cân nặng • Tập luyện</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Nhật Ký Cảm Xúc</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300">Tâm trí</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Đo lường tâm trạng mỗi ngày (1 đến 5 sao), viết 3 điều biết ơn mỗi tối và bài học rút ra trong ngày.
                </p>
                <div className="text-[11px] text-purple-400 font-medium">Biểu đồ tâm trạng • Nuôi dưỡng lòng biết ơn</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Ghi Chú Nhanh (Notes)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-950 text-yellow-300">Ghi chú</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Lưu trữ ý tưởng chớp nhoáng, danh sách mua sắm, phân loại theo thư mục và ghim tài liệu quan trọng lên đầu.
                </p>
                <div className="text-[11px] text-yellow-400 font-medium">Ghim quan trọng • Định dạng văn bản phong phú</div>
              </div>
            </div>

            {/* PILLAR 4: GROWTH & NETWORK */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-2.5 font-bold text-sm">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>4. Trí Tuệ & Kết Nối</span>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Mục Tiêu Cuộc Đời (OKRs)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Mục tiêu lớn</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Hiện thực hóa ước mơ 1-5 năm thành các mốc hành động cụ thể, đo lường tỷ lệ hoàn thành theo từng quý.
                </p>
                <div className="text-[11px] text-cyan-400 font-medium">Mô hình OKR chuẩn • Đo lường kết quả then chốt</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Học Tập & Tủ Sách</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300">Tủ sách</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Quản lý danh sách sách đang đọc, khóa học trực tuyến và tiến độ tích lũy kỹ năng mới của bản thân.
                </p>
                <div className="text-[11px] text-teal-400 font-medium">Tủ sách cá nhân • Khóa học đang rèn luyện</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Sổ Quan Hệ (Personal CRM)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950 text-violet-300">Mối quan hệ</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Chăm sóc các mối quan hệ quan trọng (Gia đình, đối tác, bạn bè). Nhắc ngày sinh nhật và lần gặp gần nhất.
                </p>
                <div className="text-[11px] text-violet-400 font-medium">Nhắc ngày kỷ niệm • Quản trị mạng lưới cá nhân</div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/40 to-neutral-900 border border-pink-500/40">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span className="text-pink-300">Trí Tuệ Nhân Tạo AI</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">Trí tuệ AI</span>
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                  Bộ não phân tích dữ liệu cuộc sống, tự động xếp lịch ngày, cố vấn dòng tiền và đánh giá năng suất mỗi tuần.
                </p>
                <div className="text-[11px] text-pink-400 font-bold">Cá nhân hóa 100% • Tự động tư vấn thông minh</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DEDICATED AI SECTION */}
      <section id="ai" className="py-20 sm:py-28 border-t border-white/[0.08] relative overflow-hidden bg-gradient-to-b from-neutral-950 via-[#110c1c] to-neutral-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-pink-600/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Trợ Lý Trí Tuệ Nhân Tạo Cá Nhân Hóa</span>
            </div>
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Bộ Não Cố Vấn Số 24/7 Cho Cuộc Sống Của Bạn
            </h3>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Không chỉ là một chatbot trả lời câu hỏi thông thường. Trợ lý AI của LifeOS được kết nối an toàn với toàn bộ dữ liệu của bạn để đưa ra những phân tích và hành động thực tế nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Feature 1 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-pink-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/30">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">AI Lập Kế Hoạch Ngày Thông Minh</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                Chỉ với 1 chạm, AI quét toàn bộ danh sách việc cần làm, hạn chót deadline và thói quen để tự động sắp xếp thời gian biểu Deep Work tối ưu cho năng suất của bạn.
              </p>
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 italic">
                "Đã phân bổ 2 tiếng sáng cho việc khẩn cấp nhất, dời việc hành chính sang đầu giờ chiều để giữ nhịp năng lượng."
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-pink-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/30">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">AI Cố Vấn Dòng Tiền & Tiết Kiệm</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                Phân tích cơ cấu chi tiêu thực tế qua từng tuần, dự báo số dư cuối tháng và cảnh báo kịp thời các danh mục đang có xu hướng vượt định mức ngân sách.
              </p>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 italic">
                "Ăn uống ngoài đang chiếm 60% tổng chi tiêu. Nếu giảm 15% tuần này, bạn sẽ tiết kiệm thêm được 2.500.000đ."
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-pink-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/30">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">AI Tổng Kết Hiệu Suất Tuần</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                Mỗi cuối tuần, AI tự động tổng hợp báo cáo 360°: tỷ lệ hoàn thành công việc, số phút tập trung Pomodoro, các thói quen đạt chuỗi kỷ lục và đề xuất cải tiến cho tuần mới.
              </p>
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200 italic">
                "Điểm năng suất tuần: 92/100 (+14% so với tuần trước). Chuỗi thói quen đọc sách đạt 28 ngày liên tục."
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-pink-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-5 border border-pink-500/30">
                <Brain className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">AI Cố Vấn Phát Triển Cá Nhân</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                Luôn sẵn sàng lắng nghe tâm sự từ trang nhật ký, gợi ý phương pháp giải tỏa căng thẳng và định hướng lộ trình học tập để bạn chạm tới những mục tiêu cuộc đời.
              </p>
              <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/20 text-xs text-pink-200 italic">
                "Nhận thấy bạn đang có dấu hiệu quá tải. Đề xuất dành tối nay nghỉ ngơi, đi bộ 30 phút và ngủ trước 23:00."
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-brand text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:opacity-95 transition active:scale-95"
            >
              <span>Kích hoạt Trợ lý AI cho cuộc sống của bạn</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. INTERACTIVE EFFICIENCY CALCULATOR */}
      <section id="calculator" className="py-20 sm:py-28 border-t border-white/[0.08] bg-neutral-950/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Tính Toán Lợi Ích Kinh Tế & Thời Gian
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Bạn Tiết Kiệm Được Bao Nhiêu Khi Dùng LifeOS?
            </h3>
            <p className="text-neutral-400 text-sm sm:text-base">
              Kéo thanh trượt để ước tính số giờ quý báu và số tiền bạn sẽ tiết kiệm được mỗi tháng khi gom toàn bộ về LifeOS.
            </p>
          </div>

          <div className="p-6 sm:p-10 rounded-3xl bg-neutral-900/80 border border-white/[0.08] shadow-2xl">
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                <label htmlFor="apps-slider" className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  Số lượng ứng dụng riêng lẻ bạn đang sử dụng cùng lúc:
                </label>
                <span className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-base sm:text-lg shadow w-fit">
                  {appsCount} Ứng dụng
                </span>
              </div>
              <input
                id="apps-slider"
                aria-label="Số ứng dụng cá nhân bạn đang sử dụng cùng lúc"
                type="range"
                min="2"
                max="10"
                value={appsCount}
                onChange={(e) => setAppsCount(parseInt(e.target.value))}
                className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-2 font-medium">
                <span>2 Ứng dụng cơ bản</span>
                <span>5 Ứng dụng phổ biến</span>
                <span>10+ Ứng dụng phân mảnh</span>
              </div>
            </div>

            {/* Calculated Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-white/[0.08] text-center">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="text-xs text-neutral-400 mb-1 flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Thời gian tiết kiệm
                </div>
                <div className="text-3xl sm:text-4xl font-black text-indigo-400 mb-1">
                  ~{savedHoursPerMonth} Giờ
                </div>
                <div className="text-[11px] text-neutral-400">Mỗi tháng không phải chuyển đổi ứng dụng</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="text-xs text-neutral-400 mb-1 flex items-center justify-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Chi phí phần mềm tiết kiệm
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1">
                  ~{savedMoneyPerMonth.toLocaleString("vi-VN")}đ
                </div>
                <div className="text-[11px] text-neutral-400">So với mua riêng lẻ Notion, Todoist, Money Lover</div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="text-xs text-neutral-400 mb-1 flex items-center justify-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Mức độ tập trung tăng
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 mb-1">
                  +45%
                </div>
                <div className="text-[11px] text-neutral-400">Đo lường từ người dùng thực tế tại Việt Nam</div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
              >
                <span>Bắt đầu tiết kiệm thời gian & tiền bạc ngay hôm nay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ENTERPRISE SECURITY & DATA SOVEREIGNTY */}
      <section className="py-20 sm:py-28 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Bảo Mật & Quyền Riêng Tư Tuyệt Đối
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Dữ Liệu Cá Nhân Của Bạn Là Bất Khả Xâm Phạm
            </h3>
            <p className="text-neutral-400 text-sm sm:text-base">
              Chúng tôi áp dụng các tiêu chuẩn an toàn thông tin khắt khe nhất để bảo vệ thông tin tài chính và dữ liệu cá nhân của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Mã Hóa Chuẩn Ngân Hàng</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mọi đường truyền dữ liệu được bảo vệ bởi giao thức SSL/TLS 256-bit và phiên bảo mật chống tấn công giả mạo.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Phân Quyền Độc Lập</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Cơ chế Row-Level Security bảo đảm chỉ duy nhất tài khoản chính chủ mới có quyền truy cập dữ liệu của chính mình.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Sao Lưu Đám Mây Tự Động</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Cơ sở dữ liệu được sao lưu định kỳ, không lo mất mát dữ liệu ngay cả khi bạn đổi máy tính hoặc điện thoại mới.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Không Bán Dữ Liệu</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mô hình kinh doanh dựa trên phí phần mềm, cam kết 100% không chèn quảng cáo và không chia sẻ dữ liệu cho bên thứ ba.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. TESTIMONIALS & CASE STUDIES */}
      <section id="testimonials" className="py-20 sm:py-28 border-t border-white/[0.08] bg-neutral-950/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Cộng Đồng Người Dùng Việt Nam
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Được Tin Dùng Bởi Hơn 12.800+ Chuyên Gia & Người Thành Đạt
            </h3>
            <p className="text-neutral-400 text-sm sm:text-base">
              Lắng nghe cảm nhận thực tế từ những người đã thay đổi cách quản lý cuộc sống cùng LifeOS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                  "Trước đây mình rất mệt mỏi khi phải dùng Notion để ghi chép rồi lại mở Money Lover để note chi tiêu. LifeOS giải quyết chính xác bài toán này: tất cả hiển thị trên 1 màn hình duy nhất, đặc biệt tính năng AI gợi ý lịch trình cực kỳ chuẩn xác!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                  VH
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Nguyễn Văn Hùng</div>
                  <div className="text-xs text-neutral-400">Nhà sáng lập công ty Công nghệ</div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                  "Phân hệ Tài chính đa tài khoản và Ngân sách thực sự xuất sắc. Mình kiểm soát được dòng tiền giữa các tài khoản ngân hàng và MoMo trong tích tắc. Đã tiết kiệm thêm được 25% thu nhập mỗi tháng nhờ tính năng cảnh báo chi tiêu!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center font-bold text-white text-sm">
                  TP
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Trần Minh Phương</div>
                  <div className="text-xs text-neutral-400">Giám đốc Quản lý Sản phẩm (Product Manager)</div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                  "Giao diện dark mode quá đẹp và chuyên nghiệp! Pomodoro kết hợp với theo dõi thói quen giúp mình duy trì streak đọc sách và viết bài hơn 60 ngày liên tục. Quá xứng đáng đăng ký gói Pro để tối ưu cuộc sống!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
                  TH
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Lê Thu Hà</div>
                  <div className="text-xs text-neutral-400">Chuyên gia Tự do (Freelancer)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="py-20 sm:py-28 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Minh Bạch & Tiết Kiệm Tối Đa
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Bảng Giá Gói Tài Khoản LifeOS
            </h3>
            <p className="text-neutral-400 text-sm sm:text-base mb-8">
              Bắt đầu miễn phí trọn đời hoặc nâng cấp lên gói Pro để mở khóa toàn bộ 14 phân hệ và Trợ lý AI cao cấp.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-lg">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  billingCycle === "monthly" ? "bg-indigo-600 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                Thanh toán theo tháng
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                  billingCycle === "yearly" ? "bg-indigo-600 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>Thanh toán theo năm</span>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tiết kiệm 20%
                </span>
              </button>
            </div>

            {/* Coupons Promo Bar */}
            <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Mã giảm giá đang kích hoạt: Nhập <strong>WELCOME20</strong> (Giảm 20%) hoặc <strong>PRO50K</strong> (Giảm 50.000đ) khi thanh toán!</span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isPro = plan.slug === "pro";
              const isPremium = plan.slug === "premium";
              const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    isPro
                      ? "border-2 border-indigo-500 bg-gradient-to-b from-indigo-950/40 via-neutral-900 to-neutral-900 shadow-2xl shadow-indigo-500/25 scale-[1.02]"
                      : isPremium
                      ? "border border-purple-500/50 bg-gradient-to-b from-purple-950/30 via-neutral-900 to-neutral-900 shadow-xl"
                      : "border border-white/[0.08] bg-white/[0.03]"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-brand text-white font-bold text-xs uppercase tracking-wider shadow">
                      Lựa chọn phổ biến nhất
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                      {isPro && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                          Khuyên dùng
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mb-6 min-h-[36px]">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-3xl sm:text-4xl font-black text-white">
                        {price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`}
                      </span>
                      {price > 0 && (
                        <span className="text-neutral-400 text-xs ml-1.5">
                          /{billingCycle === "yearly" ? "năm" : "tháng"}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3.5 pt-6 border-t border-white/[0.08] mb-8 text-xs">
                      {plan.features?.map((f: any) => {
                        const featureLabel = FEATURE_NAMES_VI[f.featureKey] || f.featureKey.replace(/_/g, " ");
                        return (
                          <div key={f.id} className="flex items-center gap-3 text-neutral-300">
                            <CheckCircle2
                              className={`w-4 h-4 flex-shrink-0 ${
                                f.isEnabled ? (isPro ? "text-indigo-400" : "text-emerald-400") : "text-neutral-600"
                              }`}
                            />
                            <span className={f.isEnabled ? "font-medium" : "text-neutral-500 line-through"}>
                              {featureLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Link
                    href={plan.slug === "free" ? "/register" : `/pricing?plan=${plan.slug}&cycle=${billingCycle}`}
                    className={`w-full py-3.5 sm:py-4 px-4 rounded-xl text-center font-bold text-sm transition ${
                      isPro
                        ? "bg-gradient-brand text-white hover:opacity-95 shadow-lg shadow-indigo-500/25"
                        : isPremium
                        ? "bg-purple-600 hover:bg-purple-500 text-white"
                        : "bg-white/[0.08] hover:bg-white/[0.12] text-white"
                    }`}
                  >
                    {plan.slug === "free" ? "Bắt đầu miễn phí trọn đời" : "Nâng cấp gói ngay"}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Payment Gateways Bar */}
          <div className="mt-14 pt-8 border-t border-white/[0.08] max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Thanh toán an toàn, bảo mật chuẩn SSL 256-bit</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-semibold text-neutral-300">
              <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">Chuyển khoản VietQR tức thì</span>
              <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">Ví điện tử MoMo</span>
              <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">Thẻ Visa/Mastercard</span>
            </div>
          </div>
        </div>
      </section>

      {/* 13. FAQ ACCORDION */}
      <section id="faq" className="py-20 sm:py-28 border-t border-white/[0.08] bg-neutral-950/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Giải Đáp Thắc Mắc
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Câu Hỏi Thường Gặp
            </h3>
            <p className="text-neutral-400 text-sm">
              Mọi điều bạn cần biết về gói tài khoản, thanh toán và bảo mật thông tin trên LifeOS.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: "Tôi có bị mất dữ liệu khi chuyển đổi hoặc hết hạn gói không?",
                a: "Hoàn toàn không. Dữ liệu công việc, tài chính, nhật ký và thói quen của bạn luôn được lưu trữ an toàn trọn đời trên hệ thống. Ngay cả khi bạn quay về gói Miễn phí, bạn vẫn có thể xem và xuất (export) toàn bộ dữ liệu ra file CSV/JSON bất cứ lúc nào.",
              },
              {
                q: "Tôi có thể sử dụng LifeOS trên điện thoại iPhone và Android không?",
                a: "Có! LifeOS được thiết kế theo chuẩn Progressive Web App (PWA) cao cấp nhất hiện nay. Bạn chỉ cần mở trình duyệt Safari (trên iPhone) hoặc Chrome (trên Android), bấm 'Thêm vào màn hình chính' (Add to Home Screen) là có ngay ứng dụng chạy mượt mà, hỗ trợ thao tác một tay với giao diện di động chuyên nghiệp.",
              },
              {
                q: "Thanh toán gói cước như thế nào? Có kích hoạt tự động không?",
                a: "LifeOS hỗ trợ quét mã VietQR ngân hàng (Vietcombank, Techcombank, MB, ACB, BIDV...) và ví MoMo. Hệ thống tự động kiểm tra giao dịch và kích hoạt tài khoản Pro của bạn trong vòng 10 giây ngay sau khi thanh toán thành công.",
              },
              {
                q: "Trợ lý AI của LifeOS có sử dụng dữ liệu riêng tư của tôi không?",
                a: "Chúng tôi cam kết tuyệt đối: Dữ liệu cá nhân và chi tiêu của bạn được mã hóa an toàn và chỉ được AI sử dụng tạm thời để tạo lời khuyên cho riêng bạn. Hệ thống KHÔNG sử dụng dữ liệu của bạn để huấn luyện các mô hình AI công cộng.",
              },
              {
                q: "Chính sách hoàn tiền của LifeOS như thế nào?",
                a: "Chúng tôi áp dụng chính sách cam kết hoàn tiền 100% trong vòng 14 ngày nếu bạn không hài lòng với trải nghiệm phần mềm. Đội ngũ hỗ trợ 24/7 sẽ xử lý yêu cầu hoàn tiền của bạn nhanh chóng và văn minh.",
              },
              {
                q: "Tôi có thể xuất toàn bộ dữ liệu để lưu trữ riêng không?",
                a: "Chắc chắn rồi. Tại LifeOS, bạn có toàn quyền sở hữu dữ liệu của mình. Bạn có thể xuất bất kỳ lúc nào ra định dạng tiêu chuẩn (JSON, CSV, Excel) để lưu trữ trên máy tính cá nhân.",
              },
            ].map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-indigo-400 transition"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-neutral-300 leading-relaxed border-t border-white/[0.06] pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 14. FINAL CALL TO ACTION BANNER */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-[#070709] via-indigo-950/40 to-[#070709]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="p-8 sm:p-16 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 via-neutral-900 to-neutral-900 shadow-2xl shadow-indigo-950/80">
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center font-bold text-white text-2xl mx-auto mb-6 shadow-lg shadow-indigo-500/30">
              L
            </div>
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Sẵn Sàng Làm Chủ Cuộc Sống <br className="hidden sm:inline" />
              Của Bạn Ngay Hôm Nay?
            </h3>
            <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
              Gia nhập cùng hơn 12.800+ người đang vận hành công việc, tài chính và thói quen một cách có hệ thống, thông minh cùng LifeOS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-brand text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/30 hover:opacity-95 transition active:scale-[0.98]"
              >
                <span>Tạo tài khoản miễn phí trọn đời</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold text-base transition"
              >
                Xem chi tiết các gói Pro
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-neutral-400">
              <span>✓ Đăng ký trong 30 giây</span>
              <span>✓ Không cần thẻ tín dụng</span>
              <span>✓ Cam kết hoàn tiền trong 14 ngày</span>
            </div>
          </div>
        </div>
      </section>

      {/* 15. ENTERPRISE FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#050507] pt-16 pb-12 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand Col */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white text-xs shadow">
                  L
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-white tracking-tight">LifeOS</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">v2.0</span>
                </div>
              </Link>
              <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                Nền tảng quản lý cuộc sống cá nhân thế hệ mới. Hợp nhất công việc, mục tiêu, tài chính, thói quen và trí tuệ nhân tạo trong một không gian duy nhất.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hệ thống hoạt động ổn định 99.9% • Bảo mật SSL 256-bit</span>
              </div>
            </div>

            {/* Col 1: Product */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-sm">Sản Phẩm</h5>
              <ul className="space-y-2">
                <li><a href="#showcase" className="hover:text-white transition">Trải nghiệm mẫu</a></li>
                <li><a href="#comparison" className="hover:text-white transition">Giải pháp LifeOS</a></li>
                <li><a href="#modules" className="hover:text-white transition">14 Phân hệ chi tiết</a></li>
                <li><a href="#ai" className="hover:text-white transition">Trợ lý Trí tuệ AI</a></li>
                <li><a href="#calculator" className="hover:text-white transition">Công cụ tính tiết kiệm</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Bảng giá gói cước</a></li>
              </ul>
            </div>

            {/* Col 2: Modules */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-sm">Phân Hệ Cốt Lõi</h5>
              <ul className="space-y-2">
                <li><Link href="/tasks" className="hover:text-white transition">Công việc & Kanban</Link></li>
                <li><Link href="/finance" className="hover:text-white transition">Tài chính đa tài khoản</Link></li>
                <li><Link href="/habits" className="hover:text-white transition">Thói quen & Streak</Link></li>
                <li><Link href="/goals" className="hover:text-white transition">Mục tiêu cuộc đời OKRs</Link></li>
                <li><Link href="/pomodoro" className="hover:text-white transition">Tập trung sâu Pomodoro</Link></li>
                <li><Link href="/journal" className="hover:text-white transition">Nhật ký cảm xúc</Link></li>
              </ul>
            </div>

            {/* Col 3: Support & Legal */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-sm">Hỗ Trợ & Pháp Lý</h5>
              <ul className="space-y-2">
                <li><Link href="/support" className="hover:text-white transition">Trung tâm hỗ trợ 24/7</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Chính sách bảo mật</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Điều khoản dịch vụ</Link></li>
                <li><Link href="/refer" className="hover:text-white transition">Chương trình Giới thiệu (+7 ngày Pro)</Link></li>
                <li><Link href="/admin" className="hover:text-white transition">Cổng quản trị hệ thống</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
            <div>
              © 2026 LifeOS Platform. Bảo lưu mọi quyền. Nền tảng quản lý cuộc sống cá nhân số 1 Việt Nam.
            </div>
            <div className="flex items-center gap-6">
              <span>Được xây dựng cho người thành đạt & hiện đại</span>
              <span>•</span>
              <span className="text-neutral-400">VietQR • MoMo • Stripe Tích Hợp</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
