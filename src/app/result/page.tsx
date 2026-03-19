"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type WordDiff = {
  type: "match" | "spelling" | "wrong" | "missing" | "extra";
  userWord: string | null;
  correctWord: string | null;
};

type Result = {
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

type QuizResults = {
  results: Result[];
  totalScore: number;
  totalQuestions: number;
  percentage: number;
};

function DiffDisplay({ diff, mode }: { diff: WordDiff[]; mode: "user" | "correct" }) {
  return (
    <span>
      {diff.map((d, i) => {
        if (mode === "user") {
          // User's answer view
          if (d.type === "match") {
            return <span key={i}>{i > 0 ? " " : ""}{d.userWord}</span>;
          }
          if (d.type === "spelling") {
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                <span className="underline decoration-wavy decoration-coral text-coral font-medium">{d.userWord}</span>
              </span>
            );
          }
          if (d.type === "wrong") {
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                <span className="line-through text-red-500">{d.userWord}</span>
              </span>
            );
          }
          if (d.type === "extra") {
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                <span className="line-through text-red-400 bg-red-50 px-0.5 rounded">{d.userWord}</span>
              </span>
            );
          }
          if (d.type === "missing") {
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                <span className="text-nobel border-b-2 border-dashed border-red-300 px-1">___</span>
              </span>
            );
          }
        } else {
          // Correct answer view
          if (d.type === "match") {
            return <span key={i}>{i > 0 ? " " : ""}{d.correctWord}</span>;
          }
          if (d.type === "spelling") {
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                <span className="underline decoration-coral font-medium text-coral">{d.correctWord}</span>
              </span>
            );
          }
          if (d.type === "wrong") {
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                <span className="font-semibold text-bermuda-dark bg-bermuda/15 px-0.5 rounded">{d.correctWord}</span>
              </span>
            );
          }
          if (d.type === "missing") {
            return (
              <span key={i}>
                {i > 0 ? " " : ""}
                <span className="font-semibold text-bermuda-dark bg-bermuda/15 px-0.5 rounded">{d.correctWord}</span>
              </span>
            );
          }
          if (d.type === "extra") {
            // No corresponding correct word
            return null;
          }
        }
        return null;
      })}
    </span>
  );
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
  const correctCount = results.filter((r) => r.status === "correct").length;
  const spellingCount = results.filter((r) => r.status === "spelling").length;
  const wrongCount = results.filter((r) => r.status === "wrong").length;

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-bermuda-dark";
    if (pct >= 60) return "text-coral";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "correct":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-bermuda/20 text-bermuda-dark">
            1.0
          </span>
        );
      case "spelling":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-coral-bg text-coral">
            0.5
          </span>
        );
      case "wrong":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
            0
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-alto/50 p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">テスト結果</h2>
        <div className={`text-5xl font-bold mb-2 ${getScoreColor(percentage)}`}>
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
          <div className="text-center">
            <div className="text-2xl font-bold text-coral">{spellingCount}</div>
            <div className="text-nobel">スペルミス</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{wrongCount}</div>
            <div className="text-nobel">不正解</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-nobel">
        <span className="flex items-center gap-1">
          <span className="underline decoration-wavy decoration-coral text-coral">波線</span> = スペルミス
        </span>
        <span className="flex items-center gap-1">
          <span className="line-through text-red-500">取消線</span> = 間違い/余分
        </span>
        <span className="flex items-center gap-1">
          <span className="border-b-2 border-dashed border-red-300 px-1">___</span> = 抜け
        </span>
        <span className="flex items-center gap-1">
          <span className="bg-bermuda/15 text-bermuda-dark px-0.5 rounded font-semibold">緑</span> = 正解の単語
        </span>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">詳細</h3>
        {results.map((r, i) => (
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
              {getStatusBadge(r.status)}
            </div>
            <p className="font-medium text-sm">{r.jp}</p>

            {r.status === "correct" ? (
              <div className="text-sm text-bermuda-dark">{r.correctAnswer}</div>
            ) : (
              <div className="space-y-1.5">
                <div className="text-sm">
                  <span className="text-nobel text-xs mr-1">あなた:</span>
                  {r.diff ? (
                    <DiffDisplay diff={r.diff} mode="user" />
                  ) : (
                    <span className={r.status === "wrong" ? "text-red-600" : "text-coral"}>
                      {r.userAnswer || "(未回答)"}
                    </span>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-nobel text-xs mr-1">正解:</span>
                  {r.diff ? (
                    <DiffDisplay diff={r.diff} mode="correct" />
                  ) : (
                    <span className="text-bermuda-dark">{r.correctAnswer}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
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
