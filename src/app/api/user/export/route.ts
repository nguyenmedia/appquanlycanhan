import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      profile,
      tasks,
      projects,
      habits,
      goals,
      financeAccounts,
      financeTxns,
      budgets,
      debts,
      notes,
      journalEntries,
      healthLogs,
      learningItems,
      pomodoroSessions,
    ] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: user.id } }),
      prisma.task.findMany({ where: { userId: user.id } }),
      prisma.project.findMany({ where: { userId: user.id } }),
      prisma.habit.findMany({ where: { userId: user.id }, include: { logs: true } }),
      prisma.goal.findMany({ where: { userId: user.id } }),
      prisma.financeAccount.findMany({ where: { userId: user.id } }),
      prisma.financeTransaction.findMany({ where: { userId: user.id } }),
      prisma.budget.findMany({ where: { userId: user.id } }),
      prisma.debt.findMany({ where: { userId: user.id } }),
      prisma.note.findMany({ where: { userId: user.id } }),
      prisma.journalEntry.findMany({ where: { userId: user.id } }),
      prisma.healthLog.findMany({ where: { userId: user.id } }),
      prisma.learningItem.findMany({ where: { userId: user.id } }),
      prisma.pomodoroSession.findMany({ where: { userId: user.id } }),
    ]);

    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
      },
      profile,
      tasks,
      projects,
      habits,
      goals,
      finance: {
        accounts: financeAccounts,
        transactions: financeTxns,
        budgets,
        debts,
      },
      notes,
      journalEntries,
      healthLogs,
      learningItems,
      pomodoroSessions,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="lifeos-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Export user data error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
