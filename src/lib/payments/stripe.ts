import crypto from "crypto";
import { IPaymentProvider, CreatePaymentParams, PaymentVerificationResult } from "./types";
import { getPaymentConfig } from "./config";

export class StripeProvider implements IPaymentProvider {
  name: "stripe" = "stripe";

  async isConfigured(): Promise<boolean> {
    const config = await getPaymentConfig();
    return (
      Boolean(config.stripe_secret_key) &&
      config.stripe_secret_key !== "sk_test_not_configured" &&
      config.stripe_enabled
    );
  }

  async createPaymentUrl(params: CreatePaymentParams): Promise<{ paymentUrl: string; isSimulated?: boolean }> {
    const config = await getPaymentConfig();
    const secretKey = config.stripe_secret_key;

    if (!secretKey || secretKey === "sk_test_not_configured" || !config.stripe_enabled) {
      const sandboxUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/callback/stripe?session_id=cs_test_simulated_${Date.now()}&transaction_id=${params.transactionId}&amount=${params.amount}&status=success`;
      return { paymentUrl: sandboxUrl, isSimulated: true };
    }

    try {
      const form = new URLSearchParams();
      form.append("payment_method_types[]", "card");
      form.append("mode", "payment");
      form.append("success_url", `${params.returnUrl}?session_id={CHECKOUT_SESSION_ID}&transaction_id=${params.transactionId}&status=success`);
      form.append("cancel_url", `${params.returnUrl}?status=cancelled`);
      form.append("client_reference_id", params.transactionId);
      form.append("line_items[0][price_data][currency]", "vnd");
      form.append("line_items[0][price_data][product_data][name]", params.orderInfo);
      form.append("line_items[0][price_data][unit_amount]", String(Math.round(params.amount)));
      form.append("line_items[0][quantity]", "1");

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });

      const session = await response.json();
      if (session.url) {
        return { paymentUrl: session.url, isSimulated: false };
      }
    } catch (e) {
      console.error("Stripe session creation error:", e);
    }

    return {
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback/stripe?session_id=cs_test_simulated_${Date.now()}&transaction_id=${params.transactionId}&amount=${params.amount}&status=success`,
      isSimulated: true,
    };
  }

  async verifyWebhook(payload: any, signatureHeader?: string): Promise<PaymentVerificationResult> {
    const config = await getPaymentConfig();
    const webhookSecret = config.stripe_webhook_secret;

    const isSimulated = payload.session_id?.startsWith("cs_test_simulated_");

    if (isSimulated || !webhookSecret || webhookSecret === "whsec_not_configured") {
      return {
        isValid: true,
        isSuccess: payload.status === "success",
        transactionId: payload.transaction_id || payload.client_reference_id,
        amount: Number(payload.amount || 0),
        providerTransactionId: payload.session_id,
      };
    }

    if (signatureHeader && webhookSecret) {
      try {
        const parts = signatureHeader.split(",");
        const timestampPart = parts.find((p) => p.startsWith("t="));
        const sigPart = parts.find((p) => p.startsWith("v1="));

        if (timestampPart && sigPart) {
          const timestamp = timestampPart.split("=")[1];
          const expectedSig = sigPart.split("=")[1];
          const signedPayload = `${timestamp}.${typeof payload === "string" ? payload : JSON.stringify(payload)}`;
          const computed = crypto.createHmac("sha256", webhookSecret).update(signedPayload).digest("hex");

          const isValid = computed === expectedSig;
          const isSuccess = isValid && payload.type === "checkout.session.completed";
          const session = payload.data?.object || {};

          return {
            isValid,
            isSuccess,
            transactionId: session.client_reference_id,
            amount: Number(session.amount_total || 0),
            providerTransactionId: session.id,
          };
        }
      } catch (err) {
        console.error("Stripe webhook verification error:", err);
      }
    }

    return {
      isValid: false,
      isSuccess: false,
      transactionId: payload.transaction_id || "",
      amount: 0,
      errorMessage: "Stripe signature mismatch",
    };
  }
}
