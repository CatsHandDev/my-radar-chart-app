import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateCounselingPrompt } from '../../prompts/counselingPrompt';

// ★ 1. APIキーがそもそも存在するかチェック
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in .env.local");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
  // ★ 2. tryブロックを細分化して、どこでエラーが起きるか分かりやすくする
  try {
    const body = await request.json();

    const promptData = {
      borderType: body.borderType,
      strengths: body.strengths,
      weaknesses: body.weaknesses,
      opportunities: body.opportunities,
      threats: body.threats,
      confidential: {
        disabilityType: body.confidential?.disabilityType || '情報なし',
        characteristics: body.confidential?.characteristics || [],
        considerations: body.confidential?.considerations || '特になし',
      }
    };

    // 2. 外部化した関数を呼び出して、プロンプトを生成する
    const prompt = generateCounselingPrompt(promptData);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ advice: text });

  } catch (error) {
    // ★ 4. エラーの詳細をサーバーのコンソールに出力
    console.error("Error in /api/analyze:", error);

    // エラーメッセージをフロントエンドに返す
    return NextResponse.json(
      { error: 'AIによる分析中にサーバーでエラーが発生しました。' },
      { status: 500 }
    );
  }
}