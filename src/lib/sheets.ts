import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_NAME = "テスト結果";

// Coral brand colors as RGB floats (0-1)
const CORAL = { red: 1, green: 0.478, blue: 0.349 };       // #FF7A59
const NIGHT_RIDER = { red: 0.2, green: 0.2, blue: 0.2 };   // #333333
const SAND = { red: 0.929, green: 0.902, blue: 0.867 };     // #EDE6DD
const WHITE = { red: 1, green: 1, blue: 1 };

function getAuth() {
  const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!, "base64").toString("utf-8");
  const json = JSON.parse(decoded);

  return new google.auth.JWT({
    email: json.client_email,
    key: json.private_key,
    scopes: SCOPES,
  });
}

async function ensureSheet(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string) {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = res.data.sheets?.find((s) => s.properties?.title === SHEET_NAME);

  if (existing) return;

  // Create sheet
  const addRes = await sheets.spreadsheets.batchUpdate({
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

  const sheetId = addRes.data.replies?.[0]?.addSheet?.properties?.sheetId;

  // Add header row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:H1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [["日時", "メール", "名前", "テスト種別", "セクション", "得点", "問題数", "正答率"]],
    },
  });

  // Apply Coral brand formatting
  if (sheetId !== undefined && sheetId !== null) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Header row: Coral text + Sand background + Bold
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: SAND,
                  textFormat: {
                    foregroundColor: CORAL,
                    bold: true,
                    fontFamily: "Inter",
                    fontSize: 11,
                  },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
          // All data rows: Night Rider text + White background
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 1, endRowIndex: 1000 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: WHITE,
                  textFormat: {
                    foregroundColor: NIGHT_RIDER,
                    fontFamily: "Inter",
                    fontSize: 10,
                  },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
          // Freeze header row
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: { frozenRowCount: 1 },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
          // Auto-resize columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 8,
              },
            },
          },
        ],
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
  testType?: string;
}) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  await ensureSheet(sheets, spreadsheetId);

  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const testType = data.testType ?? (data.sections.length === 1 ? "セクションテスト" : "レビューテスト");
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
