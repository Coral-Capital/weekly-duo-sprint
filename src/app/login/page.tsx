"use client";

import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-pearl flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center space-y-6">
        <div>
          <div className="text-3xl font-bold text-coral mb-1">CORAL CAPITAL</div>
          <h1 className="text-xl font-semibold text-nightrider mt-4">
            Weekly DUO Sprint
          </h1>
          <p className="text-sm text-nobel mt-2">
            DUO英単語フレーズ 小テスト
          </p>
        </div>

        {error && (
          <div className="bg-coral/10 text-coral text-sm p-3 rounded-lg">
            coralcap.co のメールアドレスでログインしてください
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-sand rounded-lg hover:bg-sand/30 transition-colors font-medium text-nightrider"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google でログイン
        </button>

        <p className="text-xs text-nobel">
          @coralcap.co アカウントのみ利用可能です
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-pearl flex items-center justify-center">
          <div className="text-nobel">読み込み中...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
