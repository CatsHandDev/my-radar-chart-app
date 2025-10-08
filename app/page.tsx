"use client";

import { useState, useMemo } from 'react';
import { ChartItem } from './types';
import SettingsPanel from './components/SettingsPanel';
import AnalysisPanel from './components/AnalysisPanel';
import styles from './page.module.scss';
import TabPanel from './components/TabPanel';
import Box from '@mui/material/Box';
import { Tabs, Tab } from '@mui/material';

export type BorderType = 'A' | 'B';

export const BORDER_PERCENTAGES: Record<BorderType, number> = {
  A: 0.65,
  B: 0.45,
};

export default function Home() {
  const [items, setItems] = useState<ChartItem[]>([
    { id: 1, label: '段ボール作成', value: 85, maxValue: 180 },
    { id: 2, label: 'アタック箱詰め', value: 90, maxValue: 120 },
    { id: 3, label: '荷受け', value: 60, maxValue: 200 },
    { id: 4, label: 'ピッキング', value: 55, maxValue: 300 },
    { id: 5, label: '箱出し', value: 75, maxValue: 120 },
    { id: 6, label: '梱包', value: 75, maxValue: 120 },
  ]);
  const [opportunities, setOpportunities] = useState<string>('');
  const [threats, setThreats] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedBorder, setSelectedBorder] = useState<BorderType>('A');
  const [activeTab, setActiveTab] = useState(0);

  // --- 派生状態 ---
  const currentBorderPercentage = BORDER_PERCENTAGES[selectedBorder];

  const strengths = useMemo(() =>
    items.filter(item => (item.value / item.maxValue) >= currentBorderPercentage),
    [items, currentBorderPercentage]
  );
  const weaknesses = useMemo(() =>
    items.filter(item => (item.value / item.maxValue) < currentBorderPercentage),
    [items, currentBorderPercentage]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // --- イベントハンドラ ---
  const handleItemChange = (id: number, field: 'label' | 'value', val: string | number) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, [field]: val } : item)));
  };
  // ★ 変更点: 新規項目にもmaxValueを設定
  const addItem = () => setItems([...items, { id: Date.now(), label: `新規項目`, value: 50, maxValue: 100 }]);
  const removeItem = (id: number) => setItems(items.filter(item => item.id !== id));

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAiAdvice('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borderType: selectedBorder, // 'A' or 'B'
          strengths: strengths.map(item => item.label),
          weaknesses: weaknesses.map(item => item.label),
          opportunities,
          threats,
        }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setAiAdvice(data.advice);
    } catch (error) {
      console.error('AI分析のAPI呼び出しに失敗:', error);
      setAiAdvice('分析に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // --- レンダリング ---
  return (
    <main className={styles.mainContainer}>
      <header className={styles.header}>
        <h1>レーダーチャート SWOT分析 & アドバイス</h1>
      </header>

      <Box sx={{ width: '100%' }}>
        {/* 1. タブの切り替え部分 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="main tabs" centered>
            <Tab label="設定" id="main-tab-0" />
            <Tab label="分析結果" id="main-tab-1" />
          </Tabs>
        </Box>

        {/* 2. 「設定」タブのコンテンツ */}
        <TabPanel value={activeTab} index={0}>
          <SettingsPanel
            items={items}
            onItemChange={handleItemChange}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            selectedBorder={selectedBorder}
            onBorderChange={setSelectedBorder}
          />
        </TabPanel>

        {/* 3. 「分析結果」タブのコンテンツ */}
        <TabPanel value={activeTab} index={1}>
          <AnalysisPanel
            items={items}
            strengths={strengths}
            weaknesses={weaknesses}
            borderPercentage={currentBorderPercentage}
            borderType={selectedBorder}
            opportunities={opportunities}
            threats={threats}
            aiAdvice={aiAdvice}
            isLoading={isLoading}
            onOpportunitiesChange={setOpportunities}
            onThreatsChange={setThreats}
            onAnalyze={handleAnalyze}
          />
        </TabPanel>
      </Box>
    </main>
  );
}