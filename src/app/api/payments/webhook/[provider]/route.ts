import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, processSuccessfulPayment } from "@/lib/payments";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  try {
    let bodyData: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      bodyData = await req.json();
    } else {
      const formData = await req.formData();
      bodyData = Object.fromEntries(formData.entries());
    }

    const signatureHeader = req.headers.get("stripe-signature") || "";
    const paymentProvider = getPaymentProvider(provider);

    const verification = await paymentProvider.verifyWebhook(bodyData, signatureHeader);

    if (!verification.isValid) {
      return NextResponse.json({ RspCode: "97", Message: "Invalid signature" }, { status: 400 });
    }

    if (verification.isSuccess) {
      await processSuccessfulPayment({
        transactionId: verification.transactionId,
        providerTransactionId: verification.providerTransactionId,
        amount: verification.amount,
        provider,
      });
    }

    // Response formatting expected by payment gateways (VNPay / MoMo)
    return NextResponse.json({ RspCode: "00", Message: "Success" });
  } catch (error: any) {
    console.error(`Webhook error for ${provider}:`, error);
    return NextResponse.json({ RspCode: "99", Message: error.message }, { status: 500 });
  }
}
