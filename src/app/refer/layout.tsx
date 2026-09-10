import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chương Trình Giới Thiệu Bạn Bè – Tặng 7 Ngày Pro",
  description:
    "Chia sẻ LifeOS với bạn bè và đồng nghiệp để nhận ngay +7 ngày nâng cấp gói Pro miễn phí cho mỗi lượt đăng ký thành công.",
  openGraph: {
    title: "Chương Trình Giới Thiệu Bạn Bè – Tặng 7 Ngày Pro | LifeOS",
    description: "Nhận ngày dùng Pro miễn phí khi giới thiệu bạn bè tham gia hệ điều hành LifeOS.",
    images: ["/og-image.png"],
  },
};

export default function ReferLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
