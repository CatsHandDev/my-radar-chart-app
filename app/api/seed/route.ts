import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

// ★ ローカルのデータファイルをインポート
import { userMasterData } from '../../data/confidentialData';

export async function POST() {
  try {
    console.log("Seeding database...");

    // WriteBatch を使うと、複数の書き込みを一つのトランザクションとして実行できる
    // 途中でエラーが発生した場合、全ての書き込みがキャンセルされる
    const batch = writeBatch(db);

    // 1. userMasterData をループして、users コレクションに書き込む
    for (const user of userMasterData) {
      // users コレクションへの参照を作成
      const userRef = doc(db, 'users', user.userId);

      // ★ 1. パスワードをハッシュ化
      const salt = await bcrypt.genSalt(10); // ソルトを生成
      const passwordHash = await bcrypt.hash(user.password_plain, salt);

      // ★ 2. 書き込むデータに userName と passwordHash を含める
      const userDataToWrite = {
        userName: user.userName,
        passwordHash: passwordHash, // ★ ハッシュ化したパスワード
        swot: user.swot || {},
        confidential: user.confidential || {},
      };
      batch.set(userRef, userDataToWrite);

      // 2. 各ユーザーの items を、サブコレクション radar_items に書き込む
      if (user.items && user.items.length > 0) {
        for (const item of user.items) {
          // radar_items サブコレクションへの参照を作成 (IDは自動生成)
          const itemRef = doc(collection(db, 'users', user.userId, 'radar_items'));

          // id (フロントエンド用) 以外のデータを準備
          const itemData = {
            label: item.label,
            value: item.value,
            maxValue: item.maxValue,
          };
          batch.set(itemRef, itemData);
        }
      }
    }

    // 3. 全ての書き込み操作を一度に実行
    await batch.commit();

    console.log("Database seeded successfully!");
    return NextResponse.json({ message: 'データベースの初期化に成功しました。' }, { status: 200 });

  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json({ error: 'データベースの初期化中にエラーが発生しました。' }, { status: 500 });
  }
}