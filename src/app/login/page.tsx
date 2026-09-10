"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMaintenance, setIsMaintenance] = useState(false);

  React.useEffect(() => {
    fetch("/api/maintenance/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.maintenance) {
          setIsMaintenance(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("lifeos_token", data.token);
        }
        if (data.user) {
          localStorage.setItem("lifeos_user", JSON.stringify(data.user));
        }

        const isAdmin = data.user?.role === "ADMIN" || data.user?.role === "SUPER_ADMIN";
        const targetUrl = isAdmin
          ? "/admin"
          : !data.user?.onboardingCompleted
          ? "/onboarding"
          : "/dashboard";

        window.location.href = targetUrl;
      } else {
        if (data.maintenance) {
          setIsMaintenance(true);
        }
        setError(data.error || "Email hoặc mật khẩu không chính xác");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-8 shadow-2xl">
        {isMaintenance && (
          <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Chế độ bảo trì hệ thống đang BẬT</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Cổng đăng nhập hiện tại chỉ dành riêng cho tài khoản Quản trị viên (Admin).
            </p>
            <Link
              href="/maintenance"
              className="text-amber-400 underline font-semibold text-[11px] hover:text-amber-300 mt-0.5 inline-block"
            >
              Xem trang thông báo bảo trì →
            </Link>
          </div>
        )}

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
              L
            </div>
            <span className="font-bold text-xl tracking-tight text-white">LifeOS</span>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Đăng nhập tài khoản</h2>
          <p className="text-xs text-neutral-400">
            Truy cập không gian làm việc và quản lý cuộc sống của bạn
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Tên đăng nhập hoặc Email</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyenmedia@gmail.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:opacity-95 transition active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 mt-6">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </div>
  );
}
