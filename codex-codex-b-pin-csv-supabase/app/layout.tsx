import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "寶亮匹克球預開班",
  description: "查看開放登記的匹克球場次，填寫姓名、手機與人數即可登記。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
