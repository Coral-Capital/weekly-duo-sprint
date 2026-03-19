import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weekly DUO Sprint",
  description: "DUO英単語フレーズ学習 小テスト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
          <div className="max-w-3xl mx-auto">
            <a href="/" className="text-xl font-bold">Weekly DUO Sprint</a>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
