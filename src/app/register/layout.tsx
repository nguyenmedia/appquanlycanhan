import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký Tài Khoản Miễn Phí",
  description:
    "Tạo tài khoản LifeOS miễn phí chỉ trong 30 giây. Bắt đầu quản lý công việc, theo dõi dòng tiền và rèn luyện thói quen ngay hôm nay.",
  openGraph: {
    title: "Đăng Ký Tài Khoản LifeOS Miễn Phí",
    description: "Bắt đầu hành trình làm chủ cuộc sống và tối ưu năng suất cùng hàng ngàn người dùng LifeOS.",
    images: ["/og-image.png"],
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
