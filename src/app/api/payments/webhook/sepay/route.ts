import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, processSuccessfulPayment } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // SePay Webhook Payload:
    // {
    //   "id": 123456,
    //   "gateway": "MBBank",
    //   "transactionDate": "2026-09-09 22:15:00",
    //   "accountNumber": "0123456789",
    //   "code": null,
    //   "content": "LIFEOS TXN_1725912345_ABC123",
    //   "transferType": "in",
    //   "transferAmount": 199000,
    //   "referenceCode": "MB12345"
    // }

    const vietqrProvider = getPaymentProvider("vietqr");
    const verification = await vietqrProvider.verifyWebhook(body);

    if (!verification.isValid || !verification.isSuccess) {
      return NextResponse.json(
        { success: false, message: verification.errorMessage || "Không tìm thấy mã giao dịch hợp lệ trong nội dung chuyển khoản" },
        { status: 400 }
      );
    }

    const result = await processSuccessfulPayment({
      transactionId: verification.transactionId,
      providerTransactionId: verification.providerTransactionId,
      amount: verification.amount,
      provider: "vietqr",
    });

    return NextResponse.json({
      success: true,
      message: "Giao dịch chuyển khoản tự động đã được đối soát và kích hoạt thành công",
      result,
    });
  } catch (error: any) {
    console.error("SePay Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
