import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { executeAIOperation, getFeatureCreditCost } from "@/lib/ai";
import { hasFeature } from "@/lib/entitlement";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { prompt, feature = "ai_chat" } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập nội dung yêu cầu" }, { status: 400 });
    }

    // Check plan feature entitlement if advanced feature
    if (feature === "ai_planner") {
      const allowed = await hasFeature(user.id, "ai_planner");
      if (!allowed) {
        return NextResponse.json(
          { error: "Tính năng AI Planner chỉ khả dụng từ gói Pro trở lên.", requiresUpgrade: true, featureKey: "ai_planner" },
          { status: 403 }
        );
      }
    } else if (feature === "ai_coach") {
      const allowed = await hasFeature(user.id, "ai_life_coach");
      if (!allowed) {
        return NextResponse.json(
          { error: "Tính năng AI Life Coach chuyên sâu chỉ khả dụng trên gói Premium.", requiresUpgrade: true, featureKey: "ai_life_coach" },
          { status: 403 }
        );
      }
    }

    const result = await executeAIOperation({
      userId: user.id,
      feature,
      prompt: prompt.trim(),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("AI error:", error);
    return NextResponse.json({ error: error.message || "Lỗi xử lý AI" }, { status: 400 });
  }
}
