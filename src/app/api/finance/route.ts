import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const [accounts, transactions, budgets, debts] = await Promise.all([
      prisma.financeAccount.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      }),
      prisma.financeTransaction.findMany({
        where: { userId: user.id },
        include: { account: true },
        orderBy: { date: "desc" },
        take: 50,
      }),
      prisma.budget.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.debt.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Calculate total net worth and this month's cash flow
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthTxns = transactions.filter((t) => new Date(t.date) >= currentMonthStart);
    const totalIncome = thisMonthTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = thisMonthTxns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalBalance,
        totalIncome,
        totalExpense,
        netCashflow: totalIncome - totalExpense,
      },
      accounts,
      transactions,
      budgets,
      debts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { action = "transaction" } = body;

    if (action === "account") {
      const { name, type = "bank", balance = 0, currency = "VND", color = "#3b82f6" } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Tên tài khoản không được để trống" }, { status: 400 });
      }

      const account = await prisma.financeAccount.create({
        data: {
          userId: user.id,
          name: name.trim(),
          type,
          balance: Number(balance),
          currency,
          color,
        },
      });

      return NextResponse.json({ success: true, account });
    }

    if (action === "budget") {
      const { category, monthlyLimit, alertThresholdPct = 80 } = body;
      const monthYear = new Date().toISOString().slice(0, 7);

      const budget = await prisma.budget.upsert({
        where: { userId_category_monthYear: { userId: user.id, category, monthYear } },
        update: {
          monthlyLimit: Number(monthlyLimit),
          alertThresholdPct: Number(alertThresholdPct),
        },
        create: {
          userId: user.id,
          category,
          monthlyLimit: Number(monthlyLimit),
          monthYear,
          alertThresholdPct: Number(alertThresholdPct),
        },
      });

      return NextResponse.json({ success: true, budget });
    }

    if (action === "debt") {
      const { type, personName, totalAmount, dueDate, notes } = body;
      if (!personName || !totalAmount) {
        return NextResponse.json({ error: "Vui lòng nhập tên người và số tiền" }, { status: 400 });
      }

      const debt = await prisma.debt.create({
        data: {
          userId: user.id,
          type: type || "lent",
          personName: personName.trim(),
          totalAmount: Number(totalAmount),
          dueDate: dueDate ? new Date(dueDate) : null,
          notes,
        },
      });

      return NextResponse.json({ success: true, debt });
    }

    // Default: Add Transaction with atomic balance update
    const { accountId, type, amount, category, description, payee, toAccountId, date } = body;
    const numAmount = Math.abs(Number(amount));

    if (!accountId || !type || !numAmount) {
      return NextResponse.json({ error: "Tài khoản, loại giao dịch và số tiền là bắt buộc" }, { status: 400 });
    }

    const account = await prisma.financeAccount.findFirst({
      where: { id: accountId, userId: user.id },
    });

    if (!account) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 404 });
    }

    // Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const txn = await tx.financeTransaction.create({
        data: {
          userId: user.id,
          accountId,
          type,
          amount: numAmount,
          category: category || "general",
          description,
          payee,
          toAccountId,
          date: date ? new Date(date) : new Date(),
        },
        include: { account: true },
      });

      // Update source balance
      if (type === "expense") {
        await tx.financeAccount.update({
          where: { id: accountId },
          data: { balance: { decrement: numAmount } },
        });
      } else if (type === "income") {
        await tx.financeAccount.update({
          where: { id: accountId },
          data: { balance: { increment: numAmount } },
        });
      } else if (type === "transfer" && toAccountId) {
        await tx.financeAccount.update({
          where: { id: accountId },
          data: { balance: { decrement: numAmount } },
        });
        await tx.financeAccount.update({
          where: { id: toAccountId },
          data: { balance: { increment: numAmount } },
        });
      }

      return txn;
    });

    return NextResponse.json({ success: true, transaction: result });
  } catch (error: any) {
    console.error("Finance API error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { action, id, isSettled, paidAmount } = body;

    if (action === "debt") {
      const debt = await prisma.debt.update({
        where: { id },
        data: {
          isSettled: isSettled !== undefined ? isSettled : undefined,
          paidAmount: paidAmount !== undefined ? Number(paidAmount) : undefined,
        },
      });
      return NextResponse.json({ success: true, debt });
    }

    return NextResponse.json({ error: "Thao tác không hợp lệ" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "transaction";
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });

    if (type === "debt") {
      await prisma.debt.deleteMany({ where: { id, userId: user.id } });
      return NextResponse.json({ success: true, message: "Đã xóa khoản nợ" });
    }

    if (type === "account") {
      await prisma.financeAccount.deleteMany({ where: { id, userId: user.id } });
      return NextResponse.json({ success: true, message: "Đã xóa tài khoản" });
    }

    await prisma.financeTransaction.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true, message: "Đã xóa giao dịch" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

