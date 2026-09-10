import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "LifeOS – Everything for your life, organized in one place",
  description: "Personal Life Management SaaS Multi-User platform with Tasks, Projects, Calendar, Habits, Goals, Finance, Notes, Pomodoro, and AI Life Coach.",
  keywords: ["LifeOS", "Life Management", "SaaS", "Personal Finance", "Productivity", "Habit Tracker", "Goal Tracker", "AI Planner"],
  authors: [{ name: "LifeOS Team" }],
};

import FloatingSupportWidget from "@/components/FloatingSupportWidget";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-[#09090b] text-neutral-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
        <FloatingSupportWidget />
      </body>
    </html>
  );
}
