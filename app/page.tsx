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
  const [items, setItems] = useState<ChartItem[]>([]);
  const [opportunities, setOpportunities] = useState<string>('');
  const [threats, setThreats] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedBorder, setSelectedBorder] = useState<BorderType>('A');
  const [activeTab, setActiveTab] = useState(0);

  // --- 派生状態 ---
  const currentBorderPercentage = BORDER_PERCENTAGES[selectedBorder];

  const templates = {
    business: [
      { id: 1, label: 'リーダーシップ', value: 0, maxValue: 100 },
      { id: 2, label: '問題解決能力', value: 0, maxValue: 100 },
      { id: 3, label: 'コミュニケーション', value: 0, maxValue: 100 },
      { id: 4, label: '計画性', value: 0, maxValue: 100 },
      { id: 5, label: '実行力', value: 0, maxValue: 100 },
    ],
    student: [
      { id: 1, label: '専門知識', value: 0, maxValue: 100 },
      { id: 2, label: '探求心', value: 0, maxValue: 100 },
      { id: 3, label: 'プレゼン能力', value: 0, maxValue: 100 },
      { id: 4, label: '協調性', value: 0, maxValue: 100 },
      { id: 5, label: '自己管理能力', value: 0, maxValue: 100 },
    ],
  };

    const handleLoadTemplate = (templateType: 'business' | 'student') => {
    // テンプレートのデータをディープコピーして、IDを現在時刻でユニークにする
    const newItems = templates[templateType].map(item => ({
      ...item,
      id: Date.now() + Math.random() // ユニークIDを生成
    }));
    setItems(newItems);
  };

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
            onLoadTemplate={handleLoadTemplate}
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