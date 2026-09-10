# 💳 LIFEOS – PAYMENT GATEWAY ARCHITECTURE

## 1. Multi-Provider Abstraction

Payment gateways implement the unified `IPaymentProvider` interface:

```typescript
export interface IPaymentProvider {
  name: "vnpay" | "momo" | "stripe";
  isConfigured(): boolean;
  createPaymentUrl(params: CreatePaymentParams): Promise<{ paymentUrl: string; isSimulated?: boolean }>;
  verifyWebhook(data: any, signatureHeader?: string): Promise<PaymentVerificationResult>;
}
```

## 2. VNPay Integration (Vietnam)
- **Algorithm**: `HMAC-SHA512`.
- **Query Parameter Sorting**: Alphabetically sorted URL parameters encoded with RFC3986.
- **Checksum Parameter**: `vnp_SecureHash`.
- **Return Code**: `vnp_ResponseCode = "00"` signifies successful transaction.
- **Amounts**: VNPay requires VND amount multiplied by 100 (`amount * 100`).

## 3. MoMo Integration (Vietnam)
- **Algorithm**: `HMAC-SHA256`.
- **Payload Format**: `accessKey=...&amount=...&extraData=...&orderId=...&partnerCode=...`.
- **Signature Field**: `signature`.
- **Return Code**: `resultCode = 0` indicates success.

## 4. Stripe Integration (International)
- **Checkout Type**: Hosted Checkout Sessions (`mode: 'payment'`).
- **Webhook Signature**: `stripe-signature` header verified with secret `whsec_...`.

## 5. Idempotency & Concurrency Safety
- Every checkout creates a unique `idempotencyKey` formatted as `TXN_<timestamp>_<randomHex>`.
- In `processSuccessfulPayment`:
  - If transaction status is already `"success"`, the event is acknowledged without repeating subscription extension or granting duplicate benefits.
  - Prevents double-charging or multiple credit grants.

## 6. Safe Sandbox Simulation Mode
When production API credentials have not been configured by the host, LifeOS automatically provides a local sandbox test simulation flow that simulates gateway callbacks safely with explicit audit indicators.
