/**
 * Grading logic for DUO Sprint
 *
 * Rules:
 * - Full exact match (ignoring punctuation/case) = 1 point
 * - Spelling errors only = 0.5 points (1 - 0.5 penalty, regardless of how many misspellings)
 * - Wrong words/phrases = 0 points
 * - Ignored characters: , . ! ? " ' : ; — – ( ) 「」
 */

// Characters to strip for comparison
const PUNCTUATION_RE = /[,.\-!?;:'""\u201C\u201D\u2018\u2019()\u300C\u300D\u2014\u2013]/g;

function normalize(text: string): string {
  return text
    .replace(PUNCTUATION_RE, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tokenize(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

// Check if two words are a "spelling error" (close but not exact)
function isSpellingError(answer: string, correct: string): boolean {
  if (answer === correct) return false;
  const maxLen = Math.max(answer.length, correct.length);
  if (maxLen === 0) return false;
  const dist = levenshtein(answer, correct);
  // Allow up to ~30% of the word length as spelling error, min 1, max 3
  const threshold = Math.min(3, Math.max(1, Math.ceil(maxLen * 0.3)));
  return dist <= threshold;
}

export type GradeResult = {
  score: number; // 0, 0.5, or 1
  status: "correct" | "spelling" | "wrong";
  userAnswer: string;
  correctAnswer: string;
  details: string;
};

export function gradeAnswer(userAnswer: string, correctAnswer: string): GradeResult {
  const base = {
    userAnswer,
    correctAnswer,
  };

  // Exact match after normalization
  if (normalize(userAnswer) === normalize(correctAnswer)) {
    return { ...base, score: 1, status: "correct", details: "完全一致" };
  }

  const userTokens = tokenize(userAnswer);
  const correctTokens = tokenize(correctAnswer);

  // If word count differs significantly, it's wrong
  if (
    Math.abs(userTokens.length - correctTokens.length) >
    Math.max(2, correctTokens.length * 0.3)
  ) {
    return {
      ...base,
      score: 0,
      status: "wrong",
      details: "文の構造が大きく異なります",
    };
  }

  // Try to align words and check for spelling errors vs wrong words
  // Use a simple sequential alignment
  let hasSpellingError = false;
  let hasWrongWord = false;

  // Dynamic alignment using LCS-like approach
  const aligned = alignWords(userTokens, correctTokens);

  for (const pair of aligned) {
    if (pair.user === pair.correct) continue;
    if (pair.user === null || pair.correct === null) {
      // Missing or extra word
      hasWrongWord = true;
      break;
    }
    if (isSpellingError(pair.user, pair.correct)) {
      hasSpellingError = true;
    } else {
      hasWrongWord = true;
      break;
    }
  }

  if (hasWrongWord) {
    return {
      ...base,
      score: 0,
      status: "wrong",
      details: "使われている単語やフレーズが異なります",
    };
  }

  if (hasSpellingError) {
    return {
      ...base,
      score: 0.5,
      status: "spelling",
      details: "スペルミスがあります (-0.5点)",
    };
  }

  // Shouldn't reach here, but just in case
  return { ...base, score: 1, status: "correct", details: "完全一致" };
}

type WordPair = { user: string | null; correct: string | null };

function alignWords(userWords: string[], correctWords: string[]): WordPair[] {
  const m = userWords.length;
  const n = correctWords.length;

  // Simple case: same length, align directly
  if (m === n) {
    return userWords.map((u, i) => ({ user: u, correct: correctWords[i] }));
  }

  // Use LCS to find best alignment
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (userWords[i - 1] === correctWords[j - 1] || isSpellingError(userWords[i - 1], correctWords[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to get alignment
  const result: WordPair[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && (userWords[i - 1] === correctWords[j - 1] || isSpellingError(userWords[i - 1], correctWords[j - 1]))) {
      if (dp[i][j] === dp[i - 1][j - 1] + 1) {
        result.unshift({ user: userWords[i - 1], correct: correctWords[j - 1] });
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      result.unshift({ user: userWords[i - 1], correct: null });
      i--;
    } else {
      result.unshift({ user: null, correct: correctWords[j - 1] });
      j--;
    }
  }

  return result;
}
