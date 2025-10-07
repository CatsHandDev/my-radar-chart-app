"use client";

import { useState, useMemo } from 'react';
import { ChartItem } from './types';
import SettingsPanel from './components/SettingsPanel';
import AnalysisPanel from './components/AnalysisPanel';
import styles from './page.module.scss';

export default function Home() {
  // --- 状態管理 (State) ---
  const [items, setItems] = useState<ChartItem[]>([
    { id: 1, label: 'リーダーシップ', value: 85 },
    { id: 2, label: '技術力', value: 90 },
    { id: 3, label: 'コミュニケーション', value: 60 },
    { id: 4, label: '計画性', value: 55 },
    { id: 5, label: '実行力', value: 75 },
  ]);
  const [borderValue, setBorderValue] = useState<number>(70);
  const [opportunities, setOpportunities] = useState<string>('');
  const [threats, setThreats] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- 派生状態 ---
  const strengths = useMemo(() => items.filter(item => item.value >= borderValue), [items, borderValue]);
  const weaknesses = useMemo(() => items.filter(item => item.value < borderValue), [items, borderValue]);

  // --- イベントハンドラ ---
  const handleItemChange = (id: number, field: 'label' | 'value', val: string | number) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, [field]: val } : item)));
  };
  const addItem = () => setItems([...items, { id: Date.now(), label: `新規項目${items.length + 1}`, value: 50 }]);
  const removeItem = (id: number) => setItems(items.filter(item => item.id !== id));

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAiAdvice('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        <h1>レーダーチャート SWOT分析 & AIアドバイス</h1>
      </header>

      <div className={styles.contentWrapper}>
        <SettingsPanel
          items={items}
          borderValue={borderValue}
          onItemChange={handleItemChange}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onBorderValueChange={setBorderValue}
        />
        <AnalysisPanel
          items={items}
          borderValue={borderValue}
          strengths={strengths}
          weaknesses={weaknesses}
          opportunities={opportunities}
          threats={threats}
          aiAdvice={aiAdvice}
          isLoading={isLoading}
          onOpportunitiesChange={setOpportunities}
          onThreatsChange={setThreats}
          onAnalyze={handleAnalyze}
        />
      </div>
    </main>
  );
}