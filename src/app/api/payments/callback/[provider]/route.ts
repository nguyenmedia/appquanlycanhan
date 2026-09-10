import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, processSuccessfulPayment } from "@/lib/payments";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  try {
    const paymentProvider = getPaymentProvider(provider);
    const verification = await paymentProvider.verifyWebhook(searchParams);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!verification.isValid || !verification.isSuccess) {
      console.warn(`Payment callback failed for provider ${provider}:`, verification.message);
      return NextResponse.redirect(`${appUrl}/settings/billing?status=failed&error=${encodeURIComponent(verification.message || "Giao dịch không thành công")}`);
    }

    // Process subscription and grant benefits
    await processSuccessfulPayment({
      transactionId: verification.transactionId,
      providerTransactionId: verification.providerTransactionId,
      amount: verification.amount,
      provider,
    });

    return NextResponse.redirect(`${appUrl}/settings/billing?status=success&txn=${verification.transactionId}`);
  } catch (error: any) {
    console.error(`Error processing ${provider} callback:`, error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/settings/billing?status=error&msg=${encodeURIComponent(error.message)}`);
  }
}
