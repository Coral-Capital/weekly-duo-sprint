import { NextResponse } from "next/server";
import { gradeTranslation, type TranslationGradeResult } from "@/lib/grading-translation";
import { appendResult } from "@/lib/sheets";
import { auth } from "@/lib/auth";

type QuestionInput = {
  id: number;
  section: number;
  en: string;
  correctJp: string;
  userAnswer: string;
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const questions: QuestionInput[] = body.questions;

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Grade all in parallel
    const results: (TranslationGradeResult & { id: number; section: number; en: string })[] =
      await Promise.all(
        questions.map(async (q) => {
          const grade = await gradeTranslation(q.userAnswer, q.correctJp, q.en);
          return { ...grade, id: q.id, section: q.section, en: q.en };
        })
      );

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalQuestions = results.length;
    const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    const sections = [...new Set(questions.map((q) => q.section))].sort((a, b) => a - b);

    appendResult({
      email: session?.user?.email ?? "unknown",
      name: session?.user?.name ?? "unknown",
      sections,
      totalScore,
      totalQuestions,
      percentage,
      testType: "和訳テスト",
    }).catch((err) => {
      console.error("Failed to write to Google Sheets:", err?.message || err);
      if (err?.response?.data) console.error("Sheets API details:", JSON.stringify(err.response.data));
    });

    return NextResponse.json({
      results,
      totalScore,
      totalQuestions,
      percentage,
      mode: "translation",
    });
  } catch (err) {
    console.error("Grade translation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
