import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trung Tâm Trợ Giúp & Hỗ Trợ Kỹ Thuật 24/7",
  description:
    "Trung tâm hỗ trợ khách hàng LifeOS: Gửi yêu cầu trợ giúp kỹ thuật, giải đáp thắc mắc tài khoản, chính sách bảo hành và hỗ trợ trực tiếp 1:1 qua Telegram.",
  openGraph: {
    title: "Trung Tâm Trợ Giúp & Hỗ Trợ Kỹ Thuật 24/7 | LifeOS",
    description: "Đội ngũ kỹ thuật LifeOS luôn sẵn sàng giải đáp thắc mắc và hỗ trợ người dùng 24/7.",
    images: ["/og-image.png"],
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
