"use client";

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { UserDataset, ChartItem } from './types';
import { db, userConverter, itemConverter } from './lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";

import Sidebar from './components/Sidebar';
import TabPanel from './components/TabPanel';
import AnalysisPanel from './components/AnalysisPanel';
import DataGridPanel from './components/DataGridPanel';
import AdminPanel from './components/AdminPanel';
import { useAuth } from '../hooks/useAuth';

const drawerWidth = 240;

export default function Home() {
  const [allUsers, setAllUsers] = useState<UserDataset[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [transientChartData, setTransientChartData] = useState<ChartItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, setIsAdmin } = useAuth();

  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsLoading(true);
      try {
        const usersCollectionRef = collection(db, "users").withConverter(userConverter);
        const querySnapshot = await getDocs(usersCollectionRef);
        const usersData = querySnapshot.docs.map(doc => doc.data());

        for (const user of usersData) {
          const itemsCollectionRef = collection(db, "users", user.userId, "radar_items").withConverter(itemConverter);
          const itemsSnapshot = await getDocs(itemsCollectionRef);
          user.items = itemsSnapshot.docs.map(doc => doc.data());
        }
        setAllUsers(usersData);
      } catch (error) {
        console.error("Error fetching all users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    if (index !== 0) {
      setTransientChartData(null);
    }
  };

  const handleNavigateToAnalysis = (chartData: ChartItem[]) => {
    setTransientChartData(chartData);
    setActiveTab(0);
  };

  const handleUpdateUserConfidential = async (userId: string, newConfidential: UserDataset['confidential']) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { confidential: newConfidential });
      
      // フロントエンドの状態も更新
      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.userId === userId ? { ...user, confidential: newConfidential } : user
        )
      );
      alert("利用者情報を更新しました。");
    } catch (error) {
      console.error("Failed to update user confidential data:", error);
      alert("情報の更新に失敗しました。");
    }
  };

  // ログアウトハンドラを定義
  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    setIsAdmin(false);
    // 必要であればページをリロード
    window.location.reload();
  };

  // ログイン状態を計算
  //    ここでは仮に「管理者としてログインしているか」をログイン状態とする
  const isLoggedIn = isAdmin;

  if (isLoading) {
    return <Box sx={{ p: 3 }}>全ユーザーデータを読み込み中...</Box>;
  }

  return (
    <main>
      <Sidebar
        drawerWidth={drawerWidth}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: `${drawerWidth}px` }}>
        <TabPanel value={activeTab} index={0}>
          <AnalysisPanel
            initialChartData={transientChartData}
            allUsers={allUsers}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <DataGridPanel
            allUsers={allUsers}
            onNavigateToAnalysis={handleNavigateToAnalysis}
          />
        </TabPanel>
        {isAdmin && (
          <TabPanel value={activeTab} index={2}>
            <AdminPanel
              allUsers={allUsers}
              onUpdateUser={handleUpdateUserConfidential}
            />
          </TabPanel>
        )}
      </Box>
    </main>
  );
}