"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle, Gift } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = "/onboarding";
      } else {
        setError(data.error || "Lỗi đăng ký tài khoản");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
            L
          </div>
          <span className="font-bold text-xl tracking-tight text-white">LifeOS</span>
        </Link>
        <h2 className="text-2xl font-bold text-white mb-2">Tạo tài khoản miễn phí</h2>
        <p className="text-xs text-neutral-400">
          Khởi đầu hành trình quản lý cuộc sống ngăn nắp và hiệu quả
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Họ và tên</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
            Mã giới thiệu (Nếu có)
          </label>
          <div className="relative">
            <Gift className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã giới thiệu"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition uppercase font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:opacity-95 transition active:scale-[0.98] disabled:opacity-50 mt-4"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Bắt đầu ngay</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500 mt-6">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-xs">Đang tải...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
