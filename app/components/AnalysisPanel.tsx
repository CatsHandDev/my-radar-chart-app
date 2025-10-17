"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import { BorderType, UserDataset } from '../types';
import RadarChart from './RadarChart';
import SwotMatrix from './SwotMatrix';
import TabPanel from './TabPanel';
import styles from './AnalysisPanel.module.scss'
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const BORDER_PERCENTAGES: Record<BorderType, number> = { A: 0.65, B: 0.45 };

// --- Propsの型定義 ---
interface AnalysisPanelProps {
  // propsとして UserDataset 丸ごと受け取る方が管理しやすい
  dataset: UserDataset | null;
  // SWOTの更新ハンドラを追加
  onSwotChange: (field: 'opportunities' | 'threats', value: string) => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ dataset, onSwotChange }) => {
  // --- このコンポーネントが管理するState ---
  const [selectedBorder, setSelectedBorder] = useState<BorderType>('A');
  const [, setOpportunities] = useState<string>('');
  const [, setThreats] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(0);

  // 1. datasetからitemsを安全に取り出す
  const items = useMemo(() => dataset?.items || [], [dataset]);

  // 2. datasetが切り替わったら（＝新しいユーザーが選択されたら）、分析結果をリセットする
  useEffect(() => {
    setOpportunities(dataset?.swot?.opportunities || '');
    setThreats(dataset?.swot?.threats || '');
    setAiAdvice('');
    // 基準もデフォルトのAに戻す
    setSelectedBorder('A');
  }, [dataset]);

  // --- 派生状態 ---
  const chartableItems = useMemo(() => items.filter(item => item.value > 0), [items]);
  const currentBorderPercentage = BORDER_PERCENTAGES[selectedBorder];
  const strengths = useMemo(() =>
    chartableItems.filter(item => (item.value / item.maxValue) >= currentBorderPercentage),
    [chartableItems, currentBorderPercentage]
  );
  const weaknesses = useMemo(() =>
    chartableItems.filter(item => (item.value / item.maxValue) < currentBorderPercentage),
    [chartableItems, currentBorderPercentage]
  );

  // --- ハンドラ ---
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);
  const handleBorderChange = (event: React.MouseEvent<HTMLElement>, newBorder: BorderType | null) => {
    if (newBorder) setSelectedBorder(newBorder);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAiAdvice('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borderType: selectedBorder,
          strengths: strengths.map(item => item.label),
          weaknesses: weaknesses.map(item => item.label),
          opportunities: dataset?.swot?.opportunities || '',
          threats: dataset?.swot?.threats || '',
          considerations: dataset?.confidential?.considerations || '',
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

  const handleApplyDateRange = async () => {
    // 1. dataset が null の可能性があるため、早期リターンでチェック
    if (!dataset) return;

    // 2. dateRange という state が未定義だった
    const [dateRange, setDateRange] = useState([null, null]);

    const logsCollectionRef = collection(db, "users", dataset.userId, "work_logs");
    const q = query(logsCollectionRef,
      where("startTime", ">=", dateRange[0]),
      where("startTime", "<=", dateRange[1])
    );
    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map(doc => doc.data());

    // ... 
  };

  // --- レンダリング用のデータ準備 ---
  const percentageValues = chartableItems.map(item => item.maxValue > 0 ? (item.value / item.maxValue) * 100 : 0);
  const borderLineValue = currentBorderPercentage * 100;
  const borderLine = {
    label: `${selectedBorder === 'A' ? '高い目標' : '基礎目標'} (${Math.round(borderLineValue)}%)`,
    values: Array(chartableItems.length).fill(borderLineValue),
    color: selectedBorder === 'A' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 159, 64, 1)',
  };

  return (
    <div className={styles.panelContainer}>
      <div>
        <div className={styles.chartContainer}>
          <RadarChart
            labels={chartableItems.map(item => item.label)}
            values={percentageValues}
            borderLines={[borderLine]}
          />
        </div>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography gutterBottom>評価基準の選択</Typography>
          <ToggleButtonGroup
            value={selectedBorder}
            exclusive
            onChange={handleBorderChange}
            aria-label="border selection"
          >
            <ToggleButton value="A" aria-label="A-rank border">高い目標</ToggleButton>
            <ToggleButton value="B" aria-label="B-rank border">基礎目標</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            現在の基準: {Math.round(BORDER_PERCENTAGES[selectedBorder] * 100)}%
          </Typography>
        </Box>
      </div>
      <Box sx={{ width: '100%', mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="analysis tabs" centered>
            <Tab label="SWOT分析" id="analysis-tab-0" />
            <Tab label="AIアドバイス" id="analysis-tab-1" />
          </Tabs>
        </Box>
        <TabPanel value={activeTab} index={0}>
          <SwotMatrix
            strengths={strengths}
            weaknesses={weaknesses}
            opportunities={dataset?.swot?.opportunities || ''}
            setOpportunities={(value) => onSwotChange('opportunities', value)}
            threats={dataset?.swot?.threats || ''}
            setThreats={(value) => onSwotChange('threats', value)}
            borderType={selectedBorder}
          />
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={isLoading}
            fullWidth
            sx={{ mt: 2, height: 50, maxWidth: '100%' }}
          >
            {isLoading ? '分析中...' : 'AIにアドバイスを求める'}
          </Button>
        </TabPanel>
        {/* 2. AIアドバイスタブのコンテンツ */}
        <TabPanel value={activeTab} index={1}>
          {/* ★ ボタンを削除し、レスポンス表示コンポーネントのみにする */}
          <Box sx={{ width: '100%' }}>
            {aiAdvice ? (
              // アドバイスがある場合の表示
              <Box sx={{ p: 2, background: '#f4f4f4', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                <Typography variant="h6">AIからのアドバイス</Typography>
                <Typography component="p">{aiAdvice}</Typography>
              </Box>
            ) : (
              // アドバイスがまだない場合のプレースホルダー表示
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>
                  「SWOT分析」タブのボタンを押すと、ここにAIからのアドバイスが表示されます。
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Box>
    </div>
  );
};

export default AnalysisPanel;