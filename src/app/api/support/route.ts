import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notifyNewSupportTicket, notifyCustomerReplyMessage } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          include: { user: { select: { email: true, profile: { select: { fullName: true } } } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { action = "create_ticket", ticketId, subject, category = "general", priority = "medium", message } = body;

    if (action === "reply" && ticketId) {
      if (!message || !message.trim()) {
        return NextResponse.json({ error: "Nội dung tin nhắn không được để trống" }, { status: 400 });
      }

      const ticket = await prisma.supportTicket.findFirst({
        where: { id: ticketId, userId: user.id },
      });

      if (!ticket) return NextResponse.json({ error: "Không tìm thấy ticket" }, { status: 404 });

      const newMsg = await prisma.supportMessage.create({
        data: {
          ticketId,
          senderId: user.id,
          senderRole: user.role,
          message: message.trim(),
        },
      });

      const updatedTicket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "open", updatedAt: new Date() },
      });

      // Sync to Supabase Cloud in background
      try {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("support_messages").upsert({
          id: newMsg.id,
          ticket_id: newMsg.ticketId,
          sender_id: newMsg.senderId,
          sender_role: newMsg.senderRole,
          message: newMsg.message,
          created_at: newMsg.createdAt.toISOString(),
        });
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
      } catch (e) {
        console.error("Supabase support sync error:", e);
      }

      // Send real-time Telegram notification to Admin
      notifyCustomerReplyMessage({
        ticketNumber: ticket.ticketNumber,
        userEmail: user.email,
        message: message.trim(),
      }).catch(console.error);

      return NextResponse.json({ success: true, message: newMsg });
    }

    // Default: create new ticket
    if (!subject || !message) {
      return NextResponse.json({ error: "Tiêu đề và nội dung yêu cầu là bắt buộc" }, { status: 400 });
    }

    const ticketNumber = `TICK-${Date.now().toString().slice(-6)}`;
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: user.id,
        subject: subject.trim(),
        category,
        priority,
        status: "open",
        messages: {
          create: {
            senderId: user.id,
            senderRole: user.role,
            message: message.trim(),
          },
        },
      },
      include: { messages: true },
    });

    // Send real-time Telegram notification to Admin
    notifyNewSupportTicket({
      ticketNumber: ticket.ticketNumber,
      userEmail: user.email,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      message: message.trim(),
    }).catch(console.error);

    // Sync to Supabase Cloud
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("support_tickets").upsert({
        id: ticket.id,
        user_id: ticket.userId,
        ticket_number: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        created_at: ticket.createdAt.toISOString(),
        updated_at: ticket.updatedAt.toISOString(),
      });
      if (ticket.messages[0]) {
        const firstMsg = ticket.messages[0];
        await supabase.from("support_messages").upsert({
          id: firstMsg.id,
          ticket_id: firstMsg.ticketId,
          sender_id: firstMsg.senderId,
          sender_role: firstMsg.senderRole,
          message: firstMsg.message,
          created_at: firstMsg.createdAt.toISOString(),
        });
      }
    } catch (e) {
      console.error("Supabase support ticket sync error:", e);
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
