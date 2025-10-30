"use client";

import React, { useState, useEffect } from 'react';
import { Grid, Box, Select, MenuItem, FormControl, InputLabel, Button, TextField, Typography, ToggleButtonGroup, ToggleButton, Paper } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { v4 as uuidv4 } from 'uuid';
import RadarChart from './RadarChart';
import SwotMatrix from './SwotMatrix';
import AiAdvicePanel from './AiAdvicePanel';
import { UserDataset, ChartItem, BorderType } from '../types';

interface AnalysisPanelProps {
  initialChartData: ChartItem[] | null;
  allUsers: UserDataset[];
}

const BORDER_PERCENTAGES: Record<BorderType, number> = { A: 0.66, B: 0.45 };

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ initialChartData, allUsers }) => {
  const [editableItems, setEditableItems] = useState<ChartItem[]>([]);
  const [chartItems, setChartItems] = useState<ChartItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedBorder, setSelectedBorder] = useState<BorderType>('A');

  useEffect(() => {
    const initialItems = initialChartData || [
      { id: uuidv4(), label: '項目1', value: 50, maxValue: 100 },
      { id: uuidv4(), label: '項目2', value: 50, maxValue: 100 },
      { id: uuidv4(), label: '項目3', value: 50, maxValue: 100 },
    ];
    setEditableItems(initialItems);
    setChartItems(initialItems);
  }, [initialChartData]);

  const handleTemplateChange = (event: SelectChangeEvent) => {
    const userId = event.target.value;
    setSelectedTemplateId(userId);
    const selectedUser = allUsers.find(u => u.userId === userId);
    if (selectedUser) {
      const newItems = selectedUser.items.map(item => ({ ...item, id: uuidv4(), value: 0 }));
      setEditableItems(newItems);
    }
  };
  
  // 編集用stateを更新するハンドラ
  const handleItemChange = (id: string, field: 'label' | 'value', value: string | number) => {
    setEditableItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleAddItem = () => {
    const newItem: ChartItem = { id: uuidv4(), label: '新規項目', value: 0, maxValue: 100 };
    setChartItems(prev => [...prev, newItem]);
  }

  //「チャートを更新」ボタンのハンドラ
  const handleUpdateChart = () => {
    setChartItems(editableItems);
  };
  
    const handleEditableItemChange = (id: string, field: 'label' | 'value', value: string | number) => {
    setEditableItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          // valueが数値の場合、maxValueを超えないように制御
          if (field === 'value' && Number(value) > item.maxValue) {
            return { ...item, [field]: item.maxValue };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // 分析対象のユーザー情報を取得
  const targetUser = allUsers.find(u => u.userId === selectedTemplateId);

  return (
    <Grid container spacing={4}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* 左上: チャート */}
        <Paper sx={{ p: 2, height: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <RadarChart
              labels={chartItems.map(item => item.label)}
              values={chartItems.map(item => (item.value / item.maxValue) * 100)} // パーセンテージに変換
              borderLines={[{
                label: `${selectedBorder === 'A' ? '高い目標' : '基礎目標'} (${BORDER_PERCENTAGES[selectedBorder] * 100}%)`,
                values: Array(chartItems.length).fill(BORDER_PERCENTAGES[selectedBorder] * 100),
                color: selectedBorder === 'A' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 159, 64, 1)',
              }]}
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 2, height: '100%' }}>
          {/* 右上: セッティング項目 */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>項目テンプレートを呼び出し</InputLabel>
                <Select
                  value={selectedTemplateId}
                  onChange={handleTemplateChange}
                  label="項目テンプレートを呼び出し"
                >
                  <MenuItem value="">
                    <em>選択解除</em>
                  </MenuItem>
                  {allUsers.map(user => <MenuItem key={user.userId} value={user.userId}>{user.userName}さんの項目</MenuItem>)}
                </Select>
              </FormControl>
              <Typography variant="subtitle2">項目と数値を自由入力</Typography>
              {editableItems.map(item => (
                <Box key={item.id} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="項目名" size="small" value={item.label}
                    onChange={(e) => handleEditableItemChange(item.id, 'label', e.target.value)}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    label="実績値" type="number" size="small" value={item.value}
                    onChange={(e) => handleEditableItemChange(item.id, 'value', Number(e.target.value))}
                    sx={{ flex: 1 }}
                  />
                </Box>
              ))}
              <Button onClick={handleAddItem} variant="outlined">項目を追加</Button>

              {/* チャート更新ボタン */}
              <Button onClick={handleUpdateChart} variant="contained">チャートを更新</Button>

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle2">分析基準の選択</Typography>
                <ToggleButtonGroup
                  value={selectedBorder}
                  exclusive
                  onChange={(e, newBorder) => { if (newBorder) setSelectedBorder(newBorder); }}
                  aria-label="border selection"
                >
                  <ToggleButton value="A">高い目標 (66%)</ToggleButton>
                  <ToggleButton value="B">基礎目標 (45%)</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* 左下: SWOT分析 (chartItems を参照) */}
        <Paper sx={{ p: 2, height: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <SwotMatrix
              strengths={chartItems.filter(item => (item.value / item.maxValue) >= BORDER_PERCENTAGES[selectedBorder])}
              weaknesses={chartItems.filter(item => (item.value / item.maxValue) < BORDER_PERCENTAGES[selectedBorder])}
              opportunities="" // 今はまだ渡せない
              setOpportunities={() => {}} // ダミー関数
              threats=""
              setThreats={() => {}} // ダミー関数
              borderType={selectedBorder}
            />
          </Box>
        </Paper>
        
        {/* 右下: AIアドバイス欄 (chartItems を参照) */}
        <Paper sx={{ p: 2, height: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <AiAdvicePanel
              chartItems={chartItems}
              confidential={targetUser?.confidential}
              borderType={selectedBorder}
            />
          </Box>
        </Paper>
      </Box>
    </Grid>
  );
};

export default AnalysisPanel;