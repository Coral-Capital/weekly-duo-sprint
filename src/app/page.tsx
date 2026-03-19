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
  { key: "section", label: "セクションテスト" },
  { key: "review", label: "レビューテスト" },
  { key: "translation", label: "和訳テスト" },
];

// Shared multi-section selector component
function MultiSectionSelector({
  selectedSections,
  setSelectedSections,
  questionCount,
  setQuestionCount,
  buttonLabel,
  description,
  onStart,
}: {
  selectedSections: number[];
  setSelectedSections: (s: number[] | ((prev: number[]) => number[])) => void;
  questionCount: number;
  setQuestionCount: (n: number) => void;
  buttonLabel: string;
  description: string;
  onStart: () => void;
}) {
  const total = selectedSections.reduce((sum, s) => sum + getSectionCount(s), 0);

  const toggleSection = (s: number) => {
    setSelectedSections((prev: number[]) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const selectRange = (start: number, end: number) => {
    const range = sections.filter((s) => s >= start && s <= end);
    setSelectedSections((prev: number[]) => {
      const existing = new Set(prev);
      const allSelected = range.every((s) => existing.has(s));
      if (allSelected) return prev.filter((s) => !range.includes(s));
      return [...new Set([...prev, ...range])];
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-nobel">{description}</p>

      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() =>
              setSelectedSections(
                selectedSections.length === sections.length ? [] : [...sections]
              )
            }
            className="px-3 py-1 rounded text-sm font-medium bg-sand hover:bg-sand/70 transition-colors"
          >
            {selectedSections.length === sections.length ? "全解除" : "全選択"}
          </button>
          {[[1, 15], [16, 30], [31, 45]].map(([start, end]) => (
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
              onClick={() => toggleSection(s)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedSections.includes(s)
                  ? "bg-coral text-white"
                  : "bg-white border border-alto hover:border-coral"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {selectedSections.length > 0 && (
          <p className="mt-2 text-sm text-nobel">
            選択中: {selectedSections.length}セクション ({total}問から出題可能)
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">出題数</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={Math.max(total, 1)}
            value={Math.min(questionCount, total || 1)}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="flex-1 accent-coral"
            disabled={total === 0}
          />
          <input
            type="number"
            min={1}
            max={total}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-20 px-3 py-2 border border-alto rounded text-center focus:outline-none focus:ring-2 focus:ring-coral"
            disabled={total === 0}
          />
          <span className="text-sm text-nobel">問</span>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={selectedSections.length === 0}
        className="w-full py-3 bg-coral text-white rounded-lg font-semibold text-lg hover:bg-coral-hover disabled:bg-alto disabled:cursor-not-allowed transition-colors"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("section");

  // Section test state
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  // Review test state
  const [reviewSections, setReviewSections] = useState<number[]>([]);
  const [reviewCount, setReviewCount] = useState(20);

  // Translation test state
  const [transSections, setTransSections] = useState<number[]>([]);
  const [transCount, setTransCount] = useState(10);

  const startSectionTest = () => {
    if (selectedSection === null) return;
    const count = getSectionCount(selectedSection);
    const params = new URLSearchParams({
      sections: String(selectedSection),
      count: String(count),
      mode: "english",
      testType: "セクションテスト",
    });
    router.push(`/quiz?${params.toString()}`);
  };

  const startMultiTest = (sects: number[], count: number, quizMode: string, testType: string) => {
    if (sects.length === 0) return;
    const total = sects.reduce((sum, s) => sum + getSectionCount(s), 0);
    const params = new URLSearchParams({
      sections: sects.sort((a, b) => a - b).join(","),
      count: String(Math.min(count, total)),
      mode: quizMode,
      testType,
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

      {mode === "section" && (
        <div className="space-y-6">
          <p className="text-sm text-nobel">
            日本語 → 英文を入力。1セクションの全問が出題されます。
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
              <span className="font-semibold">Section {selectedSection}</span>
              <span className="text-nobel ml-2">
                — {getSectionCount(selectedSection)}問すべて出題
              </span>
            </div>
          )}

          <button
            onClick={startSectionTest}
            disabled={selectedSection === null}
            className="w-full py-3 bg-coral text-white rounded-lg font-semibold text-lg hover:bg-coral-hover disabled:bg-alto disabled:cursor-not-allowed transition-colors"
          >
            テスト開始
          </button>
        </div>
      )}

      {mode === "review" && (
        <MultiSectionSelector
          selectedSections={reviewSections}
          setSelectedSections={setReviewSections}
          questionCount={reviewCount}
          setQuestionCount={setReviewCount}
          buttonLabel="レビューテスト開始"
          description="複数セクションから出題数を指定してテスト（日本語 → 英文）。"
          onStart={() => startMultiTest(reviewSections, reviewCount, "english", "レビューテスト")}
        />
      )}

      {mode === "translation" && (
        <MultiSectionSelector
          selectedSections={transSections}
          setSelectedSections={setTransSections}
          questionCount={transCount}
          setQuestionCount={setTransCount}
          buttonLabel="和訳テスト開始"
          description="英文 → 日本語訳を入力。意味が合っていればOKです。"
          onStart={() => startMultiTest(transSections, transCount, "translation", "和訳テスト")}
        />
      )}
    </div>
  );
}
