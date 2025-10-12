"use client"; // ★ useStateを使うため

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, FormControl, InputLabel, Select,
  MenuItem, Autocomplete, Chip, Grid, Paper, Divider
} from '@mui/material';
import { UserDataset } from '../types';

// --- Propsの型定義を修正 ---
interface ConfidentialPanelProps {
  datasets: UserDataset[];
  currentGlobalUserId: string;
  onDisabilityTypeChange: (userId: string, value: string[]) => void;
  onCharacteristicsChange: (userId: string, value: string[]) => void;
  onConsiderationsChange: (userId: string, value: string) => void;
}

const ConfidentialPanel: React.FC<ConfidentialPanelProps> = ({
  datasets,
  currentGlobalUserId,
  onDisabilityTypeChange,
  onCharacteristicsChange,
  onConsiderationsChange,
}) => {
  // ★ 1. このパネル内で編集対象とするユーザーIDを管理するstate
  const [selectedUserId, setSelectedUserId] = useState(currentGlobalUserId);

  // ★ 2. グローバルな選択IDが変わったら、このパネルの選択IDも追従する
  useEffect(() => {
    setSelectedUserId(currentGlobalUserId);
  }, [currentGlobalUserId]);

  // ★ 3. 選択中のユーザーデータを取得
  const selectedUser = datasets.find(d => d.userId === selectedUserId);

  const disabilityOptions = ['精神障害', '発達障害', '身体障害', '知的障害'];
  const characteristicOptions = ['不安が強い', '完璧主義', '聴覚過敏', '視覚過敏', '疲れやすい', '集中が続きにくい'];

  if (!selectedUser) {
    return <Typography>表示するデータがありません。</Typography>;
  }

  if (!selectedUser) return <Typography>表示するデータがありません。</Typography>;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        利用者情報管理 (職員用)
      </Typography>

      {/* --- 1. 編集対象ユーザーの選択 --- */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>編集対象の利用者</InputLabel>
        <Select
          value={selectedUserId}
          label="編集対象の利用者"
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          {datasets.map(user => (
            <MenuItem key={user.userId} value={user.userId}>{user.userName}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ mb: 4 }} />

      {/* --- 2. 選択中ユーザーの情報表示・編集 --- */}
      <Grid sx={{ xs: 12, md: 6 }}>
        {/* --- 左カラム: 構造化データ --- */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>基本情報・特性</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>障害の種別 (複数選択可)</InputLabel>
              <Select
                multiple
                value={selectedUser.confidential?.disabilityType || []}
                label="障害の種別 (複数選択可)"
                onChange={(e) => {
                  const value = e.target.value;
                  if (Array.isArray(value)) {
                    onDisabilityTypeChange(selectedUserId, value);
                  }
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} />)}
                  </Box>
                )}
              >
                {disabilityOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={characteristicOptions}
              value={selectedUser.confidential?.characteristics || []}
              onChange={(event, newValue) => {onCharacteristicsChange(selectedUserId, newValue);}}
              freeSolo
              renderInput={(params) => <TextField {...params} label="本人の特性・傾向" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => <Chip key={value} label={value} />)}
                </Box>
              )}
            />
          </Box>
        </Grid>

        {/* --- 右カラム: 自由記述 --- */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>支援上の配慮事項</Typography>
          <TextField
            label="AIへの指示・特記事項"
            multiline
            rows={8}
            value={selectedUser.confidential?.considerations || ''}
            onChange={(e) => {onConsiderationsChange(selectedUserId, e.target.value);}}
            fullWidth
            helperText="この内容はAIへの指示にのみ利用されます。"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ConfidentialPanel;