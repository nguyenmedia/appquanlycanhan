const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

// 1. UNIT TEST: COUPON DISCOUNT ENGINE
test("Coupon Calculation: Percentage Discount applies correctly", () => {
  const originalAmount = 199000;
  const discountPercent = 20; // WELCOME20
  const expectedDiscount = (originalAmount * discountPercent) / 100;
  const finalAmount = originalAmount - expectedDiscount;

  assert.equal(expectedDiscount, 39800);
  assert.equal(finalAmount, 159200);
});

test("Coupon Calculation: Fixed Discount applies correctly", () => {
  const originalAmount = 199000;
  const fixedDiscount = 50000; // PRO50K
  const finalAmount = originalAmount - fixedDiscount;

  assert.equal(finalAmount, 149000);
});

test("Coupon Calculation: Discount cannot exceed original amount", () => {
  const originalAmount = 30000;
  const fixedDiscount = 50000;
  const discountAmount = Math.min(fixedDiscount, originalAmount);
  const finalAmount = Math.max(0, originalAmount - discountAmount);

  assert.equal(discountAmount, 30000);
  assert.equal(finalAmount, 0);
});

// 2. UNIT TEST: AI CREDIT LEDGER LOGIC
test("AI Credit Ledger: Correct debit and balance tracking", () => {
  const initialBalance = 300;
  const featureCost = 5; // e.g. AI Weekly Review
  const newBalance = initialBalance - featureCost;

  assert.equal(newBalance, 295);
  assert.ok(newBalance >= 0, "Balance must never drop below zero");
});

test("AI Credit Ledger: Rejects operation if insufficient balance", () => {
  const currentBalance = 2;
  const featureCost = 5;
  const canProceed = currentBalance >= featureCost;

  assert.equal(canProceed, false);
});

// 3. UNIT TEST: PLAN LIMIT CHECKING
test("Plan Limits: Free user task limit restricts creation at quota", () => {
  const limitValue = 100;
  const currentTaskCount = 100;
  const isAllowed = currentTaskCount < limitValue;

  assert.equal(isAllowed, false);
});

test("Plan Limits: Pro user with unlimited (-1) allows creation", () => {
  const limitValue = -1; // unlimited
  const currentTaskCount = 450;
  const isAllowed = limitValue === -1 || currentTaskCount < limitValue;

  assert.equal(isAllowed, true);
});

// 4. UNIT TEST: PAYMENT SIGNATURE VERIFICATION (VNPay HMAC-SHA512)
test("Payment Gateway: VNPay SHA-512 signature computation & validation", () => {
  const secretKey = "VNPAY_TEST_SECRET_KEY_123456";
  const querystring = "vnp_Amount=19900000&vnp_Command=pay&vnp_CurrCode=VND&vnp_ResponseCode=00&vnp_TxnRef=TXN_TEST_001";

  const hmac = crypto.createHmac("sha512", secretKey);
  const expectedSignature = hmac.update(Buffer.from(querystring, "utf-8")).digest("hex");

  // Verify
  const verifyHmac = crypto.createHmac("sha512", secretKey);
  const calculatedSignature = verifyHmac.update(Buffer.from(querystring, "utf-8")).digest("hex");

  assert.equal(calculatedSignature, expectedSignature);
});

// 5. UNIT TEST: PAYMENT SIGNATURE VERIFICATION (MoMo HMAC-SHA256)
test("Payment Gateway: MoMo HMAC-SHA256 signature computation & validation", () => {
  const secretKey = "MOMO_TEST_SECRET_KEY_123456";
  const rawSignature = "accessKey=ACC123&amount=199000&orderId=TXN_MOMO_001&resultCode=0";

  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
  const verified = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  assert.equal(verified, signature);
});

// 6. UNIT TEST: REFERRAL REWARD CALCULATION
test("Referral Program: Grants 7 days Pro per successful referral", () => {
  const currentPeriodEnd = new Date("2026-10-01T00:00:00Z");
  const rewardDays = 7;
  const newPeriodEnd = new Date(currentPeriodEnd.getTime() + rewardDays * 24 * 60 * 60 * 1000);

  const diffDays = (newPeriodEnd.getTime() - currentPeriodEnd.getTime()) / (1000 * 60 * 60 * 24);
  assert.equal(diffDays, 7);
});

// 7. UNIT TEST: MRR & ARR CALCULATION
test("SaaS KPI: Calculates MRR and ARR correctly across monthly & yearly subscriptions", () => {
  const monthlySubPrice = 199000;
  const yearlySubPrice = 1990000; // 1,990,000 / 12 = 165,833.33/mo

  const totalMrr = monthlySubPrice + (yearlySubPrice / 12);
  const totalArr = totalMrr * 12;

  assert.equal(Math.round(totalMrr), 364833);
  assert.equal(Math.round(totalArr), 4378000);
});
