"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Wallet,
  Target,
  Heart,
  BookOpen,
  Briefcase,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Productivity",
    "Finance",
    "Habits",
  ]);
  const [primaryTarget, setPrimaryTarget] = useState("Tăng năng suất và quản lý tài chính hiệu quả");
  const [submitting, setSubmitting] = useState(false);

  const interestOptions = [
    { id: "Productivity", label: "Năng suất công việc", icon: Zap },
    { id: "Finance", label: "Quản lý tài chính", icon: Wallet },
    { id: "Goals", label: "Mục tiêu & OKR", icon: Target },
    { id: "Habits", label: "Xây dựng thói quen", icon: Sparkles },
    { id: "Health", label: "Theo dõi sức khỏe", icon: Heart },
    { id: "Learning", label: "Học tập & Đọc sách", icon: BookOpen },
    { id: "Personal", label: "Nhật ký cá nhân", icon: Layers },
    { id: "Business", label: "Dự án kinh doanh", icon: Briefcase },
  ];

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim() || undefined,
          goals: selectedInterests,
          primaryTarget,
        }),
      });
      router.push("/dashboard");
    } catch (e) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2 w-full">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-indigo-500" : "bg-neutral-800"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="ml-4 text-xs text-neutral-500 hover:text-neutral-300 flex-shrink-0"
          >
            Bỏ qua
          </button>
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-brand flex items-center justify-center font-bold text-white text-2xl mx-auto mb-6 shadow-xl shadow-indigo-500/25 animate-pulse-glow">
              L
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Chào mừng bạn đến với LifeOS!
            </h2>
            <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
              Không gian điều hành cuộc sống toàn diện. Hãy dành 1 phút để thiết lập giao diện tối ưu nhất cho bạn.
            </p>
            <button
              onClick={() => setStep(2)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-brand text-white font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
            >
              <span>Bắt đầu thiết lập</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: NAME */}
        {step === 2 && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Tên hiển thị của bạn?</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Chúng tôi sẽ dùng tên này để cá nhân hóa lời chào và các phân tích trợ lý AI.
            </p>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên hoặc biệt danh"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-base text-white focus:outline-none focus:border-indigo-500 transition mb-8"
              autoFocus
            />
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-neutral-500 hover:text-white"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 transition"
              >
                <span>Tiếp tục</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INTERESTS */}
        {step === 3 && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Bạn muốn quản lý những gì?</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Chọn các khía cạnh bạn ưu tiên hàng đầu (có thể chọn nhiều).
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {interestOptions.map((opt) => {
                const isSelected = selectedInterests.includes(opt.id);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 text-white"
                        : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-neutral-500"}`} />
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-neutral-500 hover:text-white"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 transition"
              >
                <span>Tiếp tục</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PRIMARY TARGET */}
        {step === 4 && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Mục tiêu chính của bạn trong tháng này?</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Trợ lý AI sẽ căn cứ vào đây để đưa ra khuyến nghị hành động mỗi sáng.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Tăng năng suất và quản lý tài chính hiệu quả",
                "Xây dựng thói quen đọc sách và rèn luyện sức khỏe",
                "Hoàn thành dự án kinh doanh / công việc trọng tâm",
                "Kiểm soát chi tiêu và gia tăng quỹ tiết kiệm cá nhân",
              ].map((target, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrimaryTarget(target)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition ${
                    primaryTarget === target
                      ? "border-indigo-500 bg-indigo-950/40 text-white"
                      : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  {target}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(3)}
                className="text-xs text-neutral-500 hover:text-white"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 transition"
              >
                <span>Tiếp tục</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CREATING DASHBOARD */}
        {step === 5 && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Không gian của bạn đã sẵn sàng!</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-8">
              Chúng tôi đã cấu hình bảng điều khiển phù hợp với sở thích và mục tiêu của bạn.
            </p>
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl bg-gradient-brand text-white font-semibold text-sm inline-flex items-center gap-2 shadow-xl shadow-indigo-500/25 hover:opacity-95 transition"
            >
              <span>{submitting ? "Đang chuẩn bị..." : "Vào Bảng điều khiển ngay"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
