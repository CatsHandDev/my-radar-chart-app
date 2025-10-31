"use client";

import React from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  TextField, Button, IconButton, Divider, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { ChartItem, UserDataset, BorderType } from '../types';
import { SelectChangeEvent } from '@mui/material/Select';

// --- Propsの型定義 ---
interface SettingsPanelProps {
  // 表示と編集に必要なデータ
  chartItems: ChartItem[];
  allUsers: UserDataset[];
  selectedTemplateId: string;
  selectedBorder: BorderType;

  // 状態を更新するためのハンドラ
  onTemplateChange: (event: SelectChangeEvent) => void;
  onItemChange: (id: string, field: 'label' | 'value' | 'maxValue', value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onBorderChange: (newBorder: BorderType | null) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  chartItems, allUsers, selectedTemplateId, selectedBorder,
  onTemplateChange, onItemChange, onAddItem, onRemoveItem, onBorderChange
}) => {
  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>分析設定</Typography>

      {/* --- メインの入力エリア (スクロール可能) --- */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflow: 'auto', pr: 1 }}>

        <FormControl fullWidth>
          <InputLabel>項目テンプレート</InputLabel>
          <Select
            value={selectedTemplateId}
            onChange={onTemplateChange}
            label="項目テンプレート"
            size="small"
            sx={{ height: 52 }}
          >
            <MenuItem value=""><em>選択解除</em></MenuItem>
            {allUsers.map(user => <MenuItem key={user.userId} value={user.userId}>{user.userName}さんの項目</MenuItem>)}
          </Select>
        </FormControl>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle2">項目と数値 (ワンタイム分析用)</Typography>
        {chartItems.map(item => (
          <Box key={item.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="項目名" size="small" value={item.label}
              onChange={(e) => onItemChange(item.id, 'label', e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="実績値" type="number" size="small" value={item.value}
              onChange={(e) => onItemChange(item.id, 'value', Number(e.target.value))}
              sx={{ width: '100px' }}
            />
            <TextField
              label="基準値" type="number" size="small" value={item.maxValue}
              onChange={(e) => onItemChange(item.id, 'maxValue', Number(e.target.value))}
              sx={{ width: '80px' }}
            />
            <IconButton onClick={() => onRemoveItem(item.id)} color="error" size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button onClick={onAddItem} variant="outlined" startIcon={<AddIcon />}>項目を追加</Button>
      </Box>

      {/* --- フッター: 分析基準の選択 --- */}
      <Box sx={{ mt: 'auto', pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" align="center">分析基準</Typography>
        <ToggleButtonGroup
          value={selectedBorder}
          exclusive
          onChange={(e, newBorder) => onBorderChange(newBorder)}
          fullWidth
          size="small"
        >
          <ToggleButton value="A">高い目標 (65%)</ToggleButton>
          <ToggleButton value="B">基礎目標 (45%)</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export default SettingsPanel;