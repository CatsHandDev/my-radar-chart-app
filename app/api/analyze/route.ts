import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 環境変数からAPIキーを読み込む
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { strengths, weaknesses, opportunities, threats } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      以下のSWOT分析の結果に基づいて、プロフェッショナルな視点から具体的な改善策や戦略を3つ提案してください。

      # 強み (Strengths)
      ${strengths.length > 0 ? strengths.join(', ') : '特になし'}

      # 弱み (Weaknesses)
      ${weaknesses.length > 0 ? weaknesses.join(', ') : '特になし'}

      # 機会 (Opportunities)
      ${opportunities || '特になし'}

      # 脅威 (Threats)
      ${threats || '特になし'}

      # アドバイス:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ advice: text });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'AIによる分析中にエラーが発生しました。' }, { status: 500 });
  }
}