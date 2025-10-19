"use client";
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, Paper
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { NewWorkLog, UserDataset } from '../types';

// --- Props定義 ---
interface WorkLogPanelProps {
  currentUser: UserDataset | null;
  onRecord: (logData: Omit<NewWorkLog, 'userId'>) => void;
}

const WorkLogPanel: React.FC<WorkLogPanelProps> = ({ currentUser, onRecord }) => {
  // --- State ---
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [workMinutes, setWorkMinutes] = useState<number | ''>('');

  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [breakDuration, setBreakDuration] = useState<number | ''>('');

  const [timeInputMode, setTimeInputMode] = useState(0); // 0: 自動計算, 1: 手動入力

  // --- 派生状態 (実働時間の計算) ---
  const calculatedWorkMinutes = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const totalMs = endTime.getTime() - startTime.getTime();
    if (totalMs < 0) return 0;
    const totalMinutes = Math.floor(totalMs / 60000);
    return totalMinutes - (Number(breakDuration) || 0);
  }, [startTime, endTime, breakDuration]);

  // --- ハンドラ ---
  const handleRecordClick = () => {
    const finalWorkMinutes = timeInputMode === 0 ? calculatedWorkMinutes : Number(workMinutes);

    if (!selectedItemId || !quantity || finalWorkMinutes <= 0) {
      alert('作業項目、数量、時間を正しく入力してください。');
      return;
    }

    const logData: Omit<NewWorkLog, 'userId'> = {
      itemId: selectedItemId,
      quantity: Number(quantity),
      startTime: timeInputMode === 0 ? startTime! : new Date(),
      endTime: timeInputMode === 0 ? endTime! : new Date(new Date().getTime() + finalWorkMinutes * 60000),
      breakDuration: Number(breakDuration) || 0,
      workMinutes: finalWorkMinutes,
    };
    onRecord(logData);
    // フォームをリセット
    setQuantity('');
    setWorkMinutes('');
  };

  if (!currentUser) return <Typography>ユーザーが選択されていません。</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>作業記録</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '500px' }}>

          <FormControl fullWidth>
            <InputLabel>作業項目</InputLabel>
            <Select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}>
              {currentUser.items.map(item => <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            label="数量" type="number" value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <Tabs value={timeInputMode} onChange={(e, newValue) => setTimeInputMode(newValue)} centered>
            <Tab label="時間で計算" />
            <Tab label="手動で入力" />
          </Tabs>

          {/* 時間自動計算モード */}
          {timeInputMode === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DateTimePicker label="開始時刻" value={startTime} onChange={setStartTime} />
              <DateTimePicker label="終了時刻" value={endTime} onChange={setEndTime} />
              <TextField label="休憩時間（分）" type="number" value={breakDuration} onChange={(e) => setBreakDuration(Number(e.target.value))} />
              <Typography variant="h6">実働時間: {calculatedWorkMinutes} 分</Typography>
            </Box>
          )}

          {/* 時間手動入力モード */}
          {timeInputMode === 1 && (
            <TextField label="作業時間（分）" type="number" value={workMinutes} onChange={(e) => setWorkMinutes(Number(e.target.value))} />
          )}

          <Button variant="contained" size="large" onClick={handleRecordClick}>この内容で記録する</Button>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default WorkLogPanel;