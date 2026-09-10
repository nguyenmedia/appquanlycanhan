"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Users,
  Plus,
  Mail,
  Phone,
  Building,
  Trash2,
  Search,
} from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [relationship, setRelationship] = useState("friend");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      const json = await res.json();
      if (json.success) setContacts(json.contacts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          role,
          relationship,
          notes,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setName("");
        setEmail("");
        setPhone("");
        setIsModalOpen(false);
        loadContacts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa liên hệ này?")) return;
    setContacts(contacts.filter((c) => c.id !== id));
    try {
      await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-cyan-400" />
              <span>Danh Bạ & Mối Quan Hệ (Personal CRM)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Nuôi dưỡng và giữ liên lạc chặt chẽ với đối tác, khách hàng và bạn bè
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm liên hệ..."
                className="bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl pl-9 pr-3 py-2 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm liên hệ</span>
            </button>
          </div>
        </div>

        {/* CONTACTS GRID */}
        {contacts.length === 0 ? (
          <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center">
            <Users className="w-12 h-12 text-cyan-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">Chưa có liên hệ nào</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Lưu giữ thông tin những người bạn trân quý và quan trọng trong sự nghiệp.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow"
            >
              Thêm liên hệ đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-base text-white">{c.name}</h4>
                      {c.company && (
                        <span className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-neutral-500" />
                          {c.role ? `${c.role} tại ${c.company}` : c.company}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-neutral-600 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-neutral-300 my-3">
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                  </div>

                  {c.notes && <p className="text-xs text-neutral-500 italic mt-2">{c.notes}</p>}
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500 mt-4">
                  <span className="uppercase font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    {c.relationship}
                  </span>
                  <span>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Thêm liên hệ mới</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Tên liên hệ</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn B"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="b@example.com"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0987654321"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Công ty</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Tập đoàn ABC"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Mối quan hệ</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="friend">Bạn bè (Friend)</option>
                      <option value="client">Khách hàng (Client)</option>
                      <option value="partner">Đối tác (Partner)</option>
                      <option value="colleague">Đồng nghiệp (Colleague)</option>
                      <option value="family">Gia đình (Family)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-brand text-white font-semibold text-xs shadow"
                  >
                    Lưu liên hệ
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
