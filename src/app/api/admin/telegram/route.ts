import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);

    const botToken = process.env.TELEGRAM_BOT_TOKEN || "8931875715:AAGkdJgoIQZeBN1ccQKp1iP15WQF222J9Ng";
    const chatId = process.env.TELEGRAM_CHAT_ID || "8093505246";

    // Test connection to Telegram API
    let botInfo: any = null;
    let isConnected = false;

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await res.json();
      if (data.ok) {
        botInfo = data.result;
        isConnected = true;
      }
    } catch (e) {
      console.error("Telegram ping error:", e);
    }

    return NextResponse.json({
      success: true,
      connected: isConnected,
      botInfo,
      chatId,
      maskedToken: botToken.substring(0, 10) + "..." + botToken.substring(botToken.length - 6),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { message, type = "test" } = body;

    const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    let textToSend = "";
    if (type === "test") {
      textToSend = `
🔔 <b>[LIFEOS ADMIN TEST NOTIFICATION]</b>
━━━━━━━━━━━━━━━━━━
🛡️ <b>Người gửi:</b> ${admin.email} (${admin.role})
⏰ <b>Thời gian:</b> ${time}
💬 <b>Nội dung:</b> ${message || "Kiểm tra kết nối Bot Telegram tự động thành công 100%!"}
━━━━━━━━━━━━━━━━━━
🚀 Mọi giao dịch nạp tiền, tạo ticket và đăng ký mới đều đang được truyền tải tức thì.
`.trim();
    } else {
      textToSend = message;
    }

    const ok = await sendTelegramMessage(textToSend);

    if (!ok) {
      return NextResponse.json({ success: false, error: "Không thể gửi tin nhắn Telegram" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Đã gửi tin nhắn thông báo đến Telegram thành công!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
