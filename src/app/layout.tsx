import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "../components/layout/AppLayout";

export const metadata: Metadata = {
  title: "ライフプラン シミュレーター",
  description: "将来の収支・資産推移をシミュレーションできる無料ツールです。データはブラウザにのみ保存され、サーバーには送信されません。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
