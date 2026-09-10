import prisma from "./prisma";

export interface ValidateCouponResult {
  valid: boolean;
  message?: string;
  coupon?: any;
  discountAmount: number;
  finalAmount: number;
}

export async function validateAndApplyCoupon({
  code,
  userId,
  planId,
  originalAmount,
}: {
  code: string;
  userId: string;
  planId: string;
  originalAmount: number;
}): Promise<ValidateCouponResult> {
  if (!code || !code.trim()) {
    return { valid: false, message: "Mã giảm giá không được để trống", discountAmount: 0, finalAmount: originalAmount };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return { valid: false, message: "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa", discountAmount: 0, finalAmount: originalAmount };
  }

  const now = new Date();
  if (now < coupon.validFrom) {
    return { valid: false, message: "Mã giảm giá chưa đến ngày áp dụng", discountAmount: 0, finalAmount: originalAmount };
  }

  if (now > coupon.validUntil) {
    return { valid: false, message: "Mã giảm giá đã hết hạn sử dụng", discountAmount: 0, finalAmount: originalAmount };
  }

  if (coupon.timesRedeemed >= coupon.maxRedemptions) {
    return { valid: false, message: "Mã giảm giá đã hết lượt sử dụng", discountAmount: 0, finalAmount: originalAmount };
  }

  if (originalAmount < coupon.minimumAmount) {
    return {
      valid: false,
      message: `Đơn hàng tối thiểu để áp dụng mã là ${coupon.minimumAmount.toLocaleString("vi-VN")}đ`,
      discountAmount: 0,
      finalAmount: originalAmount,
    };
  }

  // Check per-user limit
  const userRedemptions = await prisma.couponRedemption.count({
    where: { couponId: coupon.id, userId },
  });

  if (userRedemptions >= coupon.perUserLimit) {
    return {
      valid: false,
      message: `Bạn đã sử dụng tối đa lượt cho phép (${coupon.perUserLimit} lần) của mã này`,
      discountAmount: 0,
      finalAmount: originalAmount,
    };
  }

  // Check applicable plans if restricted
  if (coupon.applicablePlansJson) {
    try {
      const allowedPlans: string[] = JSON.parse(coupon.applicablePlansJson);
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (plan && allowedPlans.length > 0 && !allowedPlans.includes(plan.slug)) {
        return {
          valid: false,
          message: "Mã giảm giá này không áp dụng cho gói đã chọn",
          discountAmount: 0,
          finalAmount: originalAmount,
        };
      }
    } catch (e) {
      console.error("Error checking plan restrictions", e);
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (originalAmount * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  // Ensure discount does not exceed original amount
  discountAmount = Math.min(discountAmount, originalAmount);
  const finalAmount = Math.max(0, originalAmount - discountAmount);

  return {
    valid: true,
    message: `Áp dụng thành công mã ${coupon.code}! Giảm ${discountAmount.toLocaleString("vi-VN")}đ`,
    coupon,
    discountAmount,
    finalAmount,
  };
}
