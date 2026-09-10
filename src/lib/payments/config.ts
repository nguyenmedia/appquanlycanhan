import prisma from "../prisma";

export interface PaymentGatewayConfig {
  // VietQR / Bank Transfer
  vietqr_enabled: boolean;
  bank_id: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_transfer_prefix: string;
  sepay_api_key: string;

  // VNPay
  vnpay_enabled: boolean;
  vnpay_tmn_code: string;
  vnpay_hash_secret: string;
  vnpay_url: string;
  vnpay_sandbox: boolean;

  // MoMo
  momo_enabled: boolean;
  momo_partner_code: string;
  momo_access_key: string;
  momo_secret_key: string;
  momo_endpoint: string;

  // Stripe
  stripe_enabled: boolean;
  stripe_publishable_key: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;
}

const DEFAULT_CONFIG: PaymentGatewayConfig = {
  vietqr_enabled: true,
  bank_id: "MB",
  bank_account_number: "0987654321",
  bank_account_name: "NGUYEN VAN A",
  bank_transfer_prefix: "LIFEOS",
  sepay_api_key: "",

  vnpay_enabled: true,
  vnpay_tmn_code: process.env.VNPAY_TMN_CODE || "",
  vnpay_hash_secret: process.env.VNPAY_HASH_SECRET || "",
  vnpay_url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnpay_sandbox: true,

  momo_enabled: true,
  momo_partner_code: process.env.MOMO_PARTNER_CODE || "",
  momo_access_key: process.env.MOMO_ACCESS_KEY || "",
  momo_secret_key: process.env.MOMO_SECRET_KEY || "",
  momo_endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",

  stripe_enabled: true,
  stripe_publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  stripe_secret_key: process.env.STRIPE_SECRET_KEY || "",
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

let cachedConfig: PaymentGatewayConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000; // 10s cache

export async function getPaymentConfig(): Promise<PaymentGatewayConfig> {
  const now = Date.now();
  if (cachedConfig && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            "vietqr_enabled",
            "bank_id",
            "bank_account_number",
            "bank_account_name",
            "bank_transfer_prefix",
            "sepay_api_key",
            "vnpay_enabled",
            "vnpay_tmn_code",
            "vnpay_hash_secret",
            "vnpay_url",
            "vnpay_sandbox",
            "momo_enabled",
            "momo_partner_code",
            "momo_access_key",
            "momo_secret_key",
            "momo_endpoint",
            "stripe_enabled",
            "stripe_publishable_key",
            "stripe_secret_key",
            "stripe_webhook_secret",
          ],
        },
      },
    });

    const configMap: Record<string, string> = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    cachedConfig = {
      vietqr_enabled: configMap.vietqr_enabled !== undefined ? configMap.vietqr_enabled === "true" : DEFAULT_CONFIG.vietqr_enabled,
      bank_id: configMap.bank_id || DEFAULT_CONFIG.bank_id,
      bank_account_number: configMap.bank_account_number || DEFAULT_CONFIG.bank_account_number,
      bank_account_name: configMap.bank_account_name || DEFAULT_CONFIG.bank_account_name,
      bank_transfer_prefix: configMap.bank_transfer_prefix || DEFAULT_CONFIG.bank_transfer_prefix,
      sepay_api_key: configMap.sepay_api_key || DEFAULT_CONFIG.sepay_api_key,

      vnpay_enabled: configMap.vnpay_enabled !== undefined ? configMap.vnpay_enabled === "true" : DEFAULT_CONFIG.vnpay_enabled,
      vnpay_tmn_code: configMap.vnpay_tmn_code || DEFAULT_CONFIG.vnpay_tmn_code,
      vnpay_hash_secret: configMap.vnpay_hash_secret || DEFAULT_CONFIG.vnpay_hash_secret,
      vnpay_url: configMap.vnpay_url || DEFAULT_CONFIG.vnpay_url,
      vnpay_sandbox: configMap.vnpay_sandbox !== undefined ? configMap.vnpay_sandbox === "true" : DEFAULT_CONFIG.vnpay_sandbox,

      momo_enabled: configMap.momo_enabled !== undefined ? configMap.momo_enabled === "true" : DEFAULT_CONFIG.momo_enabled,
      momo_partner_code: configMap.momo_partner_code || DEFAULT_CONFIG.momo_partner_code,
      momo_access_key: configMap.momo_access_key || DEFAULT_CONFIG.momo_access_key,
      momo_secret_key: configMap.momo_secret_key || DEFAULT_CONFIG.momo_secret_key,
      momo_endpoint: configMap.momo_endpoint || DEFAULT_CONFIG.momo_endpoint,

      stripe_enabled: configMap.stripe_enabled !== undefined ? configMap.stripe_enabled === "true" : DEFAULT_CONFIG.stripe_enabled,
      stripe_publishable_key: configMap.stripe_publishable_key || DEFAULT_CONFIG.stripe_publishable_key,
      stripe_secret_key: configMap.stripe_secret_key || DEFAULT_CONFIG.stripe_secret_key,
      stripe_webhook_secret: configMap.stripe_webhook_secret || DEFAULT_CONFIG.stripe_webhook_secret,
    };

    lastFetchTime = now;
    return cachedConfig;
  } catch (e) {
    console.error("Failed to load payment config from DB, using defaults:", e);
    return DEFAULT_CONFIG;
  }
}

export function clearPaymentConfigCache() {
  cachedConfig = null;
  lastFetchTime = 0;
}
