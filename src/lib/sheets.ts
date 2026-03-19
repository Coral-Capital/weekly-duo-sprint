import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_NAME = "テスト結果";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key,
    scopes: SCOPES,
  });
}

async function ensureSheet(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string) {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = res.data.sheets?.some((s) => s.properties?.title === SHEET_NAME);

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: SHEET_NAME },
            },
          },
        ],
      },
    });

    // Add header row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:H1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["日時", "メール", "名前", "テスト種別", "セクション", "得点", "問題数", "正答率"]],
      },
    });
  }
}

export async function appendResult(data: {
  email: string;
  name: string;
  sections: number[];
  totalScore: number;
  totalQuestions: number;
  percentage: number;
}) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  await ensureSheet(sheets, spreadsheetId);

  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const testType = data.sections.length === 1 ? "セクションテスト" : "レビューテスト";
  const sectionStr = data.sections.join(", ");

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          now,
          data.email,
          data.name,
          testType,
          sectionStr,
          data.totalScore,
          data.totalQuestions,
          `${data.percentage}%`,
        ],
      ],
    },
  });
}
