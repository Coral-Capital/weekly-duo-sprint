"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  id: number;
  section: number;
  jp: string;
  score: number;
  status: "correct" | "spelling" | "wrong";
  userAnswer: string;
  correctAnswer: string;
  details: string;
};

type QuizResults = {
  results: Result[];
  totalScore: number;
  totalQuestions: number;
  percentage: number;
};

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
    return <div className="text-center py-12 text-gray-500">読み込み中...</div>;
  }

  const { results, totalScore, totalQuestions, percentage } = data;
  const correctCount = results.filter((r) => r.status === "correct").length;
  const spellingCount = results.filter((r) => r.status === "spelling").length;
  const wrongCount = results.filter((r) => r.status === "wrong").length;

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "correct":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
            1.0
          </span>
        );
      case "spelling":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
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
      {/* Score summary */}
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">テスト結果</h2>
        <div className={`text-5xl font-bold mb-2 ${getScoreColor(percentage)}`}>
          {totalScore} / {totalQuestions}
        </div>
        <div className={`text-2xl font-semibold ${getScoreColor(percentage)}`}>
          {percentage}%
        </div>
        <div className="flex justify-center gap-6 mt-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
            <div className="text-gray-500">正解</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{spellingCount}</div>
            <div className="text-gray-500">スペルミス</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{wrongCount}</div>
            <div className="text-gray-500">不正解</div>
          </div>
        </div>
      </div>

      {/* Detailed results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">詳細</h3>
        {results.map((r, i) => (
          <div
            key={i}
            className={`bg-white rounded-lg border p-4 space-y-2 ${
              r.status === "correct"
                ? "border-green-200"
                : r.status === "spelling"
                ? "border-yellow-200"
                : "border-red-200"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-gray-400">
                問{i + 1} / Section {r.section} #{r.id}
              </span>
              {getStatusBadge(r.status)}
            </div>
            <p className="font-medium text-sm">{r.jp}</p>
            {r.status !== "correct" && (
              <>
                <div className="text-sm">
                  <span className="text-gray-500">あなたの回答: </span>
                  <span className={r.status === "wrong" ? "text-red-600" : "text-yellow-700"}>
                    {r.userAnswer || "(未回答)"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">正解: </span>
                  <span className="text-green-700">{r.correctAnswer}</span>
                </div>
                <p className="text-xs text-gray-500">{r.details}</p>
              </>
            )}
            {r.status === "correct" && (
              <div className="text-sm text-green-700">{r.correctAnswer}</div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          新しいテストを始める
        </button>
      </div>
    </div>
  );
}
