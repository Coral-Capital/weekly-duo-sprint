"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type WordDiff = {
  type: "match" | "spelling" | "wrong" | "missing" | "extra";
  userWord: string | null;
  correctWord: string | null;
};

// English test result
type EnglishResult = {
  id: number;
  section: number;
  jp: string;
  score: number;
  status: "correct" | "spelling" | "wrong";
  userAnswer: string;
  correctAnswer: string;
  details: string;
  diff: WordDiff[];
};

// Translation test result
type TranslationResult = {
  id: number;
  section: number;
  en: string;
  score: number;
  status: "correct" | "wrong";
  userAnswer: string;
  correctAnswer: string;
  feedback: string;
};

type QuizResults = {
  results: (EnglishResult | TranslationResult)[];
  totalScore: number;
  totalQuestions: number;
  percentage: number;
  mode?: "translation";
};

function DiffDisplay({ diff, mode }: { diff: WordDiff[]; mode: "user" | "correct" }) {
  return (
    <span>
      {diff.map((d, i) => {
        const space = i > 0 ? " " : "";
        if (mode === "user") {
          if (d.type === "match") {
            return <span key={i}>{space}{d.userWord}</span>;
          }
          if (d.type === "spelling") {
            return <span key={i}>{space}<span className="text-coral underline decoration-coral">{d.userWord}</span></span>;
          }
          if (d.type === "wrong" || d.type === "extra") {
            return <span key={i}>{space}<span className="text-red-500 underline decoration-red-500">{d.userWord}</span></span>;
          }
          if (d.type === "missing") {
            return <span key={i}>{space}<span className="text-red-400 underline decoration-red-400">___</span></span>;
          }
        } else {
          if (d.type === "match") {
            return <span key={i}>{space}{d.correctWord}</span>;
          }
          if (d.type === "spelling" || d.type === "wrong" || d.type === "missing") {
            return <span key={i}>{space}<span className="text-bermuda-dark underline decoration-bermuda-dark">{d.correctWord}</span></span>;
          }
          if (d.type === "extra") return null;
        }
        return null;
      })}
    </span>
  );
}

function isTranslationResult(r: EnglishResult | TranslationResult): r is TranslationResult {
  return "en" in r;
}

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<QuizResults | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("quizResults");
    if (!stored) {
      router.push("/");
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) {
    return <div className="text-center py-12 text-nobel">読み込み中...</div>;
  }

  const { results, totalScore, totalQuestions, percentage } = data;
  const isTranslationMode = data.mode === "translation";
  const correctCount = results.filter((r) => r.status === "correct").length;
  const spellingCount = !isTranslationMode
    ? results.filter((r) => r.status === "spelling").length
    : 0;
  const wrongCount = results.filter((r) => r.status === "wrong").length;

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-bermuda-dark";
    if (pct >= 60) return "text-coral";
    return "text-red-600";
  };

  const getStatusBadge = (status: string, score?: number) => {
    if (status === "correct") {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-bermuda/20 text-bermuda-dark">
          {score ?? 1}
        </span>
      );
    }
    if (status === "spelling") {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-coral-bg text-coral">
          0.5
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
        0
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-alto/50 p-8 text-center">
        <h2 className="text-xl font-semibold mb-1">テスト結果</h2>
        {isTranslationMode && (
          <span className="text-xs bg-bermuda/20 text-bermuda-dark px-2 py-0.5 rounded">和訳テスト</span>
        )}
        <div className={`text-5xl font-bold mb-2 mt-3 ${getScoreColor(percentage)}`}>
          {totalScore} / {totalQuestions}
        </div>
        <div className={`text-2xl font-semibold ${getScoreColor(percentage)}`}>
          {percentage}%
        </div>
        <div className="flex justify-center gap-6 mt-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-bermuda-dark">{correctCount}</div>
            <div className="text-nobel">正解</div>
          </div>
          {!isTranslationMode && (
            <div className="text-center">
              <div className="text-2xl font-bold text-coral">{spellingCount}</div>
              <div className="text-nobel">スペルミス</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{wrongCount}</div>
            <div className="text-nobel">不正解</div>
          </div>
        </div>
      </div>

      {/* Legend - only for English mode */}
      {!isTranslationMode && (
        <div className="flex flex-wrap gap-4 text-xs text-nobel">
          <span><span className="text-red-500 underline decoration-red-500">赤下線</span> = 間違い</span>
          <span><span className="text-coral underline decoration-coral">橙下線</span> = スペルミス</span>
          <span><span className="text-bermuda-dark underline decoration-bermuda-dark">緑下線</span> = 正解</span>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">詳細</h3>
        {results.map((r, i) => {
          const isTrans = isTranslationResult(r);

          return (
            <div
              key={i}
              className={`bg-white rounded-lg border p-4 space-y-2 ${
                r.status === "correct"
                  ? "border-bermuda/50"
                  : r.status === "spelling"
                  ? "border-coral-light"
                  : "border-red-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-nobel">
                  問{i + 1} / Section {r.section} #{r.id}
                </span>
                {getStatusBadge(r.status, r.score)}
              </div>

              {/* Question */}
              <p className="font-medium text-sm">
                {isTrans ? r.en : (r as EnglishResult).jp}
              </p>

              {r.status === "correct" ? (
                <div className="space-y-1">
                  <div className="text-sm text-bermuda-dark">
                    {r.userAnswer}
                  </div>
                  {isTrans && (r as TranslationResult).feedback && (
                    <p className="text-xs text-nobel">{(r as TranslationResult).feedback}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-sm">
                    <span className="text-nobel text-xs mr-1">あなた:</span>
                    {!isTrans && (r as EnglishResult).diff ? (
                      <DiffDisplay diff={(r as EnglishResult).diff} mode="user" />
                    ) : (
                      <span className="text-red-500">
                        {r.userAnswer || "(未回答)"}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-nobel text-xs mr-1">正解:</span>
                    {!isTrans && (r as EnglishResult).diff ? (
                      <DiffDisplay diff={(r as EnglishResult).diff} mode="correct" />
                    ) : (
                      <span className="text-bermuda-dark">{r.correctAnswer}</span>
                    )}
                  </div>
                  {isTrans && (r as TranslationResult).feedback && (
                    <p className="text-xs text-nobel">{(r as TranslationResult).feedback}</p>
                  )}
                  {!isTrans && (r as EnglishResult).details && (
                    <p className="text-xs text-nobel">{(r as EnglishResult).details}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => router.push("/")}
        className="w-full py-3 bg-coral text-white rounded-lg font-semibold hover:bg-coral-hover transition-colors"
      >
        新しいテストを始める
      </button>
    </div>
  );
}
