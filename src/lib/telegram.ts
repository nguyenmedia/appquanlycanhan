/**
 * LifeOS Telegram Notification Bot Integration
 * Connected to Bot: @appquanlycanhan_bot
 * Target Chat ID: 8093505246
 */

const DEFAULT_BOT_TOKEN = "8931875715:AAGkdJgoIQZeBN1ccQKp1iP15WQF222J9Ng";
const DEFAULT_CHAT_ID = "8093505246";

export async function sendTelegramMessage(text: string, parseMode: "HTML" | "Markdown" = "HTML"): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;

    if (!token || !chatId) {
      console.warn("[Telegram Bot] Missing bot token or chat id.");
      return false;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram Bot] API Error:", data.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Telegram Bot] Network or execution error:", error);
    return false;
  }
}

/**
 * Notify when a customer initiates a VietQR / Banking Payment
 */
export async function notifyNewPaymentOrder(params: {
  orderId: string;
  userEmail: string;
  planName: string;
  amount: number;
  transferCode: string;
  method?: string;
}) {
  const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(params.amount);
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const msg = `
🧾 <b>[ĐƠN THANH TOÁN MỚI]</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> <code>${params.userEmail}</code>
📦 <b>Gói dịch vụ:</b> <b>${params.planName}</b>
💰 <b>Số tiền:</b> <code>${formattedAmount}</code>
🔖 <b>Mã chuyển khoản:</b> <code>${params.transferCode}</code>
💳 <b>Phương thức:</b> ${params.method || "VietQR Chuyển khoản"}
⏰ <b>Thời gian:</b> ${time}
━━━━━━━━━━━━━━━━━━
<i>Đang chờ khách hàng quét mã VietQR và xác nhận...</i>
`.trim();

  return sendTelegramMessage(msg);
}

/**
 * Notify when customer clicks "Tôi đã chuyển khoản"
 */
export async function notifyCustomerConfirmedTransfer(params: {
  orderId: string;
  userEmail: string;
  planName: string;
  amount: number;
  transferCode: string;
}) {
  const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(params.amount);
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const msg = `
🚨 <b>[KHÁCH HÀNG BÁO ĐÃ CHUYỂN TIỀN]</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> <code>${params.userEmail}</code>
📦 <b>Nâng cấp:</b> <b>${params.planName}</b>
💰 <b>Số tiền:</b> <b>${formattedAmount}</b>
🔖 <b>Mã nạp (Nội dung CK):</b> <code>${params.transferCode}</code>
⏰ <b>Thời gian:</b> ${time}
━━━━━━━━━━━━━━━━━━
👉 <b>Hành động:</b> Vui lòng kiểm tra biến động số dư ngân hàng và duyệt nâng cấp tài khoản tại Admin Dashboard!
`.trim();

  return sendTelegramMessage(msg);
}

/**
 * Notify when payment is successfully approved / activated
 */
export async function notifyPaymentSuccess(params: {
  orderId: string;
  userEmail: string;
  planName: string;
  amount: number;
  approvedBy?: string;
}) {
  const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(params.amount);
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const msg = `
✅ <b>[GIAO DỊCH THÀNH CÔNG - ĐÃ KÍCH HOẠT PRO]</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Tài khoản:</b> <code>${params.userEmail}</code>
🏆 <b>Gói mới:</b> <b>${params.planName} (ACTIVE)</b>
💵 <b>Thu về:</b> <code>${formattedAmount}</code>
🛡️ <b>Người duyệt:</b> ${params.approvedBy || "Hệ thống tự động (Webhook)"}
⏰ <b>Thời gian:</b> ${time}
━━━━━━━━━━━━━━━━━━
🎉 Tài khoản đã được nâng cấp quyền lợi VIP trên toàn hệ thống!
`.trim();

  return sendTelegramMessage(msg);
}

/**
 * Notify when a new customer support ticket is opened
 */
export async function notifyNewSupportTicket(params: {
  ticketNumber: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
}) {
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const msg = `
💬 <b>[YÊU CẦU HỖ TRỢ MỚI - TICKET #${params.ticketNumber}]</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> <code>${params.userEmail}</code>
🏷️ <b>Danh mục:</b> ${params.category} | <b>Ưu tiên:</b> ${params.priority}
📌 <b>Tiêu đề:</b> <b>${params.subject}</b>
📝 <b>Nội dung:</b>
<i>"${params.message}"</i>
⏰ <b>Thời gian:</b> ${time}
━━━━━━━━━━━━━━━━━━
👉 Vui lòng vào Trung Tâm Hỗ Trợ Admin để trả lời khách hàng!
`.trim();

  return sendTelegramMessage(msg);
}

/**
 * Notify when customer sends a reply message in support ticket
 */
export async function notifyCustomerReplyMessage(params: {
  ticketNumber: string;
  userEmail: string;
  message: string;
}) {
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const msg = `
📩 <b>[TIN NHẮN HỖ TRỢ MỚI TỪ KHÁCH HÀNG]</b>
━━━━━━━━━━━━━━━━━━
🎫 <b>Mã Ticket:</b> #${params.ticketNumber}
👤 <b>Khách hàng:</b> <code>${params.userEmail}</code>
💬 <b>Tin nhắn:</b>
<i>"${params.message}"</i>
⏰ <b>Thời gian:</b> ${time}
━━━━━━━━━━━━━━━━━━
👉 Đã ghi nhận vào cuộc trò chuyện 1:1.
`.trim();

  return sendTelegramMessage(msg);
}

/**
 * Notify when a new member registers an account
 */
export async function notifyNewUserRegistered(params: {
  email: string;
  fullName?: string;
  planName?: string;
}) {
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const msg = `
✨ <b>[THÀNH VIÊN MỚI GIA NHẬP LIFEOS]</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Họ tên:</b> ${params.fullName || "Chưa đặt"}
📧 <b>Email:</b> <code>${params.email}</code>
🏷️ <b>Gói khởi tạo:</b> ${params.planName || "Free Starter"}
⏰ <b>Thời gian:</b> ${time}
━━━━━━━━━━━━━━━━━━
🚀 Hệ thống tự động cấp phát không gian làm việc và đồng bộ Cloud!
`.trim();

  return sendTelegramMessage(msg);
}

/**
 * Generic system alert
 */
export async function notifySystemAlert(title: string, details: string) {
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const msg = `
⚡ <b>[THÔNG BÁO HỆ THỐNG LIFEOS]</b>
<b>${title}</b>
━━━━━━━━━━━━━━━━━━
${details}
⏰ <b>Thời gian:</b> ${time}
`.trim();

  return sendTelegramMessage(msg);
}
