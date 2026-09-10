"use client";

import React, { useState, useEffect, Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import UpgradeModal from "@/components/UpgradeModal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Send,
  Brain,
  Calendar,
  BarChart2,
  Wallet,
  Coins,
  Loader2,
  AlertCircle,
  Bot,
  User,
  CheckSquare,
  ArrowRight,
} from "lucide-react";

function AIContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [feature, setFeature] = useState<"ai_chat" | "ai_planner" | "ai_review" | "ai_finance" | "ai_coach">("ai_chat");

  useEffect(() => {
    if (queryTab) {
      const tabMap: Record<string, "ai_chat" | "ai_planner" | "ai_review" | "ai_finance" | "ai_coach"> = {
        chat: "ai_chat",
        planner: "ai_planner",
        finance: "ai_finance",
        review: "ai_review",
        coach: "ai_coach",
      };
      if (tabMap[queryTab]) {
        setFeature(tabMap[queryTab]);
      }
    }
  }, [queryTab]);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; credits?: number }>>([
    {
      role: "assistant",
      content: "Xin chào! Tôi là LifeOS AI Assistant. Tôi có thể giúp bạn lập kế hoạch ngày, đánh giá hiệu suất tuần, phân tích dòng tiền tài chính hoặc đưa ra chiến lược phát triển cá nhân. Bạn cần hỗ trợ gì hôm nay?",
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiBalance, setAiBalance] = useState<number>(20);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [taskCreatedFeedback, setTaskCreatedFeedback] = useState("");

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.user?.aiCredits?.balance !== undefined) {
        setAiBalance(json.user.aiCredits.balance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: "user" as const, content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature,
          prompt: textToSend,
        }),
      });

      const data = await res.json();
      if (res.ok && data.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content, credits: data.creditsUsed },
        ]);
        if (data.balanceRemaining !== undefined) {
          setAiBalance(data.balanceRemaining);
        }
      } else if (data.requiresUpgrade) {
        setUpgradeFeature(data.featureKey || "AI Pro Features");
        setUpgradeModalOpen(true);
      } else {
        alert(data.error || "Lỗi xử lý AI");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTaskFromAi = async (content: string) => {
    // Extract first sentence as title
    const firstLine = content.split("\n")[0].replace(/^[-*#\d.]\s*/, "").slice(0, 80);
    const title = firstLine || "Nhiệm vụ từ gợi ý của AI";

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: content.slice(0, 500),
          priority: "high",
          status: "todo",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTaskCreatedFeedback(`✓ Đã tạo công việc "${title}" vào danh sách Công việc!`);
        setTimeout(() => setTaskCreatedFeedback(""), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const modes = [
    { id: "ai_chat", label: "Hỏi đáp AI", cost: 1, icon: Brain },
    { id: "ai_planner", label: "Lập kế hoạch ngày", cost: 3, icon: Calendar },
    { id: "ai_review", label: "Đánh giá tuần", cost: 5, icon: BarChart2 },
    { id: "ai_finance", label: "Phân tích tài chính", cost: 5, icon: Wallet },
    { id: "ai_coach", label: "AI Life Coach", cost: 10, icon: Sparkles },
  ];

  const quickPills = [
    "Lập kế hoạch 3 việc quan trọng nhất cho hôm nay",
    "Rà soát chi tiêu tuần này và chỉ ra các khoản lãng phí",
    "Gợi ý khung giờ Deep Work phù hợp nhất cho tôi",
    "Làm sao để duy trì streak thói quen bền vững hơn?",
  ];

  return (
    <AppShell>
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Nâng cấp gói để sử dụng AI Nâng Cao"
        description="Tính năng bạn vừa chọn yêu cầu thêm quyền hạn từ gói Pro hoặc Premium."
        featureName={upgradeFeature}
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Toast Feedback */}
        {taskCreatedFeedback && (
          <div className="p-4 rounded-2xl bg-indigo-950 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-between shadow-xl">
            <span>{taskCreatedFeedback}</span>
            <Link href="/tasks" className="underline font-bold text-white hover:text-indigo-300">
              Mở trang Công việc →
            </Link>
          </div>
        )}

        {/* Header with Balance */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Brain className="w-6 h-6 text-pink-400" />
              <span>LifeOS AI Life Copilot</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Trí tuệ nhân tạo chuyên biệt kết nối dữ liệu công việc, thói quen và tài chính
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-neutral-400">Số dư AI Credits</div>
              <div className="text-lg font-bold text-white">{aiBalance} credits</div>
            </div>
          </div>
        </div>

        {/* Feature Mode Selector */}
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = feature === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setFeature(m.id as any)}
                className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                  isSelected
                    ? "border-pink-500 bg-pink-950/40 text-pink-200 shadow-md shadow-pink-500/10"
                    : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 font-mono text-neutral-400">
                  {m.cost}c
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-500 text-[11px] whitespace-nowrap">Gợi ý nhanh:</span>
          {quickPills.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 whitespace-nowrap transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Conversation Box */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 flex flex-col h-[520px] overflow-hidden shadow-2xl">
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0 border border-pink-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-2xl whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                      : "bg-neutral-950/80 border border-neutral-800 text-neutral-200 rounded-tl-none shadow-md"
                  }`}
                >
                  {msg.content}

                  {msg.role === "assistant" && idx > 0 && (
                    <div className="pt-3 mt-3 border-t border-neutral-850 flex items-center justify-between">
                      {msg.credits ? (
                        <span className="text-[10px] text-pink-400/80 font-mono">
                          • Tiêu hao: {msg.credits} credits
                        </span>
                      ) : (
                        <span />
                      )}

                      {/* 1-Click convert AI advice to Task */}
                      <button
                        type="button"
                        onClick={() => handleCreateTaskFromAi(msg.content)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 text-[11px] font-semibold flex items-center gap-1 transition"
                      >
                        <CheckSquare className="w-3 h-3" />
                        <span>Tạo việc từ gợi ý này</span>
                      </button>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 text-xs text-neutral-400 items-center">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0 border border-pink-500/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                  <span>Trợ lý AI đang phân tích dữ liệu cuộc sống của bạn...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input Bar */}
          <div className="p-3 sm:p-4 border-t border-neutral-800 bg-[#0d0d12]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Nhập yêu cầu hoặc câu hỏi cho trợ lý AI..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 transition"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-brand text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 hover:opacity-95 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function AIPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-sm text-neutral-400">
          Đang khởi tạo AI Assistant...
        </div>
      }
    >
      <AIContent />
    </Suspense>
  );
}

