import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);

    // 1. Pending bank transfers
    const pendingTxns = await prisma.paymentTransaction.findMany({
      where: {
        status: { in: ["pending", "processing"] },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const formattedTransfers = pendingTxns.map((t) => {
      let meta: any = {};
      try {
        if (t.metadataJson) meta = JSON.parse(t.metadataJson);
      } catch (e) {}

      return {
        id: t.id,
        transactionId: t.idempotencyKey,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        provider: t.provider,
        createdAt: t.createdAt,
        user: {
          id: t.user.id,
          email: t.user.email,
          fullName: t.user.profile?.fullName || t.user.email.split("@")[0],
          phone: t.user.profile?.phone || "",
        },
        planName: meta.planName || "LifeOS Pro",
        billingCycle: meta.billingCycle || "monthly",
        transferContent: `LIFEOS ${t.idempotencyKey}`,
      };
    });

    // 2. Only OPEN Support Tickets requiring admin attention (in_progress or resolved tickets are excluded from notification center)
    const openTickets = await prisma.supportTicket.findMany({
      where: {
        status: "open",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
            subscriptions: {
              where: { status: "active" },
              include: { plan: { select: { name: true, slug: true } } },
              take: 1,
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    const formattedTickets = openTickets.map((tk) => {
      const lastMsg = tk.messages[0];
      const activeSub = tk.user.subscriptions[0];
      const planName = activeSub?.plan?.name || "Gói Miễn Phí";

      return {
        id: tk.id,
        ticketNumber: tk.ticketNumber,
        subject: tk.subject,
        category: tk.category,
        priority: tk.priority,
        status: tk.status,
        createdAt: tk.createdAt,
        updatedAt: tk.updatedAt,
        user: {
          id: tk.user.id,
          email: tk.user.email,
          fullName: tk.user.profile?.fullName || tk.user.email.split("@")[0],
          planName,
        },
        lastMessage: lastMsg
          ? {
              text: lastMsg.message,
              senderRole: lastMsg.senderRole,
              createdAt: lastMsg.createdAt,
              isFromCustomer: lastMsg.senderRole === "USER",
            }
          : null,
      };
    });

    const totalCount = formattedTransfers.length + formattedTickets.length;

    return NextResponse.json({
      success: true,
      totalCount,
      transfersCount: formattedTransfers.length,
      supportCount: formattedTickets.length,
      transfers: formattedTransfers,
      supportTickets: formattedTickets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
