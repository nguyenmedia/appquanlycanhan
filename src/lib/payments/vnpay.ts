import crypto from "crypto";
import { IPaymentProvider, CreatePaymentParams, PaymentVerificationResult } from "./types";
import { getPaymentConfig } from "./config";

export class VNPayProvider implements IPaymentProvider {
  name: "vnpay" = "vnpay";

  async isConfigured(): Promise<boolean> {
    const config = await getPaymentConfig();
    return (
      Boolean(config.vnpay_tmn_code) &&
      config.vnpay_tmn_code !== "NOT_CONFIGURED" &&
      Boolean(config.vnpay_hash_secret) &&
      config.vnpay_hash_secret !== "NOT_CONFIGURED" &&
      config.vnpay_enabled
    );
  }

  private sortObject(obj: Record<string, any>) {
    const sorted: Record<string, string> = {};
    const str: string[] = [];
    let key;
    for (key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(String(obj[decodeURIComponent(str[key])])).replace(/%20/g, "+");
    }
    return sorted;
  }

  async createPaymentUrl(params: CreatePaymentParams): Promise<{ paymentUrl: string; isSimulated?: boolean }> {
    const config = await getPaymentConfig();
    const tmnCode = config.vnpay_tmn_code;
    const hashSecret = config.vnpay_hash_secret;
    const vnpUrl = config.vnpay_url || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    if (!tmnCode || tmnCode === "NOT_CONFIGURED" || !hashSecret || hashSecret === "NOT_CONFIGURED") {
      // Safe test simulation URL
      const sandboxUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/callback/vnpay?vnp_ResponseCode=00&vnp_TxnRef=${params.transactionId}&vnp_Amount=${params.amount * 100}&vnp_TransactionNo=SIMULATED_${Date.now()}&vnp_SecureHash=SIMULATED_TEST_SIGNATURE`;
      return { paymentUrl: sandboxUrl, isSimulated: true };
    }

    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    let vnp_Params: Record<string, any> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: params.transactionId,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: "other",
      vnp_Amount: params.amount * 100,
      vnp_ReturnUrl: params.returnUrl,
      vnp_IpAddr: params.ipAddress || "127.0.0.1",
      vnp_CreateDate: createDate,
    };

    vnp_Params = this.sortObject(vnp_Params);

    const querystring = Object.entries(vnp_Params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const hmac = crypto.createHmac("sha512", hashSecret);
    const signed = hmac.update(Buffer.from(querystring, "utf-8")).digest("hex");

    const paymentUrl = `${vnpUrl}?${querystring}&vnp_SecureHash=${signed}`;

    return { paymentUrl, isSimulated: false };
  }

  async verifyWebhook(data: any): Promise<PaymentVerificationResult> {
    const config = await getPaymentConfig();
    const hashSecret = config.vnpay_hash_secret;

    let vnp_Params = { ...data };
    const secureHash = vnp_Params["vnp_SecureHash"];

    // Simulated sandbox bypass
    if (secureHash === "SIMULATED_TEST_SIGNATURE") {
      return {
        isValid: true,
        isSuccess: vnp_Params["vnp_ResponseCode"] === "00",
        transactionId: vnp_Params["vnp_TxnRef"],
        providerTransactionId: vnp_Params["vnp_TransactionNo"] || `SIM_${Date.now()}`,
        amount: Number(vnp_Params["vnp_Amount"]) / 100,
      };
    }

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = this.sortObject(vnp_Params);
    const querystring = Object.entries(vnp_Params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const hmac = crypto.createHmac("sha512", hashSecret);
    const signed = hmac.update(Buffer.from(querystring, "utf-8")).digest("hex");

    const isValid = secureHash.toLowerCase() === signed.toLowerCase();
    const isSuccess = isValid && vnp_Params["vnp_ResponseCode"] === "00";

    return {
      isValid,
      isSuccess,
      transactionId: vnp_Params["vnp_TxnRef"],
      providerTransactionId: vnp_Params["vnp_TransactionNo"],
      amount: Number(vnp_Params["vnp_Amount"]) / 100,
      errorMessage: isValid ? undefined : "Chữ ký VNPay không hợp lệ",
    };
  }
}
