"use client";
import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ChartItem, UserDataset, BorderType } from '../types';

interface AiAdvicePanelProps {
  chartItems: ChartItem[];
  confidential?: UserDataset['confidential'];
  borderType: BorderType;
}

const AiAdvicePanel: React.FC<AiAdvicePanelProps> = ({ chartItems, confidential, borderType }) => {
  const [aiAdvice, setAiAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BORDER_PERCENTAGES: Record<BorderType, number> = { A: 0.66, B: 0.45 };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAiAdvice('');
    try {
      // SwotMatrixから強み・弱みを計算するロジック
      const currentBorderPercentage = BORDER_PERCENTAGES[borderType];
      const strengths = chartItems.filter(item => (item.value / item.maxValue) >= currentBorderPercentage);
      const weaknesses = chartItems.filter(item => (item.value / item.maxValue) < currentBorderPercentage);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borderType: borderType,
          strengths: strengths.map(item => item.label),
          weaknesses: weaknesses.map(item => item.label),
          opportunities: '',
          threats: '',
          confidential: confidential,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'API request failed');
      }
      const data = await response.json();
      setAiAdvice(data.advice);
    } catch (error) {
      console.error("AI分析のAPI呼び出しに失敗:", error);
      setAiAdvice(`分析に失敗しました: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6">AIアドバイス</Typography>
      <Button variant="contained" onClick={handleAnalyze} disabled={isLoading}>
        {isLoading ? '分析中...' : 'AIにアドバイスを求める'}
      </Button>
      {aiAdvice && (
        <Box sx={{ p: 2, background: '#f4f4f4', borderRadius: '4px', whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>
          <Typography component="p">{aiAdvice}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default AiAdvicePanel;