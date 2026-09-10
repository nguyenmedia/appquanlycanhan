"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckSquare,
  FolderKanban,
  Calendar,
  Zap,
  Target,
  Wallet,
  BookOpen,
  Brain,
  Timer,
  Settings,
  CreditCard,
  UserCheck,
  User,
  LifeBuoy,
  X,
  Sparkles,
} from "lucide-react";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands = [
    { label: "Bảng điều khiển (Dashboard)", href: "/dashboard", icon: Zap, category: "Điều hướng" },
    { label: "Công việc (Tasks)", href: "/tasks", icon: CheckSquare, category: "Năng suất" },
    { label: "Dự án (Projects)", href: "/projects", icon: FolderKanban, category: "Năng suất" },
    { label: "Lịch biểu (Calendar)", href: "/calendar", icon: Calendar, category: "Năng suất" },
    { label: "Thói quen (Habits)", href: "/habits", icon: Zap, category: "Phát triển" },
    { label: "Mục tiêu (Goals & OKR)", href: "/goals", icon: Target, category: "Phát triển" },
    { label: "Quản lý Tài chính (Finance)", href: "/finance", icon: Wallet, category: "Tài chính" },
    { label: "Ghi chú & Sổ tay (Notes)", href: "/notes", icon: BookOpen, category: "Tri thức" },
    { label: "Đồng hồ tập trung (Pomodoro)", href: "/pomodoro", icon: Timer, category: "Tập trung" },
    { label: "Trợ lý AI & Lập kế hoạch", href: "/ai", icon: Brain, category: "Trí tuệ nhân tạo" },
    { label: "Thông tin cá nhân & Hồ sơ", href: "/settings/profile", icon: User, category: "Tài khoản" },
    { label: "Cài đặt & Bảo mật", href: "/settings", icon: Settings, category: "Tài khoản" },
    { label: "Gói cước & Đăng ký (Billing)", href: "/settings/billing", icon: CreditCard, category: "Tài khoản" },
    { label: "Giới thiệu bạn bè (Referral)", href: "/refer", icon: UserCheck, category: "Tài khoản" },
    { label: "Hỗ trợ & Trợ giúp (Support)", href: "/support", icon: LifeBuoy, category: "Hệ thống" },
    { label: "Quản trị SaaS (Admin)", href: "/admin", icon: Settings, category: "Quản trị" },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-neutral-800 bg-neutral-900/90">
          <Search className="w-5 h-5 text-neutral-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nhanh module, thao tác hoặc lệnh... (Ctrl + K)"
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-neutral-500 hover:text-neutral-300 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-neutral-800/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Không tìm thấy thao tác phù hợp với "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigateTo(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-neutral-300 hover:bg-neutral-800/80 hover:text-white transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs text-neutral-500 bg-neutral-800/60 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-neutral-800/80 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phím tắt: <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">ESC</kbd> để đóng</span>
          </div>
          <span>LifeOS Universal Search</span>
        </div>
      </div>
    </div>
  );
}
