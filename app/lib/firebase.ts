import { initializeApp, getApps } from "firebase/app";
import { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, SnapshotOptions, getFirestore, WithFieldValue } from 'firebase/firestore';
import { ChartItem, UserDataset, WorkLog } from '../types';

// Firebaseプロジェクトの設定情報
// .env.local ファイルから読み込まれます
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// アプリが既に初期化されていないかチェックして、初期化または既存のインスタンスを取得
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// --- Firestoreデータコンバーター ---

export const userConverter: FirestoreDataConverter<UserDataset> = {
  toFirestore: (user: UserDataset): DocumentData => {
    return {
      userName: user.userName,
      confidential: user.confidential,
      swot: user.swot,
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserDataset => {
    const data = snapshot.data(options);
    return {
      userId: snapshot.id,
      userName: data.userName,
      confidential: data.confidential,
      swot: data.swot,
      items: [],
    };
  }
};

// UserDataset 用のコンバーター
export const workLogConverter: FirestoreDataConverter<WorkLog> = {
  // fromFirestoreは変更なし
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): WorkLog => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      userId: data.userId,
      itemId: data.itemId,
      quantity: data.quantity,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      breakDuration: data.breakDuration,
      workMinutes: data.workMinutes,
      createdAt: data.createdAt.toDate(),
    };
  },
  toFirestore: function (): WithFieldValue<DocumentData> {
    throw new Error("Function not implemented.");
  }
};

// 2. ChartItem 用のコンバーター
export const itemConverter: FirestoreDataConverter<ChartItem> = {
  // ChartItem オブジェクトを Firestore ドキュメントに変換する
  toFirestore: (item: ChartItem): DocumentData => {
    // id はドキュメントIDとして扱うため、フィールドには含めない
    return {
      label: item.label,
      value: item.value,
      maxValue: item.maxValue,
    };
  },
  // Firestore ドキュメントを ChartItem オブジェクトに変換する
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ChartItem => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id, // ドキュメントIDをオブジェクトのidとして使用
      label: data.label,
      value: data.value || 0, // valueが存在しない場合は0をデフォルト値とする
      maxValue: data.maxValue,
    };
  }
};

// Firestoreインスタンスをエクスポート
export { db };