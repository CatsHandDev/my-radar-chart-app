import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    // 1. 環境変数から認証情報を取得
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceAccountEmail || !privateKey) {
      throw new Error('Google Sheets APIの認証情報が設定されていません。');
    }

    // 2. Google APIの認証クライアントを作成
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 3. スプレッドシートからデータを取得
    const spreadsheetId = '1oI1b3LU6Lilm1ab1Du0WhSKYM0d0VCy8gT6_-_ggVss';
    const range = '利用者データ記入!B3:F'; // B3からF列の最後まで

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // 4. 取得したデータをJSON形式に整形
    const header = ['date', 'userName', 'taskName', 'quantity', 'minutes'];
    const formattedData = rows.map((row, index) => {
      let rowData: { [key: string]: any } = { id: index }; // DataGrid用にidを付与
      header.forEach((key, i) => {
        rowData[key] = row[i];
      });
      return rowData;
    });

    return NextResponse.json({ data: formattedData }, { status: 200 });

  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json({ error: `スプレッドシートからのデータ取得に失敗しました: ${errorMessage}` }, { status: 500 });
  }
}