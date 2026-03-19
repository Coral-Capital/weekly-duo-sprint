import { NextResponse } from "next/server";
import { gradeAnswer, type GradeResult } from "@/lib/grading";

type QuestionInput = {
  id: number;
  section: number;
  jp: string;
  correctAnswer: string;
  userAnswer: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const questions: QuestionInput[] = body.questions;

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

    return NextResponse.json({
      results,
      totalScore,
      totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
