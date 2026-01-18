import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "../components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Life Plan Visualizer",
  description: "Visualize your financial future",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
