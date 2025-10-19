"use client";

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { userMasterData } from './data/confidentialData';

// --- 型定義 ---
import { UserDataset, ChartItem, NewWorkLog } from './types';

// --- Firebase & データ ---
import { db, userConverter, itemConverter } from './lib/firebase';
import { doc, collection, setDoc, addDoc, deleteDoc, Timestamp, serverTimestamp } from "firebase/firestore";

// --- コンポーネント ---
import SettingsPanel from './components/SettingsPanel';
import AnalysisPanel from './components/AnalysisPanel';
import TabPanel from './components/TabPanel';
import Sidebar from './components/Sidebar';
import ConfidentialPanel from './components/ConfidentialPanel';
import WorkLogPanel from './components/WorkLogPanel';

// --- スタイル ---
import styles from './page.module.scss';

const drawerWidth = 240;

export default function Home() {
  // --- 状態管理 (State) ---
  const [dataset, setDataset] = useState<UserDataset | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // ページが読み込まれた後に一度だけセッションストレージを確認
    const adminStatus = sessionStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // 1. データベースから取得したと仮定する、全ユーザーのリストをstateとして管理
  //    (将来的には useEffect 内の fetchUsers で更新される)
  const [allUsers, setAllUsers] = useState<UserDataset[]>([]);

  useEffect(() => {
    // データを非同期で取得するロジック（現在はローカルから）
    setAllUsers(userMasterData);
  }, []);

  // 2. handleFetchData を、パスワードも検証するように修正
  const handleFetchData = (userId: string, password?: string) => {
    const userData = allUsers.find(user => user.userId === userId);

    if (userData) {
      // ここでパスワードを検証する（将来的にはバックエンドで）
      // 今回は仮として、全てのユーザーのパスワードを 'password' とする
      if (password === 'password') {
        setDataset(userData);
        // 管理者判定（userIdが'admin'なら、など）
        setIsAdmin(userId === 'admin-01');
      } else {
        alert('パスワードが違います。');
      }
    } else {
      alert('ユーザーが見つかりません');
    }
  };

  // --- データ更新 (Update) ---
  const updateDatasetInStateAndDb = async (updatedDataset: UserDataset) => {
    setDataset(updatedDataset); // まずUIを即時更新
    const { ...userData } = updatedDataset;
    const userDocRef = doc(db, 'users', updatedDataset.userId).withConverter(userConverter);
    await setDoc(userDocRef, userData, { merge: true }); // merge: trueでフィールドを上書き
  };

  const handleItemChange = (itemId: string, field: 'label' | 'value', value: string | number) => {
    if (!dataset) return;
    const newItems = dataset.items.map(item => item.id === itemId ? { ...item, [field]: value } : item);
    updateDatasetInStateAndDb({ ...dataset, items: newItems });
    // Firestoreのサブコレクションも更新
    const itemDocRef = doc(db, 'users', dataset.userId, 'radar_items', itemId);
    setDoc(itemDocRef, { [field]: value }, { merge: true });
  };

  const handleSwotChange = (field: 'opportunities' | 'threats', value: string) => {
    if (!dataset) return;
    const newSwot = { ...dataset.swot, [field]: value };
    updateDatasetInStateAndDb({ ...dataset, swot: newSwot });
  };

  const handleUserPropertyChange = (
    property: 'userName' | 'disabilityType' | 'characteristics' | 'considerations',
    value: string | string[]
  ) => {
    if (!dataset) return;

    // setDataset を使って、単一の dataset state を更新する
    setDataset(prev => {
      if (!prev) return null;

      // 新しいデータセットのコピーを作成
      const newDataset = { ...prev };

      // 更新対象のプロパティに応じて、適切な場所の値を更新
      if (property === 'userName') {
        newDataset.userName = value as string;
      } else {
        // confidential オブジェクトが存在しない場合も考慮
        const confidential = newDataset.confidential || {};
        newDataset.confidential = { ...confidential, [property]: value };
      }
      return newDataset;
    });
  };

  // --- データ作成 (Create) ---
  const handleAddItem = async () => {
    if (!dataset) return;
    const newItem: Omit<ChartItem, 'id'> = { label: '新規項目', value: 0, maxValue: 100 };
    const itemsCollectionRef = collection(db, 'users', dataset.userId, 'radar_items').withConverter(itemConverter);
    const newDocRef = await addDoc(itemsCollectionRef, newItem);
    setDataset(prev => prev ? { ...prev, items: [...prev.items, { id: newDocRef.id, ...newItem }] } : null);
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
  const handleRemoveItem = async (itemId: string) => {
    if (!dataset) return;
    setDataset(prev => prev ? { ...prev, items: prev.items.filter(item => item.id !== itemId) } : null);
    const itemDocRef = doc(db, 'users', dataset.userId, 'radar_items', itemId);
    await deleteDoc(itemDocRef);
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