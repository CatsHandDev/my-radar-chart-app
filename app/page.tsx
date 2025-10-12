"use client";

import React, { useState, useMemo } from 'react';
import { UserDataset } from './types';
import SettingsPanel from './components/SettingsPanel';
import AnalysisPanel from './components/AnalysisPanel';
import TabPanel from './components/TabPanel';
import styles from './page.module.scss';
import { templates } from './data/initialData';
import { userMasterData } from './data/confidentialData';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import ConfidentialPanel from './components/ConfidentialPanel';
import { useAuth } from './hooks/useAuth';

const drawerWidth = 240;

export default function Home() {
  // --- 状態管理 (State) ---
  const { isAdmin } = useAuth();
  const [datasets, setDatasets] = useState<UserDataset[]>(userMasterData);
  const [currentUserId, setCurrentUserId] = useState<string>(userMasterData[0]?.userId || '');
  const [activeTab, setActiveTab] = useState(0);

  const currentUser = useMemo(() =>
    datasets.find(d => d.userId === currentUserId),
    [datasets, currentUserId]
  );

  // --- 派生状態 ---
  const currentItems = useMemo(() =>
    datasets.find(d => d.userId === currentUserId)?.items || [],
    [datasets, currentUserId]
  );

  // --- ハンドラ群 ---
    const handleUserChange = (newUserId: string) => {
    setCurrentUserId(newUserId);
  };

  const handleAddNewUser = (userName: string) => {
    const newUserId = `user-${Date.now()}`;
    const newUser: UserDataset = {
      userId: newUserId,
      userName: userName || `新規ユーザー ${datasets.length + 1}`,
      items: [],
    };
    setDatasets(prev => [...prev, newUser]);
    setCurrentUserId(newUserId);
  };

  const handleDeleteUser = (userIdToDelete: string) => {
    const remainingDatasets = datasets.filter(d => d.userId !== userIdToDelete);
    if (remainingDatasets.length > 0) {
      setDatasets(remainingDatasets);
      if (currentUserId === userIdToDelete) {
        setCurrentUserId(remainingDatasets[0].userId);
      }
    } else {
      // 全てのデータが削除された場合、新しい空のデータセットを作成する
      const newUserId = `user-${Date.now()}`;
      const newEmptyUser: UserDataset = {
        userId: newUserId,
        userName: '新しいデータ', // デフォルト名
        items: [], // 空の項目リスト
        // swot や confidential も必要に応じて初期化
        swot: { opportunities: '', threats: '' },
        confidential: { disabilityType: [], characteristics: [], considerations: '' },
      };
      setDatasets([newEmptyUser]);
      setCurrentUserId(newEmptyUser.userId);
    }
  };

  const handleItemChange = (itemId: number, field: 'label' | 'value', value: string | number) => {
    setDatasets(prev => prev.map(d => d.userId === currentUserId ? { ...d, items: d.items.map(item => item.id === itemId ? { ...item, [field]: value } : item) } : d));
  };

  const handleAddItem = () => {
    setDatasets(prev =>
      prev.map(d =>
        d.userId === currentUserId
          ? { ...d, items: [...d.items, { id: Date.now(), label: '新規項目', value: 0, maxValue: 100 }] }
          : d
      )
    );
  };

  const handleRemoveItem = (itemId: number) => {
    setDatasets(prev =>
      prev.map(d =>
        d.userId === currentUserId
          ? { ...d, items: d.items.filter(item => item.id !== itemId) }
          : d
      )
    );
  };

  const handleLoadTemplate = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.templateId === templateId);
    if (!selectedTemplate) return;

    const newUserId = `user-${Date.now()}`;
    const newUserDataset: UserDataset = {
      userId: newUserId,
      // ★ 新しいユーザーの名前を「(テンプレート名)のコピー」のようにする
      userName: `${selectedTemplate.templateName} `,
      // テンプレートの項目をコピーしつつ、各項目に新しいユニークIDを付与
      items: selectedTemplate.items.map(item => ({
        ...item,
        id: Date.now() + Math.random(),
      })),
      // swotやconfidentialは空の状態で初期化
      swot: { opportunities: '', threats: '' },
      confidential: { disabilityType: [], characteristics: [], considerations: '' },
    };

    setDatasets(prev => [...prev, newUserDataset]);
    setCurrentUserId(newUserId);
  };

  // handleTabChange は onTabChange としてSidebarに渡す
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleUserPropertyChange = (property: 'userName' | 'considerations', value: string) => {
    setDatasets(prev =>
      prev.map(d => {
        if (d.userId === currentUserId) {
          if (property === 'userName') {
            return { ...d, userName: value };
          }
          if (property === 'considerations') {
            return { ...d, confidential: { ...d.confidential, considerations: value } };
          }
        }
        return d;
      })
    );
  };

  const handleSwotChange = (field: 'opportunities' | 'threats', value: string) => {
    setDatasets(prev =>
      prev.map(d => {
        // 現在のユーザーのデータセットであるかを判定
        if (d.userId === currentUserId) {
          // 正しい構文で、swotオブジェクトを更新して新しいデータセットを返す
          return {
            ...d,
            swot: {
              ...d.swot, // 既存のswotの値を維持
              [field]: value, // 指定されたフィールド（opportunities または threats）を新しい値で更新
            },
          };
        }
        // 他のユーザーのデータセットはそのまま返す
        return d;
      })
    );
  };

  const handleConsiderationsChange = (userId: string, value: string) => {
    setDatasets(prev => prev.map(d => d.userId === userId ? { ...d, confidential: { ...d.confidential, considerations: value } } : d));
  };

  const handleDisabilityTypeChange = (userId: string, value: string[]) => {
    setDatasets(prev => prev.map(d => d.userId === userId ? { ...d, confidential: { ...d.confidential, disabilityType: value } } : d));
  };

  const handleCharacteristicsChange = (userId: string, value: string[]) => {
    setDatasets(prev => prev.map(d => d.userId === userId ? { ...d, confidential: { ...d.confidential, characteristics: value } } : d));
  };

  // --- レンダリング ---
  return (
    <main className={styles.mainContainer}>
      {/* <header className={styles.header}>
        <h1>レーダーチャート SWOT分析 & AIアドバイス</h1>
      </header> */}

      <Sidebar
        drawerWidth={drawerWidth}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          // サイドバーの幅と同じだけ左にマージンを設定し、
          // コンテンツの開始位置を右にずらす
          marginLeft: `${drawerWidth}px`,
        }}
      >
        <TabPanel value={activeTab} index={0}>
          <SettingsPanel
          datasets={datasets}
          currentUserId={currentUserId}
          onUserChange={handleUserChange}
          onAddNewUser={handleAddNewUser}
          onDeleteUser={handleDeleteUser}
          items={currentItems}
          onItemChange={handleItemChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onLoadTemplate={handleLoadTemplate}
          templates={templates}
          onUserPropertyChange={handleUserPropertyChange}
        />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <AnalysisPanel
            dataset={currentUser || null}
            onSwotChange={handleSwotChange}
          />
        </TabPanel>
        {isAdmin && (
          <TabPanel value={activeTab} index={2}>
            <ConfidentialPanel
              datasets={datasets}
              currentGlobalUserId={currentUserId}
              onConsiderationsChange={handleConsiderationsChange}
              onDisabilityTypeChange={handleDisabilityTypeChange}
              onCharacteristicsChange={handleCharacteristicsChange}
            />
          </TabPanel>
        )}
      </Box>
    </main>
  );
}