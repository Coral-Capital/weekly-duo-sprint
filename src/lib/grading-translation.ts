import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export type TranslationGradeResult = {
  score: number; // 0 or 1
  status: "correct" | "wrong";
  userAnswer: string;
  correctAnswer: string;
  feedback: string;
};

export async function gradeTranslation(
  userAnswer: string,
  correctAnswer: string,
  englishOriginal: string
): Promise<TranslationGradeResult> {
  const base = { userAnswer, correctAnswer };

  if (!userAnswer.trim()) {
    return { ...base, score: 0, status: "wrong", feedback: "未回答" };
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `英文とその模範和訳、そして生徒の和訳が与えられます。生徒の和訳が英文の意味を概ねとらえているか判定してください。
細かい表現の違いは許容します。意味が大きくずれていたり、重要な情報が抜けている場合のみ不正解とします。

英文: ${englishOriginal}
模範和訳: ${correctAnswer}
生徒の和訳: ${userAnswer}

以下のJSON形式のみで回答してください。他のテキストは不要です。
{"pass": true/false, "feedback": "一言フィードバック（日本語）"}`,
      },
    ],
  });

  try {
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const json = JSON.parse(text);
    return {
      ...base,
      score: json.pass ? 1 : 0,
      status: json.pass ? "correct" : "wrong",
      feedback: json.feedback || "",
    };
  } catch {
    // Fallback: if JSON parse fails, assume wrong
    return { ...base, score: 0, status: "wrong", feedback: "採点エラー" };
  }
}
