import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng Giá Gói Dịch Vụ SaaS & Ưu Đãi Bản Quyền",
  description:
    "Bảng giá các gói dịch vụ LifeOS: Miễn phí trọn đời (Free), Nâng cao (Pro) và Không giới hạn (Lifetime). Thanh toán tiện lợi qua VietQR, MoMo, VNPay kích hoạt tức thì.",
  openGraph: {
    title: "Bảng Giá Gói Dịch Vụ SaaS & Ưu Đãi Bản Quyền | LifeOS",
    description: "Khám phá các gói cước linh hoạt với chi phí tối ưu, mở khóa toàn bộ sức mạnh Trợ lý AI và tính năng không giới hạn.",
    images: ["/og-image.png"],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
