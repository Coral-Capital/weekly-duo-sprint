import { NextResponse } from "next/server";
import { gradeAnswer, type GradeResult } from "@/lib/grading";
import { appendResult } from "@/lib/sheets";
import { auth } from "@/lib/auth";

type QuestionInput = {
  id: number;
  section: number;
  jp: string;
  correctAnswer: string;
  userAnswer: string;
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const questions: QuestionInput[] = body.questions;
    const testType: string = body.testType ?? "セクションテスト";

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const results: (GradeResult & { id: number; section: number; jp: string })[] =
      questions.map((q) => {
        const grade = gradeAnswer(q.userAnswer, q.correctAnswer);
        return {
          ...grade,
          id: q.id,
          section: q.section,
          jp: q.jp,
        };
      });

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalQuestions = results.length;
    const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    const sections = [...new Set(questions.map((q) => q.section))].sort((a, b) => a - b);

    // Write to Google Sheets (non-blocking)
    appendResult({
      email: session?.user?.email ?? "unknown",
      name: session?.user?.name ?? "unknown",
      sections,
      totalScore,
      totalQuestions,
      percentage,
      testType,
    }).catch((err) => {
      console.error("Failed to write to Google Sheets:", err?.message || err);
    });

    return NextResponse.json({
      results,
      totalScore,
      totalQuestions,
      percentage,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
