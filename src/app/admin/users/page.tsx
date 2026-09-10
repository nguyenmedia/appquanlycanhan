"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  Ban,
  CheckCircle,
  MoreVertical,
  CreditCard,
  Plus,
  Sparkles,
  Trash2,
  Eye,
  CheckCircle2,
  UserCheck,
  Cloud,
  RefreshCw,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const [cloudCount, setCloudCount] = useState(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Add user form
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [newPlan, setNewPlan] = useState("free");
  const [newCredits, setNewCredits] = useState(20);
  const [addLoading, setAddLoading] = useState(false);

  // Credit grant form
  const [bonusAmount, setBonusAmount] = useState(50);
  const [bonusNote, setBonusNote] = useState("");
  const [bonusLoading, setBonusLoading] = useState(false);

  const loadUsers = async (isManualSync = false) => {
    if (isManualSync) setSyncing(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (planFilter) params.append("plan", planFilter);
      if (roleFilter) params.append("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.users);
        if (json.supabaseConnected !== undefined) setSupabaseConnected(json.supabaseConnected);
        if (json.cloudUserCount !== undefined) setCloudCount(json.cloudUserCount);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      if (isManualSync) setSyncing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, planFilter, roleFilter]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    setAddLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          fullName: newFullName,
          role: newRole,
          planSlug: newPlan,
          initialCredits: Number(newCredits),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setNewEmail("");
        setNewPassword("");
        setNewFullName("");
        loadUsers();
      } else {
        alert(json.error || "Lỗi tạo người dùng");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setAddLoading(false);
    }
  };

  const handleGrantCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setBonusLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          creditBonus: Number(bonusAmount),
          note: bonusNote || "Admin cộng điểm",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreditModal(false);
        loadUsers();
      } else {
        alert(json.error || "Lỗi cộng credit");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setBonusLoading(false);
    }
  };

  const handleToggleSuspend = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    if (!confirm(`Xác nhận ${nextStatus === "SUSPENDED" ? "khóa" : "mở khóa"} tài khoản này?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Đổi vai trò tài khoản thành ${nextRole}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      const json = await res.json();
      if (json.success) loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangePlan = async (userId: string, planSlug: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, changePlanSlug: planSlug }),
      });
      const json = await res.json();
      if (json.success) loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (
      !confirm(
        `BẠN CÓ CHẮC CHẮN MUỐN XÓA VĨNH VIỄN TÀI KHOẢN ${email}?\n\nThao tác này sẽ xóa triệt để trên Supabase Cloud và cơ sở dữ liệu hệ thống. Tài khoản sẽ KHÔNG BAO GIỜ tự động phục hồi lại!`
      )
    )
      return;

    try {
      // Optimistic update
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        loadUsers();
      } else {
        alert(json.error || "Lỗi xóa người dùng");
        loadUsers();
      }
    } catch (e) {
      alert("Lỗi kết nối");
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & TOP CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Quản Lý Người Dùng & Tài Khoản</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Dữ liệu tài khoản đăng ký thật đồng bộ trực tiếp hai chiều từ Supabase Cloud
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Cloud className="w-3 h-3" />
              <span>Supabase Cloud: {supabaseConnected ? "Đã kết nối trực tiếp" : "Mất kết nối"}</span>
            </span>
            <span className="text-[11px] text-neutral-500">
              • {users.length} tài khoản trong hệ thống
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadUsers(true)}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 hover:text-white transition disabled:opacity-50"
            title="Quét và đồng bộ tài khoản thật từ Supabase Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Đang đồng bộ..." : "Đồng bộ Supabase"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm người dùng mới</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo email hoặc mã giới thiệu..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">Lọc theo gói cước (Tất cả)</option>
            <option value="free">Gói Free</option>
            <option value="pro">Gói LifeOS Pro</option>
            <option value="premium">Gói LifeOS Premium</option>
          </select>
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">Lọc theo vai trò (Tất cả)</option>
            <option value="USER">Thành viên (USER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
            <option value="SUPER_ADMIN">Quản trị cấp cao (SUPER_ADMIN)</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-800 bg-neutral-950/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Người dùng</th>
                <th className="py-3.5 px-4">Gói cước</th>
                <th className="py-3.5 px-4">AI Credits</th>
                <th className="py-3.5 px-4">Dữ liệu</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    {loading ? "Đang tải danh sách người dùng..." : "Không tìm thấy người dùng phù hợp."}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuspended = u.status === "SUSPENDED";
                  return (
                    <tr key={u.id} className="hover:bg-neutral-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{u.fullName}</div>
                        <div className="text-[11px] text-neutral-400">{u.email}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            u.role === "SUPER_ADMIN" ? "bg-amber-500 text-black" :
                            u.role === "ADMIN" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" :
                            "bg-neutral-800 text-neutral-400"
                          }`}>
                            {u.role}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-medium bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                            <Cloud className="w-2.5 h-2.5" />
                            <span>Cloud</span>
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">Ref: {u.referralCode}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={u.planSlug}
                          onChange={(e) => handleChangePlan(u.id, e.target.value)}
                          className={`bg-neutral-950 border rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            u.planSlug === "premium" ? "border-indigo-500/40 text-indigo-400" :
                            u.planSlug === "pro" ? "border-amber-500/40 text-amber-400" :
                            "border-neutral-800 text-neutral-400"
                          }`}
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono">{u.aiCreditBalance}</span>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowCreditModal(true);
                            }}
                            className="p-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 transition"
                            title="Tặng thêm credits"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-neutral-400">
                          <span>{u.stats?.tasks || 0} việc</span> • <span>{u.stats?.habits || 0} thói quen</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuspended ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? "bg-rose-400" : "bg-emerald-400"}`} />
                          {isSuspended ? "Đã khóa" : "Hoạt động"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleChangeRole(u.id, u.role)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-indigo-400 transition"
                            title="Đổi quyền Admin"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleSuspend(u.id, u.status)}
                            className={`p-1.5 rounded-lg transition ${
                              isSuspended ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-neutral-800 text-rose-400 hover:bg-neutral-700"
                            }`}
                            title={isSuspended ? "Mở khóa" : "Khóa tài khoản"}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD USER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddUser} className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Thêm Người Dùng Mới</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Mật khẩu ban đầu *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự..."
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Vai trò</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="USER">USER (Thành viên)</option>
                    <option value="ADMIN">ADMIN (Quản trị)</option>
                    <option value="SUPPORT">SUPPORT (Hỗ trợ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Gói cước</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro (199.000đ)</option>
                    <option value="premium">Premium (499.000đ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">AI Credits khởi tạo</label>
                <input
                  type="number"
                  value={newCredits}
                  onChange={(e) => setNewCredits(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
              >
                {addLoading ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: GRANT AI CREDITS */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleGrantCredits} className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span>Tặng Thêm AI Credits</span>
              </h3>
              <button type="button" onClick={() => setShowCreditModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-neutral-400">
              Cộng trực tiếp AI credits cho tài khoản <strong className="text-white">{selectedUser.email}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Số lượng credits tặng</label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBonusAmount(amt)}
                      className={`py-2 rounded-xl font-bold border transition ${
                        bonusAmount === amt
                          ? "bg-pink-500/20 border-pink-500 text-pink-400"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400"
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Lý do / Ghi chú</label>
                <input
                  type="text"
                  value={bonusNote}
                  onChange={(e) => setBonusNote(e.target.value)}
                  placeholder="Ví dụ: Tặng quà sinh nhật, bồi thường gián đoạn dịch vụ..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={bonusLoading}
                className="px-5 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition"
              >
                {bonusLoading ? "Đang cộng..." : "Xác nhận cộng điểm"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: USER DETAIL */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-neutral-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Hồ Sơ Chi Tiết Người Dùng</h3>
              <button type="button" onClick={() => setShowDetailModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-neutral-500">Họ và tên:</span><strong className="text-white">{selectedUser.fullName}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">Email:</span><strong className="text-white">{selectedUser.email}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">Mã giới thiệu:</span><strong className="text-amber-400 font-mono">{selectedUser.referralCode}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">Gói dịch vụ:</span><strong className="text-emerald-400 uppercase">{selectedUser.plan}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">Số dư AI Credits:</span><strong className="text-pink-400 font-mono">{selectedUser.aiCreditBalance}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">Số công việc đã tạo:</span><strong className="text-white">{selectedUser.stats?.tasks || 0}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">Số thói quen theo dõi:</span><strong className="text-white">{selectedUser.stats?.habits || 0}</strong></div>
              <div className="flex justify-between"><span className="text-neutral-500">Ngày tham gia:</span><strong className="text-neutral-400">{new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}</strong></div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-neutral-800 text-white font-semibold text-xs hover:bg-neutral-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
