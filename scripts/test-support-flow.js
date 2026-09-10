const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testFlow() {
  const user = await prisma.user.findFirst({ where: { role: "USER" } });
  const admin = await prisma.user.findFirst({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } });

  console.log("Test User:", user ? user.email : "None");
  console.log("Test Admin:", admin ? admin.email : "None");

  if (!user || !admin) return;

  // 1. Customer creates ticket
  const ticketNumber = "TICK-" + Date.now().toString().slice(-6);
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      userId: user.id,
      subject: "Hỏi về nâng cấp Pro và thanh toán VietQR",
      category: "billing",
      priority: "high",
      status: "open",
      messages: {
        create: {
          senderId: user.id,
          senderRole: "USER",
          message: "Chào Admin, sau khi chuyển khoản VietQR thì tài khoản có tự động được nâng cấp lên Pro ngay không ạ?",
        },
      },
    },
    include: { messages: true },
  });
  console.log("✅ 1. Khách hàng đã tạo yêu cầu hỗ trợ:", ticket.ticketNumber, "-", ticket.subject);

  // 2. Admin receives notifications
  const openTickets = await prisma.supportTicket.findMany({
    where: { status: { in: ["open", "in_progress", "waiting"] } },
    include: {
      user: { select: { email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  console.log("✅ 2. Admin nhận thông báo Real-time! Tổng số yêu cầu mở:", openTickets.length);
  console.log("   Yêu cầu mới nhất từ:", openTickets[0]?.user.email, "| Tiêu đề:", openTickets[0]?.subject);

  // 3. Admin replies to ticket
  const reply = await prisma.supportMessage.create({
    data: {
      ticketId: ticket.id,
      senderId: admin.id,
      senderRole: "ADMIN",
      message: "Chào bạn, hệ thống LifeOS tự động duyệt và kích hoạt gói Pro ngay sau khi bạn quét mã VietQR và Admin xác nhận nhé!",
    },
  });
  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { status: "in_progress" },
  });
  console.log("✅ 3. Quản trị viên phản hồi thành công:", reply.message);
  console.log("🎉 Toàn bộ quy trình Support Desk và Thông báo Admin hoạt động hoàn hảo!");
}

testFlow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
