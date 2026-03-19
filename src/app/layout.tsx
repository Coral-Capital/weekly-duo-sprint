import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { auth, signOut } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Weekly DUO Sprint",
  description: "DUO英単語フレーズ学習 小テスト",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ja">
      <body className="bg-pearl text-nightrider min-h-screen font-sans">
        <Providers>
          {session?.user && (
            <header className="bg-coral text-white py-3 px-6 shadow-md">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <a href="/" className="text-lg font-bold">
                  Weekly DUO Sprint
                </a>
                <div className="flex items-center gap-4 text-sm">
                  <span className="opacity-90">{session.user.name}</span>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/login" });
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors text-xs"
                    >
                      ログアウト
                    </button>
                  </form>
                </div>
              </div>
            </header>
          )}
          <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
