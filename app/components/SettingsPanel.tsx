"use client";
import React, { useState } from 'react';
import { Button, TextField, Box, Typography, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { ChartItem, UserDataset } from '../types';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface SettingsPanelProps {
  allUsers: UserDataset[];
  dataset: UserDataset | null;
  items: ChartItem[];
  onItemChange: (id: string, field: 'label' | 'value', value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onFetchData: (userId: string, password?: string) => void;
  onNavigateToAnalysis: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  allUsers, dataset, items, onItemChange, onAddItem, onRemoveItem, onFetchData, onNavigateToAnalysis
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleFetchClick = () => {
    if (!selectedUserId) {
      alert('ユーザーを選択してください。');
      return;
    }
    onFetchData(selectedUserId, password);
  };

  const handleValueFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
    if (Number(e.target.value) === 0) {
      onItemChange(id, 'value', '');
    }
  };

  const handleValueBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
    if (e.target.value === '') {
      onItemChange(id, 'value', 0);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
    const numericValue = Number(e.target.value) || 0;
    onItemChange(id, 'value', numericValue);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        データ読み込み
      </Typography>
      <Box
        component="form"
        onSubmit={(e) => { e.preventDefault(); handleFetchClick(); }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}
      >
        <FormControl fullWidth>
          <InputLabel>利用者を選択</InputLabel>
          <Select
            value={selectedUserId}
            label="利用者を選択"
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {allUsers.map(user => (
              <MenuItem key={user.userId} value={user.userId}>
                {user.userName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="パスワード"
          type="password"
          variant="outlined"
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="contained">読み込み</Button>
      </Box>

      {dataset && (
        <>
          <Typography variant="h6" gutterBottom>
            「{dataset.userName}」さんの項目
          </Typography>
          {items.map(item => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
              }}
            >
              <TextField
                label="項目名"
                variant="outlined"
                size="small"
                value={item.label}
                onChange={(e) => onItemChange(item.id, 'label', e.target.value)}
                sx={{ flexGrow: 1, minWidth: '150px' }}
              />
              <TextField
                label="実績値"
                variant="outlined"
                type="number"
                size="small"
                value={item.value}
                onChange={(e) => handleValueChange(e, item.id)}
                onFocus={(e) => handleValueFocus(e, item.id)}
                onBlur={(e) => handleValueBlur(e, item.id)}
                sx={{ width: '100px' }}
              />
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', minWidth: '80px', textAlign: 'left' }}
              >
                (基準値: {item.maxValue})
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={() => onRemoveItem(item.id)}
              >
                削除
              </Button>
            </Box>
          ))}
          <Button onClick={onAddItem} variant="outlined">項目を追加</Button>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={onNavigateToAnalysis} // ★ propsで受け取った関数を呼ぶ
            >
              分析結果を見る
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SettingsPanel;