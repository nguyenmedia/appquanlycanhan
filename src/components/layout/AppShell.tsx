"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  Zap,
  Target,
  Wallet,
  BookOpen,
  BookMarked,
  Timer,
  HeartPulse,
  GraduationCap,
  Sparkles,
  BarChart3,
  CreditCard,
  UserCheck,
  ShieldCheck,
  LifeBuoy,
  LogOut,
  Search,
  Menu,
  X,
  ChevronRight,
  Plus,
  Coins,
  Globe,
} from "lucide-react";
import CommandPalette from "../CommandPalette";
import { useRealtimeSync } from "@/lib/sync";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          // If accessing protected routes, redirect to login
          if (
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/tasks") ||
            pathname.startsWith("/finance") ||
            pathname.startsWith("/admin")
          ) {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [pathname, router]);

  // Real-time multi-device synchronization via Supabase Realtime
  useRealtimeSync(user?.id, (entity) => {
    console.log("[Supabase Multi-Device Sync] Synced update:", entity);
  });


  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { label: "Công việc", href: "/tasks", icon: CheckSquare },
    { label: "Dự án", href: "/projects", icon: FolderKanban },
    { label: "Lịch biểu", href: "/calendar", icon: Calendar },
    { label: "Thói quen", href: "/habits", icon: Zap },
    { label: "Mục tiêu (OKR)", href: "/goals", icon: Target },
    { label: "Tài chính", href: "/finance", icon: Wallet },
    { label: "Ghi chú", href: "/notes", icon: BookOpen },
    { label: "Nhật ký", href: "/journal", icon: BookMarked },
    { label: "Pomodoro", href: "/pomodoro", icon: Timer },
    { label: "Sức khỏe", href: "/health", icon: HeartPulse },
    { label: "Học tập", href: "/learning", icon: GraduationCap },
    { label: "AI Assistant", href: "/ai", icon: Sparkles, badge: "AI" },
    { label: "Báo cáo", href: "/analytics", icon: BarChart3 },
    { label: "Hỗ trợ khách hàng", href: "/support", icon: LifeBuoy, badge: "24/7" },
  ];

  const planName = user?.plan?.name || "Free";
  const aiBalance = user?.aiCredits?.balance ?? 20;
  const isSuperAdminOrAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col md:flex-row">
      <CommandPalette />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-neutral-800/80 bg-[#0d0d12] p-4 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center justify-between px-2 py-3 mb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              L
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                LifeOS
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-400 -mt-1">
                Workspace
              </span>
            </div>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {planName}
          </span>
        </div>

        {/* Global Search Button (Ctrl + K) */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:text-white hover:border-neutral-700 transition mb-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Tìm kiếm...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700">
            Ctrl K
          </kbd>
        </button>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-400/20 text-indigo-300 font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin link if user has admin role */}
          {isSuperAdminOrAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition mt-4 ${
                pathname.startsWith("/admin")
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Quản trị SaaS</span>
            </Link>
          )}
        </nav>

        {/* AI Credit Usage Meter */}
        <div className="mt-4 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              AI Credits
            </span>
            <span className="font-semibold text-white">{aiBalance} khả dụng</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(10, (aiBalance / 300) * 100))}%` }}
            />
          </div>
          <Link
            href="/pricing"
            className="block text-center text-[11px] font-medium text-indigo-400 hover:text-indigo-300 mt-2"
          >
            Nâng cấp gói cước →
          </Link>
        </div>

        {/* Supabase Multi-Device Cloud Sync Indicator */}
        <div className="mt-3 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] flex items-center justify-between text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-neutral-300">Đồng bộ Cloud</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Supabase Realtime</span>
        </div>

        {/* User Card */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
              {user?.profile?.fullName?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-semibold text-white truncate">
                {user?.profile?.fullName || "Người dùng"}
              </span>
              <span className="block text-[10px] text-neutral-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#0d0d12] sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center font-bold text-white text-xs">
            L
          </div>
          <span className="font-bold text-base bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            LifeOS
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
            }}
            className="p-2 text-neutral-400 rounded-lg hover:bg-neutral-800"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 rounded-lg hover:bg-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE FULLSCREEN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-40 bg-neutral-950 p-4 overflow-y-auto pb-24">
          <div className="space-y-1 mb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium ${
                    isActive ? "bg-indigo-600 text-white" : "text-neutral-300 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <Link
              href="/settings/billing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-900"
            >
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <span>Gói cước & Đăng ký</span>
            </Link>
            <Link
              href="/refer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-900"
            >
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Giới thiệu bạn bè (+7 ngày Pro)</span>
            </Link>
            {isSuperAdminOrAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-amber-400 hover:bg-amber-950/40"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Quản trị SaaS</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/20"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-6">{children}</main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-800 bg-[#0d0d12]/95 backdrop-blur-lg flex items-center justify-around py-2 px-3">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            pathname === "/dashboard" ? "text-indigo-400 font-semibold" : "text-neutral-500"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Tổng quan</span>
        </Link>
        <Link
          href="/tasks"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            pathname === "/tasks" ? "text-indigo-400 font-semibold" : "text-neutral-500"
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Việc</span>
        </Link>

        {/* Floating Quick Action */}
        <button
          onClick={() => router.push("/tasks?new=true")}
          className="w-10 h-10 -mt-5 rounded-full bg-gradient-brand text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition"
        >
          <Plus className="w-5 h-5" />
        </button>

        <Link
          href="/calendar"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            pathname === "/calendar" ? "text-indigo-400 font-semibold" : "text-neutral-500"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Lịch</span>
        </Link>
        <Link
          href="/finance"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            pathname === "/finance" ? "text-indigo-400 font-semibold" : "text-neutral-500"
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Tài chính</span>
        </Link>
      </nav>
    </div>
  );
}
