import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập Tài Khoản",
  description: "Đăng nhập hệ điều hành LifeOS để tiếp tục quản lý công việc, tài chính và thói quen của bạn.",
  openGraph: {
    title: "Đăng Nhập Hệ Thống | LifeOS",
    description: "Đăng nhập để đồng bộ dữ liệu và trải nghiệm trợ lý AI thông minh trên LifeOS.",
    images: ["/og-image.png"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
