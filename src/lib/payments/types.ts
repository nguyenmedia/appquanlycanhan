export interface CreatePaymentParams {
  transactionId: string;
  orderInfo: string;
  amount: number; // In VND (or foreign currency for stripe)
  returnUrl: string;
  ipAddress: string;
  userId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
}

export interface PaymentVerificationResult {
  isValid: boolean;
  isSuccess: boolean;
  transactionId: string;
  amount: number;
  providerTransactionId?: string;
  responseCode?: string;
  message?: string;
  errorMessage?: string;
}

export interface IPaymentProvider {
  name: "vnpay" | "momo" | "stripe" | "vietqr";
  isConfigured(): boolean | Promise<boolean>;
  createPaymentUrl(params: CreatePaymentParams): Promise<{
    paymentUrl: string;
    isSimulated?: boolean;
    qrUrl?: string;
    bankInfo?: any;
  }>;
  verifyWebhook(data: any, signatureHeader?: string): Promise<PaymentVerificationResult>;
}
