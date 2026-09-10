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
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
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

  // ROI Calculator estimations
  const savedHoursPerMonth = Math.round(appsCount * 6.5);
  const savedMoneyPerMonth = appsCount * 140000;

  return (
    <div className="min-h-screen bg-[#070709] text-neutral-100 selection:bg-indigo-500 selection:text-white font-sans">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <aside aria-label="Announcement" className="relative z-50 bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 border-b border-indigo-500/20 py-2.5 px-4 text-center text-xs font-medium text-neutral-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-semibold text-[11px]">
            <Sparkles className="w-3 h-3" />
            LIFEOS 2.0
          </span>
          <span>
            Hệ điều hành quản trị cuộc sống số toàn diện. Đồng bộ 14 module và Trợ lý AI cá nhân hóa.
          </span>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 ml-1"
          >
            Trải nghiệm miễn phí trọn đời <ArrowRight className="w-3.5 h-3.5 inline" />
          </Link>
        </div>
      </aside>

      {/* 2. STICKY GLASS NAVBAR */}
      <header className="sticky top-0 left-0 right-0 z-40 border-b border-neutral-800/80 bg-[#070709]/85 backdrop-blur-xl transition-all">
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
                Personal Operating System
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-sm font-medium">
            <a
              href="#modules"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition whitespace-nowrap shrink-0"
            >
              Tính năng
            </a>
            <a
              href="#comparison"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition whitespace-nowrap shrink-0"
            >
              Giải pháp
            </a>
            <a
              href="#ai"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Trợ lý AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            </a>
            <a
              href="#calculator"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition whitespace-nowrap shrink-0"
            >
              Hiệu quả (ROI)
            </a>
            <a
              href="#pricing"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition whitespace-nowrap shrink-0"
            >
              Bảng giá
            </a>
            <a
              href="#faq"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition whitespace-nowrap shrink-0"
            >
              Hỏi đáp
            </a>
            <Link
              href="/support"
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition whitespace-nowrap shrink-0 flex items-center gap-1.5 font-semibold"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Hỗ trợ</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                24/7
              </span>
            </Link>
          </nav>

          {/* Nav Actions */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Status indicator (visible on wide screens) */}
            <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 whitespace-nowrap shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SLA 99.9% Online</span>
            </div>

            <Link
              href="/login"
              className="text-sm font-semibold text-neutral-300 hover:text-white px-3 py-2 transition whitespace-nowrap shrink-0"
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
            className="lg:hidden p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <div className="space-y-1.5"><div className="w-6 h-0.5 bg-neutral-300" /><div className="w-6 h-0.5 bg-neutral-300" /><div className="w-4 h-0.5 bg-neutral-300" /></div>}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-neutral-800 bg-[#0c0c12]/95 backdrop-blur-2xl px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-base text-neutral-300">
              <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="py-1">Tổng quan giao diện</a>
              <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="py-1">Giải pháp LifeOS</a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="py-1">14 Modules chuyên biệt</a>
              <a href="#ai" onClick={() => setMobileMenuOpen(false)} className="py-1">Trợ lý AI Life Coach</a>
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="py-1">Tính toán ROI</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1">Bảng giá & Khuyến mãi</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1">Hỏi đáp thường gặp</a>
              <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="py-1 text-indigo-400 font-semibold flex items-center gap-2">
                <LifeBuoy className="w-4 h-4" />
                <span>Trung tâm hỗ trợ 24/7</span>
              </Link>
            </nav>
            <div className="pt-4 border-t border-neutral-800 flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-gradient-brand text-white shadow-lg shadow-indigo-500/25"
              >
                Tạo tài khoản miễn phí
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden bg-gradient-dark">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[350px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold tracking-wide mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Nền tảng Quản trị Cuộc sống Cá nhân All-in-One</span>
            <span className="hidden sm:inline text-neutral-500">•</span>
            <span className="hidden sm:inline text-neutral-400 font-normal">Công việc • Tiền bạc • Thói quen • AI</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
            Vận Hành Cuộc Sống Từ{" "}
            <br className="hidden sm:inline" />
            <span className="text-gradient-brand">Một Không Gian Duy Nhất</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-neutral-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Hợp nhất <strong>14 phương diện cốt lõi</strong> — Công việc (Tasks), Dự án, Tài chính đa tài khoản, Thói quen, Mục tiêu OKR, Sức khỏe và Trợ lý AI Life Coach. Chấm dứt hoàn toàn sự phân mảnh giữa hàng chục ứng dụng rời rạc.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-brand text-white font-semibold text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:opacity-95 transition active:scale-[0.98]"
            >
              <span>Bắt đầu miễn phí ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#showcase"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-neutral-700/80 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 font-semibold text-base transition flex items-center justify-center gap-2"
            >
              <span>Khám phá Live Demo</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </a>
          </div>

          {/* Trust Metrics & Partners */}
          <div className="pt-8 border-t border-neutral-800/80 max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-neutral-400 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-white font-semibold">4.9/5</span>
              <span>(12,800+ người dùng)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Mã hóa AES-256 & Supabase RLS</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Hỗ trợ VNPay, MoMo & Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-blue-400" />
              <span>Không yêu cầu thẻ ngân hàng</span>
            </div>
          </div>
        </div>

        {/* 4. INTERACTIVE PRODUCT SHOWCASE */}
        <div id="showcase" className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 relative z-20">
          {/* Feature Tabs Switcher */}
          <div className="flex items-center justify-center mb-6 overflow-x-auto pb-2 scrollbar-none">
            <div className="inline-flex p-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Tổng quan (Dashboard)</span>
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
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
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "finance"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Tài chính đa tài khoản</span>
              </button>
              <button
                onClick={() => setActiveTab("habits")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
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
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "ai"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Brain className="w-4 h-4 text-pink-400" />
                <span>AI Life Coach</span>
              </button>
            </div>
          </div>

          {/* Interactive Frame Wrapper */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-2xl p-3 sm:p-4 shadow-2xl shadow-indigo-950/40">
            <div className="rounded-2xl border border-neutral-800/80 bg-[#0c0c12] p-4 sm:p-7 overflow-hidden">
              {/* Fake Window Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                    https://lifeos.app/{activeTab}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Điểm năng suất ngày</span>
                        <span className="text-emerald-400 font-bold">+14%</span>
                      </div>
                      <div className="text-2xl font-black text-white">92/100</div>
                      <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[92%]" />
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Tổng tài sản ròng</span>
                        <span className="text-emerald-400 font-bold">+8.2%</span>
                      </div>
                      <div className="text-2xl font-black text-white">129.500.000đ</div>
                      <div className="text-[11px] text-neutral-400 mt-1">3 Tài khoản đang hoạt động</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Nhiệm vụ hôm nay</span>
                        <span className="text-indigo-400 font-bold">5/6 xong</span>
                      </div>
                      <div className="text-2xl font-black text-white">83.3%</div>
                      <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[83.3%]" />
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Chuỗi Streak dài nhất</span>
                        <span className="text-amber-400 font-bold">🔥 Đạt kỷ lục</span>
                      </div>
                      <div className="text-2xl font-black text-amber-400">24 Ngày</div>
                      <div className="text-[11px] text-neutral-400 mt-1">Đọc sách & Tập thể dục</div>
                    </div>
                  </div>

                  {/* Mid Row: 3 Panels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Panel 1: Tasks today */}
                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs text-neutral-300 font-bold mb-3">
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                          Công việc trọng tâm
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">Hôm nay</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-neutral-800/60 line-through text-neutral-500 flex items-center justify-between">
                          <span>Chạy bộ 5km buổi sáng</span>
                          <span className="text-[10px] text-emerald-400">Hoàn thành</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-neutral-800/60 line-through text-neutral-500 flex items-center justify-between">
                          <span>Duyệt báo cáo doanh thu tuần</span>
                          <span className="text-[10px] text-emerald-400">Hoàn thành</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 flex items-center justify-between">
                          <span className="font-semibold">Họp chiến lược sản phẩm Q4</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">Khẩn cấp</span>
                        </div>
                      </div>
                    </div>

                    {/* Panel 2: Finance Snapshot */}
                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs text-neutral-300 font-bold mb-3">
                        <span className="flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          Thu chi tháng 09/2026
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">Dương tiền</span>
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                          <span className="text-neutral-400">Tổng thu nhập</span>
                          <span className="font-bold text-emerald-400">+45.000.000đ</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                          <span className="text-neutral-400">Tổng chi tiêu</span>
                          <span className="font-bold text-rose-400">-12.850.000đ</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400">Tỷ lệ tiết kiệm</span>
                          <span className="font-bold text-indigo-400">71.4% (Rất tốt)</span>
                        </div>
                      </div>
                    </div>

                    {/* Panel 3: AI Life Coach Box */}
                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-300 font-bold mb-3">
                          <span className="flex items-center gap-1.5 text-pink-400">
                            <Brain className="w-4 h-4 text-pink-400" />
                            AI Copilot Gợi ý
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-pink-950 text-pink-300">Tự động</span>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed italic bg-pink-950/20 p-3 rounded-xl border border-pink-500/20">
                          "Bạn đã duy trì thói quen thức dậy lúc 6:00 AM được 14 ngày liên tục. Hiệu suất tập trung đạt đỉnh trong khung giờ 8:30 - 11:30. Đề xuất hoàn thành việc 'Họp chiến lược Q4' trước buổi trưa!"
                        </p>
                      </div>
                      <div className="mt-3 text-[11px] text-neutral-400 flex items-center justify-between">
                        <span>Được tính toán từ 32 data points</span>
                        <span className="text-pink-400 font-semibold cursor-pointer hover:underline">Hỏi thêm AI →</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: TASKS & PROJECTS */}
              {activeTab === "tasks" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Col 1: To Do */}
                    <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-3 pb-2 border-b border-neutral-800">
                        <span className="flex items-center gap-1.5 text-neutral-200">
                          <span className="w-2 h-2 rounded-full bg-neutral-400" /> Cần làm (To-do)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800">2</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                          <div className="font-semibold text-white mb-1">Nghiên cứu thị trường SaaS B2B</div>
                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Dự án Alpha</span>
                            <span>Hạn: 15/09</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                          <div className="font-semibold text-white mb-1">Tối ưu hóa ngân sách marketing</div>
                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Tài chính</span>
                            <span>Hạn: 18/09</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: In Progress */}
                    <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-3 pb-2 border-b border-neutral-800">
                        <span className="flex items-center gap-1.5 text-indigo-300">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Đang làm (In Progress)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300">1</span>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
                        <div className="font-semibold text-white mb-1">Thiết kế landing page LifeOS v2.0</div>
                        <p className="text-[11px] text-neutral-400 mb-2">Đang hoàn thiện phần ROI calculator & bảng giá</p>
                        <div className="flex items-center justify-between text-[11px] text-neutral-300">
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">Ưu tiên cao</span>
                          <span className="text-indigo-400 font-semibold">Tiến độ 85%</span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Done */}
                    <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-3 pb-2 border-b border-neutral-800">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Đã xong (Done)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">4</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 line-through text-neutral-500">
                          Tích hợp cổng VNPay & MoMo webhook
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 line-through text-neutral-500">
                          Thiết lập RLS Supabase Security
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 3: FINANCE */}
              {activeTab === "finance" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-neutral-900 border border-indigo-500/30">
                      <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
                        <span>Vietcombank Digibank</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30">Chính</span>
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
                      <div className="text-[11px] text-neutral-400 mt-2">Dùng ăn uống & mua sắm</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-neutral-900 border border-emerald-500/30">
                      <div className="flex items-center justify-between text-xs text-emerald-300 mb-2">
                        <span>Tài Khoản Tiết Kiệm</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/30">Lãi 6.8%</span>
                      </div>
                      <div className="text-2xl font-black text-white">34.750.000đ</div>
                      <div className="text-[11px] text-neutral-400 mt-2">Quỹ khẩn cấp 6 tháng</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-3">
                      <span>Kiểm soát Ngân sách tháng 09 (Budgets)</span>
                      <span className="text-neutral-400 text-[11px]">Đã chi 12.850.000đ / Hạn mức 20.000.000đ</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mb-3">
                      <div className="bg-emerald-400 h-full w-[64.2%]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-neutral-400">
                      <div>Ăn uống: <strong className="text-neutral-200">58%</strong></div>
                      <div>Nhà cửa: <strong className="text-neutral-200">90%</strong></div>
                      <div>Phát triển bản thân: <strong className="text-neutral-200">42%</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 4: HABITS */}
              {activeTab === "habits" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "Đọc sách 30 phút", streak: 24, target: "Mỗi ngày", status: "Hoàn thành", color: "text-indigo-400" },
                      { name: "Uống 2.5L nước", streak: 18, target: "Mỗi ngày", status: "Hoàn thành", color: "text-cyan-400" },
                      { name: "Tập Gym / Cardio", streak: 9, target: "5 ngày/tuần", status: "Đang thực hiện", color: "text-emerald-400" },
                      { name: "Viết Nhật Ký Tối", streak: 15, target: "Mỗi ngày", status: "Hoàn thành", color: "text-pink-400" },
                    ].map((h, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className={`font-bold ${h.color}`}>{h.target}</span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            🔥 {h.streak}d
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

                  <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HeartPulse className="w-6 h-6 text-rose-400" />
                      <div>
                        <div className="font-bold text-sm text-white">Chỉ số Sức khỏe & Vitals hôm nay</div>
                        <div className="text-xs text-neutral-400">Giấc ngủ: 7h45m • Nước: 2.2L • Calo tiêu thụ: 620 kcal</div>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                      Chỉ số rất tốt
                    </span>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 5: AI LIFE COACH */}
              {activeTab === "ai" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/30 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center flex-shrink-0 text-pink-400 font-bold">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div className="space-y-2 text-xs leading-relaxed text-neutral-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-pink-300 text-sm">LifeOS AI Copilot</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-300">
                          Báo cáo phân tích tuần
                        </span>
                      </div>
                      <p>
                        "Chào bạn! Tuần qua bạn đã hoàn thành <strong>28/32 công việc</strong> (đạt tỷ lệ 87.5%). Tuy nhiên, chi tiêu cho cà phê & ăn ngoài đã vượt ngân sách 450.000đ. Đề xuất: Hãy chuyển việc mua sách sang tuần sau và tận dụng khung giờ 8:00 - 10:00 sáng mai cho mục tiêu OKR lớn nhất!"
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button className="px-3 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[11px] font-semibold transition">
                          Áp dụng gợi ý lịch trình
                        </button>
                        <button className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] transition">
                          Phân tích sâu dòng tiền
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                    <span>Số dư AI Credits còn lại: <strong className="text-white">350 Credits</strong></span>
                    <span className="text-indigo-400">Hỗ trợ mô hình: GPT-4o & Claude 3.5 Sonnet</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROBLEM VS SOLUTION: BEFORE & AFTER LIFEOs */}
      <section id="comparison" className="py-24 border-t border-neutral-800/80 bg-neutral-950/70 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Bước Nhảy Vọt Về Năng Suất
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Tại Sao Bạn Không Thể Tiếp Tục Dùng 10 Ứng Dụng Rời Rạc?
            </h3>
            <p className="text-neutral-400 text-base">
              Bộ não của bạn sinh ra để tư duy và kiến tạo, không phải để làm công việc copy-paste giữa các phần mềm không thể kết nối với nhau.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Problem: Without LifeOS */}
            <div className="p-8 rounded-3xl bg-neutral-900/50 border border-red-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider border-b border-l border-red-500/20">
                Trước Khi Có LifeOS
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mb-6">
                <X className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Hỗn Loạn, Phân Tán & Quá Tải</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Mở Notion ghi chú, Trello xem việc, Excel tính tiền, Habitify theo dõi thói quen, Forest bấm giờ...</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Mất trung bình 45 phút mỗi ngày chỉ để cập nhật trạng thái qua lại giữa các ứng dụng.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Mục tiêu tài chính hoàn toàn tách rời với kế hoạch công việc và thói quen hàng ngày.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Tốn từ 600.000đ - 1.500.000đ mỗi tháng cho phí đăng ký từng ứng dụng lẻ tẻ.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Không có bức tranh tổng thể để biết mình đang tiến bộ hay thụt lùi trong cuộc sống.</span>
                </li>
              </ul>
            </div>

            {/* The Solution: With LifeOS */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-neutral-900/80 to-neutral-900 border-2 border-indigo-500/50 relative overflow-hidden shadow-2xl shadow-indigo-950/50">
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow">
                Với LifeOS v2.0
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <Check className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Tập Trung, Tối Giản & Vận Hành Trơn Tru</h4>
              <ul className="space-y-4 text-sm text-neutral-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>1 Màn hình duy nhất</strong> đồng bộ 14 module cuộc sống với độ trễ bằng 0.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Tự động hóa thông minh:</strong> Hoàn thành task tự động cộng điểm, tính streak thói quen.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Trợ lý AI đồng hành:</strong> Đọc hiểu toàn bộ nhịp sống của bạn để đưa ra lời khuyên thực tế.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Tiết kiệm 80% chi phí:</strong> Chỉ một gói cước duy nhất, hỗ trợ thanh toán VNPay, MoMo thuận tiện.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Chủ quyền dữ liệu:</strong> Xuất toàn bộ dữ liệu ra CSV/JSON bất kỳ lúc nào bạn muốn.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE 4 PILLARS & 14 SPECIALIZED MODULES */}
      <section id="modules" className="py-24 border-t border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Kiến Trúc Đa Tầng Hoàn Chỉnh
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              4 Trụ Cột Vững Chắc & 14 Module Chuyên Sâu
            </h3>
            <p className="text-neutral-400 text-base">
              Không phải là các trang danh sách đơn giản. Mỗi module tại LifeOS là một giải pháp hoàn chỉnh với logic nghiệp vụ chặt chẽ, tối ưu cho cuộc sống hiện đại.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* PILLAR 1: PRODUCTIVITY */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-2.5 font-bold text-sm">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <span>1. Thực Thi & Năng Suất</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Công Việc (Tasks)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">Kanban</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Phân loại ưu tiên Ma trận Eisenhower, hạn chót Deadline, phân thẻ Tags và gắn vào Dự án cụ thể.
                </p>
                <div className="text-[11px] text-indigo-400 font-medium">Bảng Kanban & Danh sách • Nhắc việc</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Dự Án (Projects)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300">Milestones</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Theo dõi tiến độ dự án lớn với các cột mốc, tính phần trăm hoàn thành tự động theo số task.
                </p>
                <div className="text-[11px] text-blue-400 font-medium">Tiến độ % tự động • Trạng thái động</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Lịch Biểu (Calendar)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Schedule</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Thời khóa biểu ngày, tuần, tháng. Phân định rõ ràng sự kiện công việc, gia đình và cá nhân.
                </p>
                <div className="text-[11px] text-cyan-400 font-medium">Thời gian biểu • Sự kiện định kỳ</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Pomodoro Focus</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950 text-orange-300">25/5 min</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Đồng hồ tập trung chuẩn khoa học, tự động ghi nhận số phiên hoàn thành vào nhật ký hiệu suất.
                </p>
                <div className="text-[11px] text-orange-400 font-medium">Chống xao nhãng • Lịch sử phiên học</div>
              </div>
            </div>

            {/* PILLAR 2: WEALTH & FINANCE */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2.5 font-bold text-sm">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>2. Tài Chính & Thịnh Vượng</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Đa Tài Khoản</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">Accounts</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Theo dõi tiền mặt, tài khoản ngân hàng (VCB, TCB, MB...), ví điện tử MoMo và sổ tiết kiệm.
                </p>
                <div className="text-[11px] text-emerald-400 font-medium">Tổng tài sản ròng • Chuyển quỹ nội bộ</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Thu Chi & Dòng Tiền</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">Cashflow</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Ghi chép giao dịch nhanh trong 3 giây. Phân tích danh mục ăn uống, sinh hoạt, đầu tư rõ ràng.
                </p>
                <div className="text-[11px] text-emerald-400 font-medium">Báo cáo dòng tiền • Biểu đồ trực quan</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Quản Lý Ngân Sách</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300">Budgets</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Thiết lập hạn mức chi tiêu hàng tháng theo từng hạng mục. Cảnh báo thông minh khi sắp chạm trần.
                </p>
                <div className="text-[11px] text-amber-400 font-medium">Cảnh báo vượt ngân sách • Tỷ lệ chi</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Khoản Nợ & Cho Mượn</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300">Debts</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Theo dõi tiến độ thanh toán khoản vay mua nhà/xe và các khoản cho người thân bạn bè mượn.
                </p>
                <div className="text-[11px] text-rose-400 font-medium">Lịch trả nợ • Tránh quên tiền cho mượn</div>
              </div>
            </div>

            {/* PILLAR 3: WELLNESS & MIND */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-300 flex items-center gap-2.5 font-bold text-sm">
                <HeartPulse className="w-4 h-4 text-pink-400" />
                <span>3. Thân - Tâm - Trí</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Thói Quen (Habits)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-pink-950 text-pink-300">Streaks</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Xây dựng thói quen tích cực với chuỗi Streak liên tục, đo lường sự kiên định theo tuần và tháng.
                </p>
                <div className="text-[11px] text-pink-400 font-medium">Chuỗi ngày liên tục • Heatmap 30 ngày</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Sức Khỏe & Vitals</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300">Health</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Ghi nhận số giờ ngủ, lượng nước uống, cân nặng và các buổi luyện tập thể thao hàng ngày.
                </p>
                <div className="text-[11px] text-rose-400 font-medium">Giấc ngủ • Nước • Cân nặng • Cardio</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Nhật Ký Cảm Xúc</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300">Journal</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Đo lường tâm trạng (Tuyệt vời, Tốt, Bình thường, Căng thẳng) và viết 3 điều biết ơn mỗi tối.
                </p>
                <div className="text-[11px] text-purple-400 font-medium">Biểu đồ tâm trạng • Lòng biết ơn</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Ghi Chú (Notes)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-950 text-yellow-300">Markdown</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Lưu trữ ý tưởng chớp nhoáng, tài liệu, danh sách cần mua. Ghim lên đầu trang và tìm kiếm nhanh.
                </p>
                <div className="text-[11px] text-yellow-400 font-medium">Ghim quan trọng • Định dạng phong phú</div>
              </div>
            </div>

            {/* PILLAR 4: GROWTH & NETWORK */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-2.5 font-bold text-sm">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>4. Trí Tuệ & Kết Nối</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Mục Tiêu & OKRs</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Goals</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Biến ước mơ 1-5 năm thành các cột mốc hành động có thể đo lường và đạt được mỗi quý.
                </p>
                <div className="text-[11px] text-cyan-400 font-medium">Khung OKR chuẩn • Đo lường kết quả then chốt</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Học Tập (Learning)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300">Books & Skills</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Quản lý danh sách sách cần đọc, các khóa học trực tuyến và lộ trình rèn luyện kỹ năng mới.
                </p>
                <div className="text-[11px] text-teal-400 font-medium">Tủ sách cá nhân • Khóa học đang học</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 transition">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span>Quan Hệ (Personal CRM)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950 text-violet-300">Contacts</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  Chăm sóc các mối quan hệ quan trọng (Gia đình, bạn bè, đối tác). Nhắc ngày sinh nhật & lần hẹn gần nhất.
                </p>
                <div className="text-[11px] text-violet-400 font-medium">Nhắc ngày kỷ niệm • Quản trị quan hệ</div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/40 to-neutral-900 border border-pink-500/40">
                <h4 className="font-bold text-white text-base mb-1.5 flex items-center justify-between">
                  <span className="text-pink-300">AI Life Copilot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">GPT-4o</span>
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                  Bộ não phân tích dữ liệu cuộc sống, lập lịch tự động, cố vấn tài chính và đánh giá hiệu suất tuần.
                </p>
                <div className="text-[11px] text-pink-400 font-bold">Cá nhân hóa 100% • Tự động đánh giá</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE ROI & EFFICIENCY CALCULATOR */}
      <section id="calculator" className="py-24 border-t border-neutral-800/80 bg-neutral-950/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Tính Toán Lợi Ích Kinh Tế
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Bạn Tiết Kiệm Bao Nhiêu Khi Dùng LifeOS?
            </h3>
            <p className="text-neutral-400 text-base">
              Kéo thanh trượt để xem thời gian và chi phí bạn sẽ tiết kiệm được mỗi tháng khi chuyển đổi từ các ứng dụng rời rạc sang LifeOS.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-2xl">
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <label htmlFor="apps-slider" className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  Số ứng dụng quản lý cá nhân bạn đang sử dụng cùng lúc:
                </label>
                <span className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-lg shadow">
                  {appsCount} Ứng dụng
                </span>
              </div>
              <input
                id="apps-slider"
                aria-label="Số ứng dụng quản lý cá nhân bạn đang sử dụng cùng lúc"
                type="range"
                min="2"
                max="10"
                value={appsCount}
                onChange={(e) => setAppsCount(parseInt(e.target.value))}
                className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-2 font-medium">
                <span>2 Ứng dụng cơ bản</span>
                <span>5 Ứng dụng phổ biến</span>
                <span>10+ Ứng dụng rời rạc</span>
              </div>
            </div>

            {/* Calculated Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-800 text-center">
              <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Thời gian tiết kiệm
                </div>
                <div className="text-3xl sm:text-4xl font-black text-indigo-400 mb-1">
                  ~{savedHoursPerMonth} Giờ
                </div>
                <div className="text-[11px] text-neutral-500">Mỗi tháng không phải copy dữ liệu</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center justify-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Chi phí phần mềm tiết kiệm
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1">
                  ~{savedMoneyPerMonth.toLocaleString("vi-VN")}đ
                </div>
                <div className="text-[11px] text-neutral-500">So với mua lẻ Notion, Habit, Money apps</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1 flex items-center justify-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Mức độ tập trung tăng
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 mb-1">
                  +42%
                </div>
                <div className="text-[11px] text-neutral-500">Đo lường từ người dùng thực tế</div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
              >
                <span>Bắt đầu tiết kiệm thời gian ngay hôm nay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ENTERPRISE SECURITY & DATA SOVEREIGNTY */}
      <section className="py-20 border-t border-neutral-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Bảo Mật & Riêng Tư Tuyệt Đối
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Dữ Liệu Cuộc Sống Của Bạn Là Bất Khả Xâm Phạm
            </h3>
            <p className="text-neutral-400 text-base">
              Chúng tôi áp dụng các tiêu chuẩn an toàn thông tin khắt khe nhất để bảo vệ thông tin tài chính và cá nhân của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Mã Hóa Chuẩn Ngân Hàng</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mọi đường truyền được bảo vệ bởi giao thức SSL/TLS 256-bit và JWT HttpOnly session chống đánh cắp phiên.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Supabase RLS Phân Tách</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Cơ chế Row Level Security đảm bảo chỉ duy nhất tài khoản của bạn mới có quyền truy cập dữ liệu của chính mình.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Chủ Quyền Dữ Liệu</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Xuất toàn bộ dữ liệu tài chính, nhật ký, công việc ra định dạng CSV và JSON bất kỳ khi nào bạn cần.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">100% Không Bán Dữ Liệu</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Chúng tôi tạo doanh thu từ phí đăng ký người dùng, hoàn toàn không bán quảng cáo hay dữ liệu cho bên thứ ba.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS & CASE STUDIES */}
      <section id="testimonials" className="py-24 border-t border-neutral-800/80 bg-neutral-950/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Cộng Đồng Người Dùng
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Được Tin Dùng Bởi Hơn 12,800+ Chuyên Gia & Người Thành Đạt
            </h3>
            <p className="text-neutral-400 text-base">
              Lắng nghe cảm nhận thực tế từ những người đã thay đổi cách quản lý cuộc sống cùng LifeOS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                  "Trước đây mình rất mệt mỏi khi phải dùng Notion để ghi chép rồi lại mở Money Lover để note chi tiêu. LifeOS giải quyết chính xác bài toán này: tất cả hiển thị trên 1 màn hình duy nhất, đặc biệt tính năng AI gợi ý lịch trình cực kỳ chính xác!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                  VH
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Nguyễn Văn Hùng</div>
                  <div className="text-xs text-neutral-400">Founder & CEO Công Nghệ</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                  "Module Tài chính đa tài khoản và Ngân sách thực sự xuất sắc. Mình kiểm soát được dòng tiền giữa các tài khoản VCB, Techcombank và MoMo trong tích tắc. Đã tiết kiệm thêm được 25% thu nhập mỗi tháng nhờ tính năng cảnh báo chi tiêu!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center font-bold text-white text-sm">
                  TP
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Trần Minh Phương</div>
                  <div className="text-xs text-neutral-400">Senior Product Manager</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                  "Giao diện dark mode quá đẹp và chuyên nghiệp! Pomodoro kết hợp với theo dõi thói quen giúp mình duy trì streak đọc sách và viết bài hơn 60 ngày liên tục. Quá xứng đáng nâng cấp lên gói Pro trọn năm!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
                  TH
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Lê Thu Hà</div>
                  <div className="text-xs text-neutral-400">Freelancer & Content Creator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="py-24 border-t border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Minh Bạch & Tiết Kiệm
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Bảng Giá Gói Dịch Vụ
            </h3>
            <p className="text-neutral-400 text-base mb-8">
              Bắt đầu miễn phí trọn đời hoặc nâng cấp lên gói Pro để khai phá toàn bộ 14 module và trợ lý AI.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                  billingCycle === "monthly" ? "bg-indigo-600 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                Thanh toán theo tháng
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                  billingCycle === "yearly" ? "bg-indigo-600 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>Thanh toán theo năm</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tiết kiệm 20%
                </span>
              </button>
            </div>

            {/* Coupons Promo Bar */}
            <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mã giảm giá đang hoạt động: Nhập <strong>WELCOME20</strong> (Giảm 20%) hoặc <strong>PRO50K</strong> (Giảm 50.000đ) khi thanh toán!</span>
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
                  className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    isPro
                      ? "border-2 border-indigo-500 bg-gradient-to-b from-indigo-950/40 via-neutral-900 to-neutral-900 shadow-2xl shadow-indigo-500/25 scale-[1.02]"
                      : isPremium
                      ? "border border-purple-500/50 bg-gradient-to-b from-purple-950/30 via-neutral-900 to-neutral-900 shadow-xl"
                      : "border border-neutral-800 bg-neutral-900/60"
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
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">
                        {price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`}
                      </span>
                      {price > 0 && (
                        <span className="text-neutral-400 text-xs ml-1.5">
                          /{billingCycle === "yearly" ? "năm" : "tháng"}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3.5 pt-6 border-t border-neutral-800/80 mb-8 text-xs">
                      {plan.features?.map((f: any) => (
                        <div key={f.id} className="flex items-center gap-3 text-neutral-300">
                          <CheckCircle2
                            className={`w-4 h-4 flex-shrink-0 ${
                              f.isEnabled ? (isPro ? "text-indigo-400" : "text-emerald-400") : "text-neutral-600"
                            }`}
                          />
                          <span className={f.isEnabled ? "font-medium" : "text-neutral-500 line-through"}>
                            {f.featureKey.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={plan.slug === "free" ? "/register" : `/pricing?plan=${plan.slug}&cycle=${billingCycle}`}
                    className={`w-full py-4 px-4 rounded-xl text-center font-bold text-sm transition ${
                      isPro
                        ? "bg-gradient-brand text-white hover:opacity-95 shadow-lg shadow-indigo-500/25"
                        : isPremium
                        ? "bg-purple-600 hover:bg-purple-500 text-white"
                        : "bg-neutral-800 hover:bg-neutral-700 text-white"
                    }`}
                  >
                    {plan.slug === "free" ? "Bắt đầu miễn phí trọn đời" : "Nâng cấp ngay"}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Payment Gateways Bar */}
          <div className="mt-14 pt-8 border-t border-neutral-800/80 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Thanh toán an toàn bảo mật chuẩn SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-4 font-semibold text-neutral-300">
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800">Cổng VNPay (QR Bank)</span>
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800">Ví MoMo</span>
              <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800">Thẻ Quốc Tế Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION */}
      <section id="faq" className="py-24 border-t border-neutral-800/80 bg-neutral-950/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Giải Đáp Thắc Mắc
            </h2>
            <h3 className="text-3xl font-extrabold text-white mb-4">
              Câu Hỏi Thường Gặp
            </h3>
            <p className="text-neutral-400 text-sm">
              Mọi điều bạn cần biết về gói tài khoản, thanh toán và bảo mật thông tin trên LifeOS.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: "Tôi có bị mất dữ liệu khi chuyển đổi hoặc hủy gói không?",
                a: "Hoàn toàn không. Dữ liệu công việc, tài chính, nhật ký và thói quen của bạn luôn được lưu trữ an toàn trọn đời trên hệ thống. Ngay cả khi bạn quay về gói Miễn phí, bạn vẫn có thể xem và xuất (export) toàn bộ dữ liệu ra file CSV/JSON bất cứ lúc nào.",
              },
              {
                q: "LifeOS hỗ trợ những hình thức thanh toán nào?",
                a: "Tại Việt Nam, LifeOS tích hợp cổng thanh toán VNPay (Quét mã QR từ mọi ứng dụng ngân hàng, thẻ ATM, Visa/Master) và Ví điện tử MoMo. Đối với người dùng quốc tế, chúng tôi hỗ trợ thẻ thanh toán quốc tế qua cổng Stripe.",
              },
              {
                q: "AI Credits hoạt động như thế nào và có bị hết hạn không?",
                a: "Mỗi tài khoản miễn phí được tặng sẵn 50 AI Credits để trải nghiệm. Gói Pro được cấp 300 credits/tháng và Premium được 1,000 credits/tháng. Credits dùng để trò chuyện với AI Life Coach, nhận phân tích tài chính và kế hoạch tuần. Credits không bị mất đi nếu bạn duy trì gói.",
              },
              {
                q: "Tôi có thể sử dụng LifeOS trên điện thoại di động không?",
                a: "Có! LifeOS được thiết kế theo chuẩn Responsive PWA hiện đại, tương thích hoàn hảo trên mọi kích thước màn hình từ Máy tính để bàn, Laptop, iPad/Tablet cho đến Điện thoại thông minh (iOS & Android).",
              },
              {
                q: "Chương trình Giới thiệu bạn bè (Referral) hoạt động ra sao?",
                a: "Mỗi người dùng có một liên kết giới thiệu độc quyền. Khi bạn bè của bạn đăng ký qua liên kết và nâng cấp tài khoản, cả hai người sẽ nhận thêm 7 ngày trải nghiệm Pro hoàn toàn miễn phí cùng 50 AI Credits thưởng!",
              },
              {
                q: "Tôi có thể hoàn tiền nếu không hài lòng không?",
                a: "Có, chúng tôi cam kết hoàn tiền 100% trong vòng 14 ngày đầu tiên nếu bạn cảm thấy LifeOS không phù hợp với nhu cầu sử dụng của mình mà không cần bất kỳ thủ tục rườm rà nào.",
              },
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
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
                    <div className="px-5 pb-5 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070709] via-indigo-950/40 to-[#070709]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="p-10 sm:p-16 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 via-neutral-900 to-neutral-900 shadow-2xl shadow-indigo-950/80">
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center font-bold text-white text-2xl mx-auto mb-6 shadow-lg shadow-indigo-500/30">
              L
            </div>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
              Sẵn Sàng Làm Chủ Cuộc Sống <br className="hidden sm:inline" />
              Của Bạn Ngay Hôm Nay?
            </h3>
            <p className="text-neutral-300 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
              Gia nhập cùng hơn 12,800+ người thành công đang vận hành công việc, tài chính và thói quen một cách có hệ thống cùng LifeOS.
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
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-white font-semibold text-base transition"
              >
                Xem chi tiết các gói Pro
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
              <span>✓ Đăng ký trong 30 giây</span>
              <span>✓ Không cần thẻ ngân hàng</span>
              <span>✓ Hoàn tiền 100% trong 14 ngày</span>
            </div>
          </div>
        </div>
      </section>

      {/* 13. ENTERPRISE FOOTER */}
      <footer className="border-t border-neutral-800 bg-[#050507] pt-16 pb-12 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand Col */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white text-xs shadow">
                  L
                </div>
                <span className="font-extrabold text-lg text-white tracking-tight">LifeOS</span>
              </Link>
              <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                Nền tảng quản lý cuộc sống cá nhân thế hệ mới. Hợp nhất công việc, mục tiêu, tài chính, thói quen và trí tuệ nhân tạo trong một không gian duy nhất.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Hệ thống hoạt động 100% • Bảo mật SSL 256-bit</span>
              </div>
            </div>

            {/* Col 1: Product */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-sm">Sản Phẩm</h5>
              <ul className="space-y-2">
                <li><a href="#showcase" className="hover:text-white transition">Tổng quan</a></li>
                <li><a href="#modules" className="hover:text-white transition">14 Modules</a></li>
                <li><a href="#ai" className="hover:text-white transition">Trợ lý AI Copilot</a></li>
                <li><a href="#calculator" className="hover:text-white transition">Tính toán ROI</a></li>
                <li><Link href="/pricing" className="hover:text-white transition">Bảng giá</Link></li>
              </ul>
            </div>

            {/* Col 2: Modules */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-sm">Hệ Thống Module</h5>
              <ul className="space-y-2">
                <li><Link href="/tasks" className="hover:text-white transition">Công việc (Tasks)</Link></li>
                <li><Link href="/finance" className="hover:text-white transition">Tài chính (Finance)</Link></li>
                <li><Link href="/habits" className="hover:text-white transition">Thói quen (Habits)</Link></li>
                <li><Link href="/goals" className="hover:text-white transition">Mục tiêu (OKRs)</Link></li>
                <li><Link href="/pomodoro" className="hover:text-white transition">Pomodoro Focus</Link></li>
              </ul>
            </div>

            {/* Col 3: Support & Legal */}
            <div className="space-y-3">
              <h5 className="font-bold text-white text-sm">Pháp Lý & Hỗ Trợ</h5>
              <ul className="space-y-2">
                <li><Link href="/support" className="hover:text-white transition">Trung tâm hỗ trợ</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Chính sách bảo mật</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Điều khoản dịch vụ</Link></li>
                <li><Link href="/refer" className="hover:text-white transition">Chương trình Giới thiệu</Link></li>
                <li><Link href="/admin" className="hover:text-white transition">Admin Portal</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
            <div>
              © 2026 LifeOS Platform. All rights reserved. Vận hành bởi LifeOS SaaS Technologies.
            </div>
            <div className="flex items-center gap-6">
              <span>Được xây dựng cho người thành đạt & hiện đại</span>
              <span>•</span>
              <span className="text-neutral-400">VNPay • MoMo • Stripe Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
