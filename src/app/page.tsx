"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import duoData from "@/data/duo-data.json";

const sections = Object.keys(duoData)
  .map(Number)
  .sort((a, b) => a - b);

export default function Home() {
  const router = useRouter();
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState(10);

  const toggleSection = (s: number) => {
    setSelectedSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const selectRange = (start: number, end: number) => {
    const range = sections.filter((s) => s >= start && s <= end);
    setSelectedSections((prev) => {
      const existing = new Set(prev);
      const allSelected = range.every((s) => existing.has(s));
      if (allSelected) {
        return prev.filter((s) => !range.includes(s));
      }
      return [...new Set([...prev, ...range])];
    });
  };

  const totalAvailable = selectedSections.reduce((sum, s) => {
    const key = String(s) as keyof typeof duoData;
    return sum + (duoData[key]?.length ?? 0);
  }, 0);

  const startQuiz = () => {
    if (selectedSections.length === 0) return;
    const params = new URLSearchParams({
      sections: selectedSections.sort((a, b) => a - b).join(","),
      count: String(Math.min(questionCount, totalAvailable)),
    });
    router.push(`/quiz?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">DUO 小テスト</h2>
        <p className="text-gray-600">
          セクションを選び、出題数を設定してテストを始めましょう。
          日本語の文章が表示されるので、対応する英文を入力してください。
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">セクション選択</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() =>
              setSelectedSections(
                selectedSections.length === sections.length ? [] : [...sections]
              )
            }
            className="px-3 py-1 rounded text-sm font-medium bg-gray-200 hover:bg-gray-300"
          >
            {selectedSections.length === sections.length
              ? "全解除"
              : "全選択"}
          </button>
          {[
            [1, 15],
            [16, 30],
            [31, 45],
          ].map(([start, end]) => (
            <button
              key={`${start}-${end}`}
              onClick={() => selectRange(start, end)}
              className="px-3 py-1 rounded text-sm font-medium bg-gray-200 hover:bg-gray-300"
            >
              {start}-{end}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => toggleSection(s)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedSections.includes(s)
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 hover:border-blue-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {selectedSections.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            選択中: {selectedSections.length}セクション ({totalAvailable}問から出題可能)
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">出題数</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={Math.max(totalAvailable, 1)}
            value={Math.min(questionCount, totalAvailable || 1)}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="flex-1"
            disabled={totalAvailable === 0}
          />
          <input
            type="number"
            min={1}
            max={totalAvailable}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-20 px-3 py-2 border rounded text-center"
            disabled={totalAvailable === 0}
          />
          <span className="text-sm text-gray-500">問</span>
        </div>
      </div>

      <button
        onClick={startQuiz}
        disabled={selectedSections.length === 0}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        テスト開始
      </button>
    </div>
  );
}
