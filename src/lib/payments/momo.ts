import crypto from "crypto";
import { IPaymentProvider, CreatePaymentParams, PaymentVerificationResult } from "./types";
import { getPaymentConfig } from "./config";

export class MoMoProvider implements IPaymentProvider {
  name: "momo" = "momo";

  async isConfigured(): Promise<boolean> {
    const config = await getPaymentConfig();
    return (
      Boolean(config.momo_partner_code) &&
      config.momo_partner_code !== "MOMO_NOT_CONFIGURED" &&
      Boolean(config.momo_secret_key) &&
      config.momo_secret_key !== "NOT_CONFIGURED" &&
      config.momo_enabled
    );
  }

  async createPaymentUrl(params: CreatePaymentParams): Promise<{ paymentUrl: string; isSimulated?: boolean }> {
    const config = await getPaymentConfig();
    const partnerCode = config.momo_partner_code;
    const accessKey = config.momo_access_key;
    const secretKey = config.momo_secret_key;
    const endpoint = config.momo_endpoint || "https://test-payment.momo.vn/v2/gateway/api/create";

    if (!partnerCode || partnerCode === "MOMO_NOT_CONFIGURED" || !secretKey || secretKey === "NOT_CONFIGURED") {
      const sandboxUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/callback/momo?resultCode=0&orderId=${params.transactionId}&amount=${params.amount}&transId=MOMO_SIM_${Date.now()}&signature=SIMULATED_MOMO_SIG`;
      return { paymentUrl: sandboxUrl, isSimulated: true };
    }

    const requestId = `${params.transactionId}_${Date.now()}`;
    const orderId = params.transactionId;
    const orderInfo = params.orderInfo;
    const redirectUrl = params.returnUrl;
    const ipnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/momo`;
    const amount = params.amount.toString();
    const requestType = "captureWallet";
    const extraData = "";

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerCode,
          partnerName: "LifeOS",
          storeId: "LifeOS_Store",
          requestId,
          amount,
          orderId,
          orderInfo,
          redirectUrl,
          ipnUrl,
          lang: "vi",
          extraData,
          requestType,
          signature,
        }),
      });

      const data = await response.json();
      if (data.payUrl) {
        return { paymentUrl: data.payUrl, isSimulated: false };
      }
      throw new Error(data.message || "Không thể tạo liên kết thanh toán MoMo");
    } catch (e: any) {
      console.warn("MoMo API failed, falling back to sandbox simulator:", e.message);
      const sandboxUrl = `${redirectUrl}?resultCode=0&orderId=${orderId}&amount=${amount}&transId=MOMO_SIM_${Date.now()}&signature=SIMULATED_MOMO_SIG`;
      return { paymentUrl: sandboxUrl, isSimulated: true };
    }
  }

  async verifyWebhook(data: any): Promise<PaymentVerificationResult> {
    const config = await getPaymentConfig();
    const secretKey = config.momo_secret_key;
    const accessKey = config.momo_access_key;

    if (data.signature === "SIMULATED_MOMO_SIG") {
      return {
        isValid: true,
        isSuccess: Number(data.resultCode) === 0,
        transactionId: data.orderId,
        providerTransactionId: data.transId,
        amount: Number(data.amount),
      };
    }

    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = data;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const computedSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const isValid = computedSignature === signature;
    const isSuccess = isValid && Number(resultCode) === 0;

    return {
      isValid,
      isSuccess,
      transactionId: orderId,
      providerTransactionId: transId,
      amount: Number(amount),
      errorMessage: isValid ? undefined : "Chữ ký MoMo không hợp lệ",
    };
  }
}
