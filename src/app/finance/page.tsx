"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Plus,
  CreditCard,
  Building,
  DollarSign,
  AlertCircle,
  PiggyBank,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  Scale,
  Search,
  Check,
} from "lucide-react";

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "budgets" | "debts">("transactions");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);

  // Transaction form state
  const [txnType, setTxnType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [payee, setPayee] = useState("");
  const [txnDate, setTxnDate] = useState(new Date().toISOString().slice(0, 10));

  // Account form state
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState("bank");
  const [accBalance, setAccBalance] = useState("");

  // Budget form state
  const [budgetCategory, setBudgetCategory] = useState("food");
  const [budgetLimit, setBudgetLimit] = useState("");

  // Debt form state
  const [debtType, setDebtType] = useState<"lent" | "borrowed">("lent");
  const [debtPerson, setDebtPerson] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtDueDate, setDebtDueDate] = useState("");
  const [debtNotes, setDebtNotes] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/finance");
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.accounts?.length > 0 && !accountId) {
          setAccountId(json.accounts[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transaction",
          accountId,
          type: txnType,
          amount: Number(amount),
          category,
          description,
          payee,
          date: txnDate,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAmount("");
        setDescription("");
        setPayee("");
        setIsTxnModalOpen(false);
        loadData();
      } else {
        alert(json.error || "Lỗi tạo giao dịch");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    }
  };

  const handleCreateAcc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "account",
          name: accName,
          type: accType,
          balance: Number(accBalance) || 0,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAccName("");
        setAccBalance("");
        setIsAccModalOpen(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetLimit) return;

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "budget",
          category: budgetCategory,
          monthlyLimit: Number(budgetLimit),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBudgetLimit("");
        setIsBudgetModalOpen(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtPerson.trim() || !debtAmount) return;

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "debt",
          type: debtType,
          personName: debtPerson.trim(),
          totalAmount: Number(debtAmount),
          dueDate: debtDueDate || null,
          notes: debtNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDebtPerson("");
        setDebtAmount("");
        setDebtNotes("");
        setDebtDueDate("");
        setIsDebtModalOpen(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSettleDebt = async (debtId: string, currentSettled: boolean) => {
    try {
      await fetch("/api/finance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "debt",
          id: debtId,
          isSettled: !currentSettled,
        }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (type: "transaction" | "debt" | "account", id: string) => {
    if (!confirm("Bạn có chắc muốn xóa mục này?")) return;
    try {
      await fetch(`/api/finance?type=${type}&id=${id}`, { method: "DELETE" });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const summary = data?.summary || { totalBalance: 0, totalIncome: 0, totalExpense: 0, netCashflow: 0 };
  const accounts = data?.accounts || [];
  const transactions = data?.transactions || [];
  const budgets = data?.budgets || [];
  const debts = data?.debts || [];

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <span>Tài chính & Dòng tiền (Personal Finance)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Đa tài khoản ngân hàng, kiểm soát thu chi, quản lý ngân sách và sổ nợ thông minh
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAccModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white transition flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-neutral-400" />
              <span>Thêm tài khoản</span>
            </button>
            <button
              onClick={() => setIsTxnModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi thu / chi</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-lg">
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              Tổng tài sản tích lũy
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {summary.totalBalance.toLocaleString("vi-VN")}đ
            </div>
            <div className="text-[11px] text-neutral-500 mt-2">{accounts.length} tài khoản & ví liên kết</div>
          </div>

          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-lg">
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              Tổng thu nhập tháng này
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              +{summary.totalIncome.toLocaleString("vi-VN")}đ
            </div>
            <div className="text-[11px] text-neutral-500 mt-2">Từ lương & doanh thu</div>
          </div>

          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-lg">
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              Tổng chi tiêu tháng này
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
              -{summary.totalExpense.toLocaleString("vi-VN")}đ
            </div>
            <div className="text-[11px] text-neutral-500 mt-2">Ăn uống, sinh hoạt, mua sắm</div>
          </div>

          <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-lg">
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Dòng tiền ròng (Tiết kiệm)
            </span>
            <div
              className={`text-2xl sm:text-3xl font-black mt-1 ${
                summary.netCashflow >= 0 ? "text-indigo-400" : "text-rose-400"
              }`}
            >
              {summary.netCashflow >= 0 ? "+" : ""}
              {summary.netCashflow.toLocaleString("vi-VN")}đ
            </div>
            <div className="text-[11px] text-neutral-500 mt-2">
              {summary.totalIncome > 0
                ? `Tỷ lệ tiết kiệm: ${Math.round((summary.netCashflow / summary.totalIncome) * 100)}%`
                : "Chưa có thu nhập"}
            </div>
          </div>
        </div>

        {/* ACCOUNTS LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Tài khoản ngân hàng & Ví điện tử ({accounts.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {accounts.map((acc: any) => (
              <div
                key={acc.id}
                className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-white truncate">{acc.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                      {acc.type}
                    </span>
                    <button
                      onClick={() => handleDeleteItem("account", acc.id)}
                      className="text-neutral-600 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-xl font-bold text-neutral-100">
                  {acc.balance.toLocaleString("vi-VN")}đ
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUB-TABS: TRANSACTIONS / BUDGETS / DEBTS */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "transactions" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Lịch sử giao dịch ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab("budgets")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "budgets" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Hạn mức ngân sách ({budgets.length})
            </button>
            <button
              onClick={() => setActiveTab("debts")}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "debts" ? "bg-neutral-800 text-white shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Sổ nợ & Cho vay ({debts.length})
            </button>
          </div>

          {activeTab === "budgets" && (
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thiết lập ngân sách</span>
            </button>
          )}

          {activeTab === "debts" && (
            <button
              onClick={() => setIsDebtModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/30 text-xs font-semibold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghi nhận nợ mới</span>
            </button>
          )}
        </div>

        {/* TAB 1: TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-4 shadow-xl">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500">
                Chưa có giao dịch nào. Bấm nút "Ghi thu / chi" ở trên để bắt đầu!
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {transactions.map((t: any) => (
                  <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          t.type === "income"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-white">
                          {t.description || t.category}
                        </span>
                        <span className="block text-[11px] text-neutral-400 mt-0.5">
                          {t.account?.name} • {new Date(t.date).toLocaleDateString("vi-VN")}
                          {t.payee && ` • Đối tượng: ${t.payee}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`font-bold text-sm block ${
                            t.type === "income" ? "text-emerald-400" : "text-neutral-100"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                          {t.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteItem("transaction", t.id)}
                        className="text-neutral-600 hover:text-rose-400 p-1 transition"
                        title="Xóa giao dịch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BUDGETS */}
        {activeTab === "budgets" && (
          <div className="space-y-4">
            {budgets.length === 0 ? (
              <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
                <PiggyBank className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-white mb-1">Chưa thiết lập ngân sách nào</h3>
                <p className="text-xs text-neutral-400 mb-6">
                  Tạo hạn mức chi tiêu hàng tháng cho các khoản ăn uống, giải trí, mua sắm để không bị vượt chi.
                </p>
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow"
                >
                  Thiết lập ngân sách ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((b: any) => {
                  // Calculate actual spent in this category
                  const spent = transactions
                    .filter((t: any) => t.type === "expense" && t.category === b.category)
                    .reduce((sum: number, t: any) => sum + t.amount, 0);

                  const pct = b.monthlyLimit > 0 ? Math.min(100, Math.round((spent / b.monthlyLimit) * 100)) : 0;
                  const isOver = spent > b.monthlyLimit;

                  return (
                    <div key={b.id} className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white uppercase">{b.category}</span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            isOver
                              ? "bg-rose-500/20 text-rose-300"
                              : pct >= 80
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>Đã chi: {spent.toLocaleString("vi-VN")}đ</span>
                          <span>Hạn mức: {b.monthlyLimit.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOver ? "bg-rose-500" : pct >= 80 ? "bg-amber-500" : "bg-indigo-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800 flex items-center justify-between">
                        <span>Tháng: {b.monthYear}</span>
                        {isOver ? (
                          <span className="text-rose-400 font-semibold">⚠️ Đã vượt hạn mức!</span>
                        ) : (
                          <span className="text-emerald-400">Còn lại: {(b.monthlyLimit - spent).toLocaleString("vi-VN")}đ</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEBTS & LOANS */}
        {activeTab === "debts" && (
          <div className="space-y-4">
            {debts.length === 0 ? (
              <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
                <Scale className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-white mb-1">Chưa có ghi nhận nợ nào</h3>
                <p className="text-xs text-neutral-400 mb-6">
                  Ghi lại các khoản bạn đã cho bạn bè vay hoặc bạn đang nợ ai đó để không quên.
                </p>
                <button
                  onClick={() => setIsDebtModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-medium text-xs shadow"
                >
                  Ghi nhận nợ đầu tiên
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5">
                {debts.map((d: any) => (
                  <div key={d.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSettleDebt(d.id, d.isSettled)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition flex-shrink-0 ${
                          d.isSettled
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-neutral-700 hover:border-amber-400"
                        }`}
                        title={d.isSettled ? "Đã thanh toán" : "Bấm để đánh dấu đã thanh toán"}
                      >
                        {d.isSettled && <Check className="w-4 h-4" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              d.isSettled ? "line-through text-neutral-500" : "text-white"
                            }`}
                          >
                            {d.personName}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              d.type === "lent"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {d.type === "lent" ? "Cho vay (Phải thu)" : "Đi vay (Phải trả)"}
                          </span>
                        </div>
                        {d.notes && <p className="text-xs text-neutral-400 mt-0.5">{d.notes}</p>}
                        {d.dueDate && (
                          <span className="text-[11px] text-neutral-500 block mt-1">
                            Hạn thanh toán: {new Date(d.dueDate).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-base font-black text-white block">
                          {d.totalAmount.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {d.isSettled ? "✓ Đã thanh toán" : "⏳ Đang theo dõi"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteItem("debt", d.id)}
                        className="text-neutral-600 hover:text-rose-400 p-1"
                        title="Xóa khoản nợ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL TRANSACTION */}
        {isTxnModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Ghi giao dịch thu chi</h3>
              <form onSubmit={handleCreateTxn} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setTxnType("expense")}
                    className={`py-2 rounded-lg text-xs font-semibold ${
                      txnType === "expense" ? "bg-rose-600 text-white shadow" : "text-neutral-400"
                    }`}
                  >
                    Chi tiêu (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxnType("income")}
                    className={`py-2 rounded-lg text-xs font-semibold ${
                      txnType === "income" ? "bg-emerald-600 text-white shadow" : "text-neutral-400"
                    }`}
                  >
                    Thu nhập (+)
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ví dụ: 150000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Tài khoản nguồn</label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      {accounts.map((acc: any) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.balance.toLocaleString("vi-VN")}đ)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Danh mục</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="food">Ăn uống (Food)</option>
                      <option value="shopping">Mua sắm (Shopping)</option>
                      <option value="housing">Nhà cửa & Tiện ích</option>
                      <option value="transport">Di chuyển & Xăng xe</option>
                      <option value="entertainment">Giải trí</option>
                      <option value="salary">Lương & Thu nhập</option>
                      <option value="investment">Đầu tư</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Mô tả giao dịch</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Cà phê sáng với đối tác, Mua tài liệu..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsTxnModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow"
                  >
                    Lưu giao dịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CREATE ACCOUNT */}
        {isAccModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Thêm tài khoản tài chính</h3>
              <form onSubmit={handleCreateAcc} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tên tài khoản</label>
                  <input
                    type="text"
                    required
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="Ví dụ: Vietcombank, Techcombank, Ví MoMo"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Loại tài khoản</label>
                    <select
                      value={accType}
                      onChange={(e) => setAccType(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="bank">Ngân hàng (Bank)</option>
                      <option value="wallet">Ví điện tử (E-Wallet)</option>
                      <option value="cash">Tiền mặt (Cash)</option>
                      <option value="savings">Sổ tiết kiệm (Savings)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Số dư ban đầu (VNĐ)</label>
                    <input
                      type="number"
                      value={accBalance}
                      onChange={(e) => setAccBalance(e.target.value)}
                      placeholder="0"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsAccModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow"
                  >
                    Tạo tài khoản
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CREATE BUDGET */}
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Thiết lập hạn mức ngân sách tháng</h3>
              <form onSubmit={handleCreateBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Danh mục áp dụng</label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="food">Ăn uống (Food)</option>
                    <option value="shopping">Mua sắm (Shopping)</option>
                    <option value="housing">Nhà cửa & Tiện ích</option>
                    <option value="transport">Di chuyển & Xăng xe</option>
                    <option value="entertainment">Giải trí</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Hạn mức chi tối đa (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    placeholder="Ví dụ: 5000000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsBudgetModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow"
                  >
                    Lưu ngân sách
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CREATE DEBT */}
        {isDebtModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Ghi nhận khoản nợ / Cho vay</h3>
              <form onSubmit={handleCreateDebt} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setDebtType("lent")}
                    className={`py-2 rounded-lg text-xs font-semibold ${
                      debtType === "lent" ? "bg-emerald-600 text-white shadow" : "text-neutral-400"
                    }`}
                  >
                    Cho vay (Phải thu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType("borrowed")}
                    className={`py-2 rounded-lg text-xs font-semibold ${
                      debtType === "borrowed" ? "bg-rose-600 text-white shadow" : "text-neutral-400"
                    }`}
                  >
                    Đi vay (Phải trả)
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Họ tên đối tác / Bạn bè</label>
                  <input
                    type="text"
                    required
                    value={debtPerson}
                    onChange={(e) => setDebtPerson(e.target.value)}
                    placeholder="Ví dụ: Anh Hoàng Nam, Chị Lan..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Số tiền (VNĐ)</label>
                    <input
                      type="number"
                      required
                      value={debtAmount}
                      onChange={(e) => setDebtAmount(e.target.value)}
                      placeholder="1000000"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Hạn thanh toán</label>
                    <input
                      type="date"
                      value={debtDueDate}
                      onChange={(e) => setDebtDueDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Ghi chú thêm</label>
                  <input
                    type="text"
                    value={debtNotes}
                    onChange={(e) => setDebtNotes(e.target.value)}
                    placeholder="Lý do vay mượn, hình thức chuyển khoản..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsDebtModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow"
                  >
                    Lưu vào sổ nợ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
