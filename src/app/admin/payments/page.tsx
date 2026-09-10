"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  QrCode,
  Save,
  CheckCircle2,
  Copy,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import PendingTransfersManager from "@/components/admin/PendingTransfersManager";

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"vietqr" | "vnpay" | "momo" | "stripe">("vietqr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Config fields
  const [vietqrEnabled, setVietqrEnabled] = useState(true);
  const [bankId, setBankId] = useState("MB");
  const [bankAccountNumber, setBankAccountNumber] = useState("0987654321");
  const [bankAccountName, setBankAccountName] = useState("NGUYEN VAN A");
  const [bankPrefix, setBankPrefix] = useState("LIFEOS");
  const [sepayApiKey, setSepayApiKey] = useState("");

  const [vnpayEnabled, setVnpayEnabled] = useState(true);
  const [vnpayTmnCode, setVnpayTmnCode] = useState("");
  const [vnpayHashSecret, setVnpayHashSecret] = useState("");
  const [vnpaySandbox, setVnpaySandbox] = useState(true);

  const [momoEnabled, setMomoEnabled] = useState(true);
  const [momoPartnerCode, setMomoPartnerCode] = useState("");
  const [momoAccessKey, setMomoAccessKey] = useState("");
  const [momoSecretKey, setMomoSecretKey] = useState("");

  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");

  const [webhooks, setWebhooks] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      const json = await res.json();
      if (json.success && json.config) {
        const c = json.config;
        setVietqrEnabled(Boolean(c.vietqr_enabled));
        setBankId(c.bank_id || "MB");
        setBankAccountNumber(c.bank_account_number || "");
        setBankAccountName(c.bank_account_name || "");
        setBankPrefix(c.bank_transfer_prefix || "LIFEOS");
        setSepayApiKey(c.sepay_api_key || "");

        setVnpayEnabled(Boolean(c.vnpay_enabled));
        setVnpayTmnCode(c.vnpay_tmn_code || "");
        setVnpayHashSecret(c.vnpay_hash_secret || "");
        setVnpaySandbox(Boolean(c.vnpay_sandbox));

        setMomoEnabled(Boolean(c.momo_enabled));
        setMomoPartnerCode(c.momo_partner_code || "");
        setMomoAccessKey(c.momo_access_key || "");
        setMomoSecretKey(c.momo_secret_key || "");

        setStripeEnabled(Boolean(c.stripe_enabled));
        setStripePublishableKey(c.stripe_publishable_key || "");
        setStripeSecretKey(c.stripe_secret_key || "");
        setStripeWebhookSecret(c.stripe_webhook_secret || "");

        if (c.webhook_urls) setWebhooks(c.webhook_urls);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const settings = {
        vietqr_enabled: vietqrEnabled,
        bank_id: bankId,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
        bank_transfer_prefix: bankPrefix,
        sepay_api_key: sepayApiKey,

        vnpay_enabled: vnpayEnabled,
        vnpay_tmn_code: vnpayTmnCode,
        vnpay_hash_secret: vnpayHashSecret,
        vnpay_sandbox: vnpaySandbox,

        momo_enabled: momoEnabled,
        momo_partner_code: momoPartnerCode,
        momo_access_key: momoAccessKey,
        momo_secret_key: momoSecretKey,

        stripe_enabled: stripeEnabled,
        stripe_publishable_key: stripePublishableKey,
        stripe_secret_key: stripeSecretKey,
        stripe_webhook_secret: stripeWebhookSecret,
      };

      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Đã lưu thông tin cấu hình cổng thanh toán thành công!");
      } else {
        alert(json.error || "Lỗi lưu cấu hình");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  const copyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    showToast(`Đã sao chép ${label}!`);
  };

  const previewQR = `https://img.vietqr.io/image/${bankId}-${bankAccountNumber || "0987654321"}-compact2.png?amount=199000&addInfo=${encodeURIComponent(
    `${bankPrefix} TXN_DEMO`
  )}&accountName=${encodeURIComponent(bankAccountName || "LIFEOS")}`;

  const banks = [
    { id: "MB", name: "MBBank (Quân Đội)" },
    { id: "VCB", name: "Vietcombank (Ngoại Thương)" },
    { id: "TCB", name: "Techcombank (Kỹ Thương)" },
    { id: "ACB", name: "ACB (Á Châu)" },
    { id: "TPB", name: "TPBank (Tiên Phong)" },
    { id: "VPB", name: "VPBank (Việt Nam Thịnh Vượng)" },
    { id: "BIDV", name: "BIDV (Đầu Tư & Phát Triển)" },
    { id: "ICB", name: "VietinBank (Công Thương)" },
    { id: "VBA", name: "Agribank (Nông Nghiệp)" },
    { id: "STB", name: "Sacombank (Sài Gòn Thương Tín)" },
  ];

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span>Quản Trị Cổng Thanh Toán Tự Động (Payment Gateways)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cấu hình số tài khoản ngân hàng VietQR, VNPay, MoMo, Stripe để tự động đối soát và kích hoạt gói cước
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Đang lưu..." : "Lưu cấu hình cổng"}</span>
        </button>
      </div>

      {/* BANK TRANSFER PENDING APPROVALS MANAGER */}
      <PendingTransfersManager />

      {/* GATEWAYS TABS */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 text-xs overflow-x-auto">
        {[
          { id: "vietqr", label: "VietQR Ngân Hàng (Tự động 0% phí)", icon: QrCode, badge: "Khuyên dùng" },
          { id: "vnpay", label: "Cổng VNPay (QR & Thẻ ATM)", icon: QrCode },
          { id: "momo", label: "Ví Điện Tử MoMo", icon: CreditCard },
          { id: "stripe", label: "Thẻ Quốc Tế (Stripe)", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap relative ${
                isActive
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                  isActive ? "bg-black text-amber-400" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: VIETQR */}
      {activeTab === "vietqr" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <span>Cấu Hình Chuyển Khoản Ngân Hàng Tự Động (VietQR)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Khách hàng quét mã QR ngân hàng bất kỳ, hệ thống nhận diện tiền vào và tự kích hoạt gói dịch vụ trong 3 giây
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-200">
                <input
                  type="checkbox"
                  checked={vietqrEnabled}
                  onChange={(e) => setVietqrEnabled(e.target.checked)}
                  className="rounded accent-emerald-500 w-5 h-5"
                />
                <span>Bật VietQR</span>
              </label>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Ngân hàng thụ hưởng *</label>
                  <select
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Số tài khoản ngân hàng *</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value.trim())}
                    placeholder="Ví dụ: 0987654321..."
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Tên chủ tài khoản (viết hoa không dấu) *</label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                    placeholder="NGUYEN VAN A"
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Cú pháp nội dung nạp tiền *</label>
                  <input
                    type="text"
                    value={bankPrefix}
                    onChange={(e) => setBankPrefix(e.target.value.toUpperCase())}
                    placeholder="LIFEOS"
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Nội dung chuyển khoản sẽ là: <strong className="text-amber-400 font-mono">{bankPrefix} TXN_123456</strong>
                  </span>
                </div>
              </div>

              {/* WEBHOOK INTEGRATION */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Webhook Đối Soát Tự Động (SePay / Casso)</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Tự Động 100%
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Để hệ thống tự động kích hoạt gói cước ngay khi tài khoản ngân hàng của bạn nhận được tiền, hãy copy Webhook URL dưới đây và dán vào cài đặt Webhook trên trang SePay.vn hoặc Casso.vn:
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhooks.sepay || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/sepay`}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-[11px] text-neutral-300 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => copyText(webhooks.sepay || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/sepay`, "Webhook URL")}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE QR PREVIEW */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4 flex flex-col items-center text-center">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider">
              Mã VietQR Xem Trước Thực Tế
            </h4>
            <div className="p-4 bg-white rounded-3xl shadow-xl w-full max-w-[220px]">
              <img
                src={previewQR}
                alt="Preview QR"
                className="w-full aspect-square object-contain"
              />
            </div>
            <div className="text-xs space-y-1 text-neutral-400">
              <div>Ngân hàng: <strong className="text-white">{bankId}</strong></div>
              <div>Số TK: <strong className="text-amber-400 font-mono">{bankAccountNumber || "Chưa nhập"}</strong></div>
              <div>Chủ TK: <strong className="text-white">{bankAccountName || "Chưa nhập"}</strong></div>
              <div className="text-[10px] text-emerald-400 pt-1">
                ✓ Mã QR hiển thị đúng như khách hàng thấy khi bấm thanh toán
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: VNPAY */}
      {activeTab === "vnpay" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-5 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                <span>Cổng Thanh Toán VNPay (VNPAY-QR & Thẻ Nội Địa)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cấu hình mã đối tác và khóa bí mật được cấp bởi VNPAY
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-200">
              <input
                type="checkbox"
                checked={vnpayEnabled}
                onChange={(e) => setVnpayEnabled(e.target.checked)}
                className="rounded accent-indigo-500 w-5 h-5"
              />
              <span>Bật VNPay</span>
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Mã Website (TMN Code) *</label>
              <input
                type="text"
                value={vnpayTmnCode}
                onChange={(e) => setVnpayTmnCode(e.target.value.trim())}
                placeholder="Ví dụ: 2QXUI4J4..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Chuỗi bí mật tạo chữ ký (Hash Secret) *</label>
              <input
                type="password"
                value={vnpayHashSecret}
                onChange={(e) => setVnpayHashSecret(e.target.value.trim())}
                placeholder="Chuỗi bảo mật SHA-512..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer text-neutral-300 font-medium">
                <input
                  type="checkbox"
                  checked={vnpaySandbox}
                  onChange={(e) => setVnpaySandbox(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
                <span>Chế độ Sandbox (Môi trường kiểm thử nghiệm sandbox.vnpayment.vn)</span>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="font-bold text-white text-xs block">VNPay IPN Callback URL</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhooks.vnpay || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/vnpay`}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-[11px] text-neutral-300 font-mono"
                />
                <button
                  type="button"
                  onClick={() => copyText(webhooks.vnpay || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/vnpay`, "VNPay URL")}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MOMO */}
      {activeTab === "momo" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-5 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-pink-400" />
                <span>Ví Điện Tử MoMo (MoMo Payment Gateway)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cấu hình API kết nối cổng thanh toán MoMo E-Wallet
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-200">
              <input
                type="checkbox"
                checked={momoEnabled}
                onChange={(e) => setMomoEnabled(e.target.checked)}
                className="rounded accent-pink-500 w-5 h-5"
              />
              <span>Bật MoMo</span>
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Mã đối tác (Partner Code) *</label>
              <input
                type="text"
                value={momoPartnerCode}
                onChange={(e) => setMomoPartnerCode(e.target.value.trim())}
                placeholder="MOMO..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Khóa truy cập (Access Key) *</label>
              <input
                type="text"
                value={momoAccessKey}
                onChange={(e) => setMomoAccessKey(e.target.value.trim())}
                placeholder="Access Key..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Khóa bí mật (Secret Key) *</label>
              <input
                type="password"
                value={momoSecretKey}
                onChange={(e) => setMomoSecretKey(e.target.value.trim())}
                placeholder="Secret Key HMAC SHA256..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="font-bold text-white text-xs block">MoMo IPN Callback URL</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhooks.momo || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/momo`}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-[11px] text-neutral-300 font-mono"
                />
                <button
                  type="button"
                  onClick={() => copyText(webhooks.momo || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/momo`, "MoMo URL")}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STRIPE */}
      {activeTab === "stripe" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-5 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span>Cổng Thẻ Quốc Tế Stripe (Visa / Mastercard)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cung cấp thanh toán thẻ quốc tế cho khách hàng toàn cầu
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-200">
              <input
                type="checkbox"
                checked={stripeEnabled}
                onChange={(e) => setStripeEnabled(e.target.checked)}
                className="rounded accent-indigo-500 w-5 h-5"
              />
              <span>Bật Stripe</span>
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Publishable Key (`pk_...`) *</label>
              <input
                type="text"
                value={stripePublishableKey}
                onChange={(e) => setStripePublishableKey(e.target.value.trim())}
                placeholder="pk_test_..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Secret Key (`sk_...`) *</label>
              <input
                type="password"
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value.trim())}
                placeholder="sk_test_..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Webhook Signing Secret (`whsec_...`)</label>
              <input
                type="password"
                value={stripeWebhookSecret}
                onChange={(e) => setStripeWebhookSecret(e.target.value.trim())}
                placeholder="whsec_..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="font-bold text-white text-xs block">Stripe Webhook Endpoint</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhooks.stripe || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/stripe`}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-[11px] text-neutral-300 font-mono"
                />
                <button
                  type="button"
                  onClick={() => copyText(webhooks.stripe || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/stripe`, "Stripe URL")}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
