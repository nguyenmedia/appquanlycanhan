import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);

    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: { select: { email: true, profile: { select: { fullName: true } } } },
        messages: {
          include: { user: { select: { email: true, profile: { select: { fullName: true } } } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
    const body = await req.json();
    const { action, ticketId, message, newStatus, newPriority, userId, subject, category = "general", priority = "medium" } = body;

    // Create new ticket on behalf of user
    if (action === "create_ticket") {
      let targetUserId = userId;
      if (!targetUserId) {
        const firstUser = await prisma.user.findFirst();
        targetUserId = firstUser?.id;
      }
      if (!targetUserId) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 400 });

      const ticketNumber = "TK-" + Math.floor(100000 + Math.random() * 900000);
      const ticket = await prisma.supportTicket.create({
        data: {
          ticketNumber,
          userId: targetUserId,
          subject: subject || "Yêu cầu hỗ trợ mới",
          category,
          priority,
          status: "open",
          messages: {
            create: {
              senderId: admin.id,
              senderRole: admin.role,
              message: message || "Ticket hỗ trợ đã được tạo bởi quản trị viên.",
            },
          },
        },
        include: { messages: true, user: true },
      });

      return NextResponse.json({ success: true, ticket });
    }

    if (!ticketId) return NextResponse.json({ error: "Thiếu ID ticket" }, { status: 400 });

    let finalMessage = message ? message.trim() : "";
    if (!finalMessage && newStatus) {
      if (newStatus === "in_progress") {
        finalMessage = "Quản trị viên đã tiếp nhận yêu cầu và đang tiến hành xử lý cho bạn.";
      } else if (newStatus === "resolved") {
        finalMessage = "Yêu cầu hỗ trợ của bạn đã được Quản trị viên xử lý hoàn tất. Cảm ơn bạn đã liên hệ!";
      } else if (newStatus === "closed") {
        finalMessage = "Phiếu yêu cầu hỗ trợ này đã được đóng.";
      }
    }

    if (finalMessage) {
      const createdMsg = await prisma.supportMessage.create({
        data: {
          ticketId,
          senderId: admin.id,
          senderRole: admin.role,
          message: finalMessage,
        },
      });

      // Sync message to Supabase
      try {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("support_messages").upsert({
          id: createdMsg.id,
          ticket_id: createdMsg.ticketId,
          sender_id: createdMsg.senderId,
          sender_role: createdMsg.senderRole,
          message: createdMsg.message,
          created_at: createdMsg.createdAt.toISOString(),
        });
      } catch (e) {}
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus || undefined,
        priority: newPriority || undefined,
        updatedAt: new Date(),
      },
      include: {
        user: { select: { email: true, profile: { select: { fullName: true } } } },
        messages: {
          include: { user: { select: { email: true, profile: { select: { fullName: true } } } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Sync updated ticket to Supabase
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("support_tickets").upsert({
        id: updatedTicket.id,
        user_id: updatedTicket.userId,
        ticket_number: updatedTicket.ticketNumber,
        subject: updatedTicket.subject,
        category: updatedTicket.category,
        priority: updatedTicket.priority,
        status: updatedTicket.status,
        updated_at: updatedTicket.updatedAt.toISOString(),
      });
    } catch (e) {}

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
