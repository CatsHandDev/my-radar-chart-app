import { initializeApp, getApps } from "firebase/app";
import { getFirestore, FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { UserDataset, ChartItem } from '../types';

// Firebaseプロジェクトの設定情報
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// アプリが既に初期化されていないかチェック
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Firestoreのインスタンスを取得
const db = getFirestore(app);

export { db };

// 1. UserDataset 用のコンバーター
export const userConverter: FirestoreDataConverter<UserDataset> = {
  // UserDataset -> Firestoreドキュメント への変換
  toFirestore: (user: UserDataset): DocumentData => {
    // items はサブコレクションで管理するため、ここでは含めない
    return {
      userName: user.userName,
      confidential: user.confidential,
      swot: user.swot,
    };
  },
  // Firestoreドキュメント -> UserDataset への変換
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserDataset => {
    const data = snapshot.data(options);
    return {
      userId: snapshot.id,
      userName: data.userName,
      confidential: data.confidential,
      swot: data.swot,
      items: [], // items は後でサブコレクションから取得する
    };
  }
};

// 2. ChartItem 用のコンバーター
export const itemConverter: FirestoreDataConverter<ChartItem> = {
  toFirestore: (item: ChartItem): DocumentData => {
    // id はドキュメントIDとして使うので、ここでは含めない
    return {
      label: item.label,
      value: item.value,
      maxValue: item.maxValue,
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ChartItem => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id, // ドキュメントIDをidとして使う
      label: data.label,
      value: data.value,
      maxValue: data.maxValue,
    };
  }
};

