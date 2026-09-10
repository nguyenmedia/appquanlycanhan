import { IPaymentProvider, CreatePaymentParams, PaymentVerificationResult } from "./types";
import { getPaymentConfig } from "./config";

export class VietQRProvider implements IPaymentProvider {
  name: "vietqr" = "vietqr";

  async isConfigured(): Promise<boolean> {
    const config = await getPaymentConfig();
    return Boolean(config.bank_account_number && config.bank_id && config.vietqr_enabled);
  }

  async createPaymentUrl(params: CreatePaymentParams): Promise<{
    paymentUrl: string;
    isSimulated?: boolean;
    qrUrl?: string;
    bankInfo?: any;
  }> {
    const config = await getPaymentConfig();
    const bankId = config.bank_id || "MB";
    const accountNumber = config.bank_account_number || "0987654321";
    const accountName = config.bank_account_name || "LIFEOS PLATFORM";
    const prefix = config.bank_transfer_prefix || "LIFEOS";

    // Format transfer content: e.g. "LIFEOS TXN_1725912345_ABC123"
    const transferContent = `${prefix} ${params.transactionId}`;

    // VietQR quick chart URL (Compact 2 style)
    const qrImageUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${params.amount}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=${encodeURIComponent(accountName)}`;

    // App internal payment page for scanning VietQR
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutPageUrl = `${appUrl}/checkout/vietqr?transactionId=${params.transactionId}&amount=${params.amount}&bankId=${bankId}&accountNumber=${accountNumber}&accountName=${encodeURIComponent(
      accountName
    )}&content=${encodeURIComponent(transferContent)}&qrUrl=${encodeURIComponent(qrImageUrl)}`;

    return {
      paymentUrl: checkoutPageUrl,
      qrUrl: qrImageUrl,
      bankInfo: {
        bankId,
        accountNumber,
        accountName,
        transferContent,
        amount: params.amount,
      },
    };
  }

  async verifyWebhook(data: any, signatureHeader?: string): Promise<PaymentVerificationResult> {
    // SePay standard webhook structure:
    // { id, gateway, transactionDate, accountNumber, content, transferType: "in", transferAmount }
    if (data.transferType === "in" && data.content) {
      const config = await getPaymentConfig();
      const prefix = config.bank_transfer_prefix || "LIFEOS";

      // Match transaction ID in content
      const regex = new RegExp(`(${prefix}\\s+)?(TXN_[A-Za-z0-9_]+)`, "i");
      const match = data.content.match(regex);
      const transactionId = match ? match[2] : "";

      if (transactionId) {
        return {
          isValid: true,
          isSuccess: true,
          transactionId,
          providerTransactionId: String(data.id || data.referenceCode || Date.now()),
          amount: Number(data.transferAmount),
        };
      }
    }

    return {
      isValid: false,
      isSuccess: false,
      transactionId: "",
      amount: 0,
      errorMessage: "Could not parse valid VietQR transfer content",
    };
  }
}
