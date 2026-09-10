"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Tag,
  ShieldCheck,
  LifeBuoy,
  Settings,
  ArrowLeft,
  Loader2,
  TrendingUp,
  QrCode,
  Cloud,
  Send,
} from "lucide-react";
import AdminNotificationCenter from "@/components/admin/AdminNotificationCenter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (!json.authenticated || !["ADMIN", "SUPER_ADMIN", "SUPPORT"].includes(json.user?.role)) {
          router.push("/dashboard");
        } else {
          setUser(json.user);
          if (json.maintenance) {
            setIsMaintenance(true);
          }
        }
      } catch (e) {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const navLinks = [
    { label: "SaaS Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Người dùng (Users)", href: "/admin/users", icon: Users },
    { label: "Khách hàng CRM", href: "/admin/crm", icon: TrendingUp },
    { label: "Gói cước (Plans)", href: "/admin/plans", icon: CreditCard },
    { label: "Mã giảm giá (Coupons)", href: "/admin/coupons", icon: Tag },
    { label: "Cổng thanh toán", href: "/admin/payments", icon: QrCode },
    { label: "Telegram Bot Alert", href: "/admin/telegram", icon: Send },
    { label: "Đồng bộ Supabase", href: "/admin/sync", icon: Cloud },
    { label: "Hỗ trợ (Support Desk)", href: "/admin/support", icon: LifeBuoy },
    { label: "Cài đặt hệ thống", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col md:flex-row">
      {/* ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 border-r border-neutral-800 bg-[#0c0c12] p-4 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between px-2 py-3 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20">
                A
              </div>
              <div>
                <span className="font-bold text-base text-white">LifeOS Admin</span>
                <span className="block text-[10px] text-amber-400 font-semibold uppercase">
                  {user?.role} Portal
                </span>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại ứng dụng cá nhân</span>
          </Link>
        </div>
      </aside>

      {/* ADMIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP ADMIN NAVBAR */}
        <header className="h-16 border-b border-neutral-800 bg-[#0c0c12]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            {isMaintenance ? (
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/35 text-[11px] font-bold text-rose-400 hover:bg-rose-500/25 transition"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>CHẾ ĐỘ BẢO TRÌ ĐANG BẬT</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hệ thống trực tuyến</span>
              </div>
            )}
            <span className="text-xs text-neutral-500 hidden sm:inline">|</span>
            <span className="text-xs text-neutral-400 hidden sm:inline">
              Cổng Quản Trị LifeOS VIP
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Transfer Approval Notification Center */}
            <AdminNotificationCenter />

            {/* Admin User Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800 text-xs">
              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-amber-400">
                {user?.email ? user.email[0].toUpperCase() : "A"}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-white font-medium truncate max-w-[120px]">{user?.email}</div>
                <div className="text-[10px] text-amber-400 font-semibold">{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
