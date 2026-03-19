"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import duoData from "@/data/duo-data.json";

const sections = Object.keys(duoData)
  .map(Number)
  .sort((a, b) => a - b);

function getSectionCount(s: number): number {
  const key = String(s) as keyof typeof duoData;
  return duoData[key]?.length ?? 0;
}

type Mode = "section" | "review" | "translation";

const MODES: { key: Mode; label: string }[] = [
  { key: "section", label: "英作文テスト" },
  { key: "translation", label: "和訳テスト" },
  { key: "review", label: "レビューテスト" },
];

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("section");

  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [reviewSections, setReviewSections] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState(20);

  const reviewTotal = reviewSections.reduce(
    (sum, s) => sum + getSectionCount(s),
    0
  );

  const toggleReviewSection = (s: number) => {
    setReviewSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const selectRange = (start: number, end: number) => {
    const range = sections.filter((s) => s >= start && s <= end);
    setReviewSections((prev) => {
      const existing = new Set(prev);
      const allSelected = range.every((s) => existing.has(s));
      if (allSelected) return prev.filter((s) => !range.includes(s));
      return [...new Set([...prev, ...range])];
    });
  };

  const startSectionTest = (testMode: "section" | "translation") => {
    if (selectedSection === null) return;
    const count = getSectionCount(selectedSection);
    const params = new URLSearchParams({
      sections: String(selectedSection),
      count: String(count),
      mode: testMode === "translation" ? "translation" : "english",
    });
    router.push(`/quiz?${params.toString()}`);
  };

  const startReviewTest = () => {
    if (reviewSections.length === 0) return;
    const params = new URLSearchParams({
      sections: reviewSections.sort((a, b) => a - b).join(","),
      count: String(Math.min(questionCount, reviewTotal)),
      mode: "english",
    });
    router.push(`/quiz?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">DUO 小テスト</h2>
        <p className="text-nobel">
          テストの種類を選んで、セクションを選択してください。
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-lg overflow-hidden border border-alto">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 py-3 text-center font-semibold text-sm transition-colors ${
              mode === m.key
                ? "bg-coral text-white"
                : "bg-white text-nightrider hover:bg-sand/50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {(mode === "section" || mode === "translation") ? (
        <div className="space-y-6">
          <p className="text-sm text-nobel">
            {mode === "section"
              ? "日本語 → 英文を入力。1セクションの全問が出題されます。"
              : "英文 → 日本語訳を入力。意味が合っていればOKです。"}
          </p>

          <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
            {sections.map((s) => {
              const count = getSectionCount(s);
              return (
                <button
                  key={s}
                  onClick={() =>
                    setSelectedSection(selectedSection === s ? null : s)
                  }
                  className={`px-3 py-3 rounded text-sm font-medium transition-colors ${
                    selectedSection === s
                      ? "bg-coral text-white"
                      : "bg-white border border-alto hover:border-coral"
                  }`}
                >
                  <div>{s}</div>
                  <div
                    className={`text-[10px] ${
                      selectedSection === s ? "text-white/70" : "text-nobel"
                    }`}
                  >
                    {count}問
                  </div>
                </button>
              );
            })}
          </div>

          {selectedSection !== null && (
            <div className="bg-white rounded-lg border border-alto/50 p-4 text-sm">
              <span className="font-semibold">
                Section {selectedSection}
              </span>
              <span className="text-nobel ml-2">
                — {getSectionCount(selectedSection)}問すべて出題
              </span>
            </div>
          )}

          <button
            onClick={() => startSectionTest(mode)}
            disabled={selectedSection === null}
            className="w-full py-3 bg-coral text-white rounded-lg font-semibold text-lg hover:bg-coral-hover disabled:bg-alto disabled:cursor-not-allowed transition-colors"
          >
            {mode === "translation" ? "和訳テスト開始" : "テスト開始"}
          </button>
        </div>
      ) : (
        /* ─── Review Test ─── */
        <div className="space-y-6">
          <p className="text-sm text-nobel">
            複数セクションから出題数を指定してテストできます（日本語 → 英文）。
          </p>

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() =>
                  setReviewSections(
                    reviewSections.length === sections.length
                      ? []
                      : [...sections]
                  )
                }
                className="px-3 py-1 rounded text-sm font-medium bg-sand hover:bg-sand/70 transition-colors"
              >
                {reviewSections.length === sections.length
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
                  className="px-3 py-1 rounded text-sm font-medium bg-sand hover:bg-sand/70 transition-colors"
                >
                  {start}-{end}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
              {sections.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleReviewSection(s)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    reviewSections.includes(s)
                      ? "bg-coral text-white"
                      : "bg-white border border-alto hover:border-coral"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {reviewSections.length > 0 && (
              <p className="mt-2 text-sm text-nobel">
                選択中: {reviewSections.length}セクション ({reviewTotal}
                問から出題可能)
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">出題数</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={Math.max(reviewTotal, 1)}
                value={Math.min(questionCount, reviewTotal || 1)}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="flex-1 accent-coral"
                disabled={reviewTotal === 0}
              />
              <input
                type="number"
                min={1}
                max={reviewTotal}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-alto rounded text-center focus:outline-none focus:ring-2 focus:ring-coral"
                disabled={reviewTotal === 0}
              />
              <span className="text-sm text-nobel">問</span>
            </div>
          </div>

          <button
            onClick={startReviewTest}
            disabled={reviewSections.length === 0}
            className="w-full py-3 bg-coral text-white rounded-lg font-semibold text-lg hover:bg-coral-hover disabled:bg-alto disabled:cursor-not-allowed transition-colors"
          >
            レビューテスト開始
          </button>
        </div>
      )}
    </div>
  );
}
