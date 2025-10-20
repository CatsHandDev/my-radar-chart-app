"use client";

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { userMasterData } from './data/confidentialData';

// --- 型定義 ---
import { UserDataset, ChartItem, NewWorkLog } from './types';

// --- Firebase & データ ---
import { db, userConverter, itemConverter } from './lib/firebase';
import { doc, collection, setDoc, addDoc, deleteDoc, Timestamp, serverTimestamp, getDocs } from "firebase/firestore";

// --- コンポーネント ---
import SettingsPanel from './components/SettingsPanel';
import AnalysisPanel from './components/AnalysisPanel';
import TabPanel from './components/TabPanel';
import Sidebar from './components/Sidebar';
import ConfidentialPanel from './components/ConfidentialPanel';
import WorkLogPanel from './components/WorkLogPanel';
import { v4 as uuidv4 } from 'uuid';


// --- スタイル ---
import styles from './page.module.scss';

const drawerWidth = 240;

// ゲストユーザー用の空のデータ構造を定義
const createGuestDataset = (): UserDataset => ({
  userId: 'guest',
  userName: 'ゲスト',
  items: [
    // 最初からいくつかの項目を入れておくと親切
    { id: uuidv4(), label: '項目1', value: 0, maxValue: 100 },
    { id: uuidv4(), label: '項目2', value: 0, maxValue: 100 },
    { id: uuidv4(), label: '項目3', value: 0, maxValue: 100 },
  ],
  swot: { opportunities: '', threats: '' },
  confidential: {}, // ゲストは機密情報を持たない
});

export default function Home() {
  // --- 状態管理 (State) ---
  const [dataset, setDataset] = useState<UserDataset>(createGuestDataset());
  const [activeTab, setActiveTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<UserDataset[]>([]);

  useEffect(() => {
    // ページが読み込まれた後に一度だけセッションストレージを確認
    const adminStatus = sessionStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    // データを非同期で取得するロジック（現在はローカルから）
    setAllUsers(userMasterData);
  }, []);

  // 2. handleFetchData を、パスワードも検証するように修正
  const handleFetchData = async (userId: string, password?: string) => {
    if (!userId || !password) {
      alert('ユーザーIDとパスワードを選択・入力してください。');
      return;
    }
    setIsLoading(true);
    setIsAdmin(false);

    try {
      // ★ 認証APIを呼び出す
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ログインに失敗しました');
      }

      // 認証成功
      const userData = data.user;
      
      // ★ サブコレクションのitemsを取得する処理は維持
      const itemsCollectionRef = collection(db, 'users', userId, 'radar_items').withConverter(itemConverter);
      const itemsSnapshot = await getDocs(itemsCollectionRef);
      userData.items = itemsSnapshot.docs.map(doc => doc.data());
      
      setDataset(userData);
      // ★ 役割(role)で管理者判定
      setIsAdmin(userData.confidential?.role === 'admin');
      
    } catch (error) {
      console.error("Login failed:", error);
      
      let errorMessage = 'ログイン処理中に予期しないエラーが発生しました。';
      if (error instanceof Error) {
        errorMessage = error.message; // APIからのメッセージ ("ユーザーIDまたはパスワードが違います。") を使う
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト機能を追加
  const handleLogout = () => {
    setDataset(createGuestDataset());
    setIsAdmin(false);
    // sessionStorage もクリア
    sessionStorage.removeItem('isAdmin');
  };

  // --- データ更新 (Update) ---
  const updateDatasetInStateAndDb = async (updatedDataset: UserDataset) => {
    setDataset(updatedDataset); // UIは即時更新

    // ログインしているユーザーの場合のみ、DBに書き込む
    if (updatedDataset.userId !== 'guest') {
      const { items, ...userData } = updatedDataset;
      const userDocRef = doc(db, 'users', updatedDataset.userId).withConverter(userConverter);
      await setDoc(userDocRef, userData, { merge: true });
    }
  };

  const handleItemChange = (itemId: string, field: 'label' | 'value', value: string | number) => {
    // datasetがnullになることはないので、 if (!dataset) return; は不要
    setDataset(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
    }));
  };

  const handleSwotChange = (field: 'opportunities' | 'threats', value: string) => {
    setDataset(prev => ({
      ...prev,
      swot: { ...prev.swot, [field]: value }
    }));
  };

  const handleUserPropertyChange = (
    property: 'userName' | 'disabilityType' | 'characteristics' | 'considerations',
    value: string | string[]
  ) => {
    setDataset(prev => {
      const newDataset = { ...prev };
      if (property === 'userName') {
        newDataset.userName = value as string;
      } else {
        const confidential = newDataset.confidential || {};
        newDataset.confidential = { ...confidential, [property]: value };
      }
      return newDataset;
    });
  };

  // --- データ作成 (Create) ---
  const handleAddItem = () => {
    const newItem: ChartItem = {
      id: uuidv4(),
      label: '新規項目',
      value: 0,
      maxValue: 100
    };
    setDataset(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRecordLog = async (logData: Omit<NewWorkLog, 'userId'>) => {
    if (!dataset) return;
    try {
      const logsCollectionRef = collection(db, 'users', dataset.userId, 'work_logs');

      await addDoc(logsCollectionRef, {
        // ...logData のプロパティを展開
        itemId: logData.itemId,
        quantity: logData.quantity,
        breakDuration: logData.breakDuration,
        workMinutes: logData.workMinutes,

        // userIdを追加
        userId: dataset.userId,

        // DateオブジェクトをTimestampに変換
        startTime: Timestamp.fromDate(logData.startTime),
        endTime: Timestamp.fromDate(logData.endTime),

        // サーバータイムスタンプを追加
        createdAt: serverTimestamp(),
      });

      alert("記録を保存しました。");
    } catch (error) {
      console.error("記録の保存に失敗:", error);
    }
  };

  // --- データ削除 (Delete) ---
  const handleRemoveItem = (itemId: string) => {
    setDataset(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // --- ナビゲーション ---
  const handleTabChange = (index: number) => setActiveTab(index);
  const navigateToAnalysis = () => setActiveTab(1);

  // --- レンダリング ---
  return (
    <main className={styles.mainContainer}>
      <Sidebar
        drawerWidth={drawerWidth}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        isLoggedIn={dataset.userId !== 'guest'}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: `${drawerWidth}px` }}>
        <TabPanel value={activeTab} index={0}>
          <SettingsPanel
            allUsers={allUsers}
            dataset={dataset}
            items={dataset?.items || []}
            onItemChange={handleItemChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onFetchData={handleFetchData}
            onNavigateToAnalysis={navigateToAnalysis}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          {dataset ? <AnalysisPanel dataset={dataset} onSwotChange={handleSwotChange} /> : <p>データを読み込んでください</p>}
        </TabPanel>

        {/* 作業記録タブ */}
        <TabPanel value={activeTab} index={2}>
            {dataset ? <WorkLogPanel currentUser={dataset} onRecord={handleRecordLog} /> : <p>データを読み込んでください</p>}
        </TabPanel>

        {isAdmin && (
          <TabPanel value={activeTab} index={3}>
            {dataset ? (
              // ★ 3. ConfidentialPanel に渡す props を修正
              <ConfidentialPanel
                dataset={dataset}
                onUserPropertyChange={handleUserPropertyChange}
              />
            ) : (
              <p>データを読み込んでください</p>
            )}
          </TabPanel>
        )}
      </Box>
    </main>
  );
}