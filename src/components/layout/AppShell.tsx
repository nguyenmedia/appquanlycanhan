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
  User,
  Settings,
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

  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setUser((prev: any) => ({
          ...prev,
          profile: e.detail.profile || e.detail,
          email: e.detail.email || prev?.email,
        }));
      }
    };
    window.addEventListener("lifeos-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("lifeos-profile-updated", handleProfileUpdate);
  }, []);

  // Real-time multi-device synchronization via Supabase Realtime
  useRealtimeSync(user?.id, (entity) => {
    console.log("[Supabase Multi-Device Sync] Synced update:", entity);
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "/dashboard": true,
    "/tasks": true,
    "/finance": true,
    "/ai": true,
  });

  const toggleExpand = (href: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  // Auto-expand menu if pathname matches
  useEffect(() => {
    if (pathname) {
      const matchKey = Object.keys(expandedMenus).find((key) => pathname.startsWith(key));
      if (matchKey && !expandedMenus[matchKey]) {
        setExpandedMenus((prev) => ({ ...prev, [matchKey]: true }));
      }
    }
  }, [pathname]);

  const navGroups = [
    {
      title: "Năng Suất & Điều Hành",
      items: [
        {
          label: "Tổng quan",
          href: "/dashboard",
          icon: LayoutDashboard,
          subItems: [
            { label: "Dashboard điều hành", href: "/dashboard" },
            { label: "Thao tác nhanh", href: "/dashboard#quick-actions" },
          ],
        },
        {
          label: "Công việc",
          href: "/tasks",
          icon: CheckSquare,
          subItems: [
            { label: "Tất cả công việc", href: "/tasks" },
            { label: "Bảng Kanban", href: "/tasks?view=kanban" },
            { label: "Dạng danh sách", href: "/tasks?view=list" },
            { label: "Việc khẩn cấp", href: "/tasks?priority=urgent" },
            { label: "Đã hoàn thành", href: "/tasks?status=done" },
          ],
        },
        {
          label: "Dự án",
          href: "/projects",
          icon: FolderKanban,
          subItems: [
            { label: "Danh mục dự án", href: "/projects" },
            { label: "Cột mốc & Tiến độ", href: "/projects?tab=milestones" },
          ],
        },
        {
          label: "Lịch biểu",
          href: "/calendar",
          icon: Calendar,
          subItems: [
            { label: "Lịch tổng hợp", href: "/calendar?filter=all" },
            { label: "Hạn chót công việc", href: "/calendar?filter=tasks" },
            { label: "Sự kiện & Cuộc hẹn", href: "/calendar?filter=events" },
          ],
        },
        {
          label: "Pomodoro Focus",
          href: "/pomodoro",
          icon: Timer,
          subItems: [
            { label: "Đồng hồ tập trung", href: "/pomodoro?tab=timer" },
            { label: "Lịch sử Deep Work", href: "/pomodoro?tab=history" },
          ],
        },
      ],
    },
    {
      title: "Tài Chính & Dòng Tiền",
      items: [
        {
          label: "Tài chính",
          href: "/finance",
          icon: Wallet,
          subItems: [
            { label: "Thu chi & Dòng tiền", href: "/finance?tab=transactions" },
            { label: "Sổ ví & Ngân hàng", href: "/finance?tab=accounts" },
            { label: "Ngân sách định mức", href: "/finance?tab=budgets" },
            { label: "Sổ nợ & Vay mượn", href: "/finance?tab=debts" },
          ],
        },
      ],
    },
    {
      title: "Thân - Tâm - Trí",
      items: [
        {
          label: "Thói quen",
          href: "/habits",
          icon: Zap,
          subItems: [
            { label: "Điểm danh hôm nay", href: "/habits?tab=today" },
            { label: "Chuỗi Streak kỷ lục", href: "/habits?tab=streaks" },
          ],
        },
        {
          label: "Mục tiêu (OKR)",
          href: "/goals",
          icon: Target,
          subItems: [
            { label: "Mục tiêu Quý / Năm", href: "/goals?tab=all" },
            { label: "Kết quả then chốt", href: "/goals?tab=results" },
          ],
        },
        {
          label: "Sức khỏe",
          href: "/health",
          icon: HeartPulse,
          subItems: [
            { label: "Chỉ số & Cân nặng", href: "/health?tab=metrics" },
            { label: "Giấc ngủ & Nước uống", href: "/health?tab=habits" },
          ],
        },
        {
          label: "Nhật ký",
          href: "/journal",
          icon: BookMarked,
          subItems: [
            { label: "Nhật ký ngày", href: "/journal?tab=entry" },
            { label: "Tâm trạng & Biết ơn", href: "/journal?tab=gratitude" },
          ],
        },
      ],
    },
    {
      title: "Tri Thức & Trợ Lý AI",
      items: [
        {
          label: "Ghi chú",
          href: "/notes",
          icon: BookOpen,
          subItems: [
            { label: "Tất cả tài liệu", href: "/notes?filter=all" },
            { label: "Đã ghim quan trọng", href: "/notes?filter=pinned" },
          ],
        },
        {
          label: "Học tập",
          href: "/learning",
          icon: GraduationCap,
          subItems: [
            { label: "Tủ sách đang đọc", href: "/learning?tab=books" },
            { label: "Khóa học & Kỹ năng", href: "/learning?tab=courses" },
          ],
        },
        {
          label: "AI Assistant",
          href: "/ai",
          icon: Sparkles,
          badge: "AI",
          subItems: [
            { label: "AI Trò chuyện", href: "/ai?tab=chat" },
            { label: "AI Lập kế hoạch", href: "/ai?tab=planner" },
            { label: "AI Cố vấn tài chính", href: "/ai?tab=finance" },
            { label: "AI Đánh giá tuần", href: "/ai?tab=review" },
            { label: "AI Huấn luyện viên", href: "/ai?tab=coach" },
          ],
        },
        {
          label: "Báo cáo 360°",
          href: "/analytics",
          icon: BarChart3,
          subItems: [
            { label: "Báo cáo tổng hợp", href: "/analytics?tab=all" },
            { label: "Xu hướng năng suất", href: "/analytics?tab=productivity" },
            { label: "Phân tích tài chính", href: "/analytics?tab=finance" },
            { label: "Sức khỏe & Thân tâm", href: "/analytics?tab=wellness" },
          ],
        },
        {
          label: "Hỗ trợ khách hàng",
          href: "/support",
          icon: LifeBuoy,
          badge: "24/7",
          subItems: [
            { label: "Trung tâm CSKH 24/7", href: "/support" },
            { label: "Gửi yêu cầu hỗ trợ", href: "/support#new-ticket" },
          ],
        },
      ],
    },
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
                Workspace Pro
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
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:text-white hover:border-neutral-700 transition mb-3 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Tìm kiếm nhanh...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700">
            Ctrl K
          </kbd>
        </button>

        {/* Navigation links with Groups & Collapsible Sub-Folders */}
        <nav className="flex-1 space-y-4 overflow-y-auto pr-1 text-xs">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isTopActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const isExpanded = expandedMenus[item.href];
                  const hasSub = item.subItems && item.subItems.length > 0;

                  return (
                    <div key={item.href} className="group">
                      <div
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                          isTopActive
                            ? "bg-indigo-600/90 text-white shadow-md shadow-indigo-600/25"
                            : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60"
                        }`}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-2.5 flex-1 overflow-hidden"
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isTopActive ? "text-white" : "text-neutral-400"}`} />
                          <span className="truncate text-sm">{item.label}</span>
                        </Link>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-400/20 text-indigo-300 font-bold">
                              {item.badge}
                            </span>
                          )}
                          {hasSub && (
                            <button
                              onClick={(e) => toggleExpand(item.href, e)}
                              className={`p-1 rounded-md hover:bg-white/10 transition ${
                                isTopActive ? "text-white/80" : "text-neutral-500 hover:text-neutral-200"
                              }`}
                              title={isExpanded ? "Thu gọn" : "Mở rộng"}
                            >
                              <ChevronRight
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sub-items list (collapsible tree) */}
                      {hasSub && isExpanded && (
                        <div className="ml-4 pl-2.5 border-l border-white/[0.08] space-y-0.5 mt-1 mb-1">
                          {item.subItems.map((sub, sIdx) => {
                            return (
                              <Link
                                key={sIdx}
                                href={sub.href}
                                className="group/sub flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/[0.05] transition"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover/sub:bg-indigo-400 transition-colors" />
                                <span className="truncate">{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin link if user has admin role */}
          {isSuperAdminOrAdmin && (
            <div className="pt-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                Khu vực Quản trị
              </div>
              <Link
                href="/admin"
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-sm font-medium transition ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "text-amber-400 hover:bg-amber-500/10"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Quản trị SaaS</span>
              </Link>
            </div>
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
          <Link
            href="/settings/profile"
            title="Xem & Chỉnh sửa hồ sơ cá nhân"
            className="flex items-center gap-2.5 overflow-hidden group hover:opacity-90 transition flex-1 min-w-0 pr-1.5"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 ring-1 ring-white/10 group-hover:ring-indigo-400 transition">
              {user?.profile?.fullName?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition">
                {user?.profile?.fullName || "Người dùng"}
              </span>
              <span className="block text-[10px] text-neutral-500 truncate">{user?.email}</span>
            </div>
          </Link>
          <div className="flex items-center gap-0.5">
            <Link
              href="/settings"
              title="Cài đặt tài khoản"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-[#0c0c14]/90 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white text-xs shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
            L
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              LifeOS
            </span>
            <span className="text-[10px] text-neutral-400 leading-none">
              Quản lý toàn diện
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
            }}
            className="p-2 text-neutral-400 rounded-xl hover:text-white hover:bg-white/[0.06] active:scale-95 transition"
            aria-label="Tìm kiếm"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl transition active:scale-95 ${
              mobileMenuOpen
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
            }`}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE FULLSCREEN DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-40 bg-[#09090e]/95 backdrop-blur-2xl p-4 overflow-y-auto pb-32 animate-in fade-in duration-150">
          {/* User Profile Card */}
          {user && (
            <Link
              href="/settings/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3.5 mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-indigo-500/40 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-md ring-1 ring-white/15">
                  {user.profile?.fullName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-sm text-white truncate group-hover:text-indigo-300 transition">
                    {user.profile?.fullName || "Người dùng LifeOS"}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {user.subscriptions?.[0]?.plan?.slug?.toUpperCase() || "PRO"}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
              </div>
            </Link>
          )}

          <div className="space-y-4 mb-6">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-1">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const isExpanded = expandedMenus[item.href];
                    const hasSub = item.subItems && item.subItems.length > 0;

                    return (
                      <div key={item.href} className="space-y-1">
                        <div
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                            isActive
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20"
                              : "text-neutral-300 hover:bg-white/[0.05]"
                          }`}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 flex-1 overflow-hidden"
                          >
                            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-indigo-400"}`} />
                            <span className="truncate">{item.label}</span>
                          </Link>
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-semibold">
                                {item.badge}
                              </span>
                            )}
                            {hasSub && (
                              <button
                                onClick={(e) => toggleExpand(item.href, e)}
                                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400"
                              >
                                <ChevronRight
                                  className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90 text-white" : ""}`}
                                />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Mobile Sub-items */}
                        {hasSub && isExpanded && (
                          <div className="ml-5 pl-3 border-l border-white/[0.08] space-y-1 py-1">
                            {item.subItems.map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/[0.05] transition"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
                                <span>{sub.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/[0.08] space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-1">
              Hệ thống & Tài khoản
            </div>
            <Link
              href="/settings/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-white/[0.05] transition"
            >
              <User className="w-4 h-4 text-indigo-400" />
              <span>Thông tin cá nhân & Hồ sơ</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-white/[0.05] transition"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Cài đặt & Bảo mật</span>
            </Link>
            <Link
              href="/settings/billing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-white/[0.05] transition"
            >
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Gói cước & Đăng ký</span>
            </Link>
            <Link
              href="/support"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-white/[0.05] transition"
            >
              <LifeBuoy className="w-4 h-4 text-sky-400" />
              <span>Hỗ trợ kỹ thuật 1:1</span>
            </Link>
            <Link
              href="/refer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-white/[0.05] transition"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Giới thiệu bạn bè (+7 ngày Pro)</span>
            </Link>
            {isSuperAdminOrAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-amber-400 hover:bg-amber-950/40 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Quản trị SaaS</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-950/20 transition mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6 touch-pan-y">{children}</main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#0c0c14]/90 backdrop-blur-2xl px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),10px)] flex items-center justify-around shadow-[0_-8px_25px_rgba(0,0,0,0.45)]">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            pathname === "/dashboard"
              ? "text-indigo-400 font-semibold"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {pathname === "/dashboard" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Tổng quan</span>
        </Link>

        <Link
          href="/tasks"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            pathname === "/tasks"
              ? "text-indigo-400 font-semibold"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {pathname === "/tasks" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Công việc</span>
        </Link>

        {/* Floating Quick Action Button */}
        <button
          onClick={() => router.push("/tasks?new=true")}
          aria-label="Tạo mới"
          className="relative -top-2.5 w-11 h-11 rounded-full bg-gradient-brand text-white flex items-center justify-center shadow-lg shadow-indigo-500/35 ring-4 ring-[#0c0c14] active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <Link
          href="/calendar"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            pathname === "/calendar"
              ? "text-indigo-400 font-semibold"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <div className="relative">
            <Calendar className="w-5 h-5" />
            {pathname === "/calendar" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Lịch biểu</span>
        </Link>

        <Link
          href="/finance"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            pathname === "/finance"
              ? "text-indigo-400 font-semibold"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <div className="relative">
            <Wallet className="w-5 h-5" />
            {pathname === "/finance" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Tài chính</span>
        </Link>
      </nav>
    </div>
  );
}
