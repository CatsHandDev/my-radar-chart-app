import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json();
    if (!userId || !password) {
      return NextResponse.json({ error: 'ユーザーIDとパスワードが必要です' }, { status: 400 });
    }

    // 1. Firestoreからユーザーデータを取得
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    // 1. ユーザーが存在しない、またはパスワードハッシュが保存されていない場合
    if (!userDocSnap.exists() || !userDocSnap.data().passwordHash) {
      // 即座にエラーを返すのではなく、bcrypt.compareでわざと時間をかける
      // これにより、ユーザーが存在しない場合でも、存在する場合と同じくらいの時間がかかり、
      // ユーザーIDの存在を推測されにくくする（タイミング攻撃への対策）
      await bcrypt.compare(password, `$2a$10$invalidhashplaceholder`); // ダミーのハッシュと比較

      // 曖昧なエラーメッセージを返す
      return NextResponse.json(
        { success: false, error: 'ユーザーIDまたはパスワードが違います。' },
        { status: 401 } // 404ではなく、認証失敗を示す401を返す
      );
    }

    // 2. ユーザーが存在する場合
    const userData = userDocSnap.data();
    const storedHash = userData.passwordHash;
    
    // パスワードを比較
    const passwordMatch = await bcrypt.compare(password, storedHash);

    if (passwordMatch) {
      // 認証成功 (この部分は変更なし)
      const { passwordHash, ...userWithoutPassword } = userData;
      return NextResponse.json({
        success: true,
        user: { userId: userDocSnap.id, ...userWithoutPassword },
      }, { status: 200 });
    } else {
      // パスワードが不一致の場合も、同じ曖昧なエラーメッセージを返す
      return NextResponse.json(
        { success: false, error: 'ユーザーIDまたはパスワードが違います。' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: 'ログイン処理中にエラーが発生しました' }, { status: 500 });
  }
}