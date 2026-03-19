"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import duoData from "@/data/duo-data.json";

type Question = { id: number; jp: string; en: string; section: number };

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizMode, setQuizMode] = useState<"english" | "translation">("english");

  useEffect(() => {
    const sectionParam = searchParams.get("sections");
    const countParam = searchParams.get("count");
    const modeParam = searchParams.get("mode");
    if (!sectionParam) {
      router.push("/");
      return;
    }

    setQuizMode(modeParam === "translation" ? "translation" : "english");

    const sectionNums = sectionParam.split(",").map(Number);
    const count = Number(countParam) || 10;

    const allQuestions: Question[] = [];
    for (const s of sectionNums) {
      const key = String(s) as keyof typeof duoData;
      const items = duoData[key];
      if (items) {
        for (const item of items) {
          allQuestions.push({ ...item, section: s });
        }
      }
    }

    const selected = shuffleArray(allQuestions).slice(0, count);
    setQuestions(selected);
    setAnswers(Array(selected.length).fill(""));
  }, [searchParams, router]);

  const updateAnswer = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const isTranslation = quizMode === "translation";
      const endpoint = isTranslation ? "/api/grade-translation" : "/api/grade";

      const sectionCount = new Set(questions.map((q) => q.section)).size;
      const testType = isTranslation
        ? "和訳テスト"
        : sectionCount === 1
        ? "セクションテスト"
        : "レビューテスト";

      const body = isTranslation
        ? {
            questions: questions.map((q, i) => ({
              id: q.id,
              section: q.section,
              en: q.en,
              correctJp: q.jp,
              userAnswer: answers[i] || "",
            })),
            testType,
          }
        : {
            questions: questions.map((q, i) => ({
              id: q.id,
              section: q.section,
              jp: q.jp,
              correctAnswer: q.en,
              userAnswer: answers[i] || "",
            })),
            testType,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      sessionStorage.setItem("quizResults", JSON.stringify(data));
      router.push("/result");
    } catch {
      alert("採点中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return <div className="text-center py-12 text-nobel">読み込み中...</div>;
  }

  const q = questions[currentIndex];
  const progress = answers.filter((a) => a.trim().length > 0).length;
  const isTranslation = quizMode === "translation";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-nobel">
            問 {currentIndex + 1} / {questions.length}
          </span>
          {isTranslation && (
            <span className="text-xs bg-bermuda/20 text-bermuda-dark px-2 py-0.5 rounded">和訳</span>
          )}
        </div>
        <span className="text-sm text-nobel">
          回答済み: {progress} / {questions.length}
        </span>
      </div>

      <div className="w-full bg-sand rounded-full h-2">
        <div
          className="bg-coral h-2 rounded-full transition-all"
          style={{ width: `${(progress / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-alto/50 p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs text-nobel">
          <span>Section {q.section}</span>
          <span>#{q.id}</span>
        </div>
        <p className="text-lg font-medium leading-relaxed">
          {isTranslation ? q.en : q.jp}
        </p>
        <textarea
          value={answers[currentIndex]}
          onChange={(e) => updateAnswer(currentIndex, e.target.value)}
          placeholder={isTranslation ? "日本語訳を入力してください..." : "英文を入力してください..."}
          className="w-full p-4 border border-alto rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-coral min-h-[120px] text-base"
          autoFocus
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-lg border border-alto bg-white hover:bg-sand/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          前へ
        </button>

        <div className="flex-1 flex flex-wrap gap-1 justify-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                i === currentIndex
                  ? "bg-coral text-white"
                  : answers[i]?.trim()
                  ? "bg-bermuda/30 text-bermuda-dark border border-bermuda"
                  : "bg-whitesmoke text-nobel border border-alto/50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() =>
              setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
            }
            className="px-4 py-2 rounded-lg border border-alto bg-white hover:bg-sand/50 transition-colors"
          >
            次へ
          </button>
        ) : (
          <button
            onClick={submitQuiz}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-coral text-white font-medium hover:bg-coral-hover disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "採点中..." : "提出"}
          </button>
        )}
      </div>

      {currentIndex < questions.length - 1 && (
        <button
          onClick={submitQuiz}
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-bermuda-dark text-white font-semibold hover:bg-bermuda transition-colors disabled:opacity-50"
        >
          {isSubmitting
            ? "採点中..."
            : `テストを提出する (${progress}/${questions.length} 回答済み)`}
        </button>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-nobel">読み込み中...</div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
