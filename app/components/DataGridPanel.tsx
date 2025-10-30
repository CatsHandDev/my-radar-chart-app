"use client";
import React, { useState, useEffect } from 'react';
import { Box, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Checkbox, Paper, Typography, Divider } from '@mui/material';
import { UserDataset, ChartItem } from '../types';
import { db, workLogConverter } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface DataGridPanelProps {
  allUsers: UserDataset[];
  onNavigateToAnalysis: (chartData: ChartItem[]) => void;
}

interface RowData {
  id: string; // work_logのドキュメントID
  userName: string;
  label: string;
  date: string;
  quantity: number;
  workMinutes: number;
}

const DataGridPanel: React.FC<DataGridPanelProps> = ({ allUsers, onNavigateToAnalysis }) => {
  const [rows, setRows] = useState<RowData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllLogs = async () => {
      const allLogs: RowData[] = [];
      for (const user of allUsers) {
        const logsRef = collection(db, 'users', user.userId, 'work_logs').withConverter(workLogConverter);
        const logSnapshot = await getDocs(logsRef);
        logSnapshot.forEach(doc => {
          const logData = doc.data();
          allLogs.push({
            id: doc.id,
            userName: user.userName,
            label: user.items.find(item => item.id === logData.itemId)?.label || '不明',
            date: logData.startTime.toLocaleDateString(),
            quantity: logData.quantity,
            workMinutes: logData.workMinutes,
          });
        });
      }
      setRows(allLogs);
    };
    fetchAllLogs();
  }, [allUsers]);

  const handleToggle = (value: string) => () => {
    const currentIndex = selectedIds.indexOf(value);
    const newChecked = [...selectedIds];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedIds(newChecked);
  };

  const handleAnalyzeClick = () => {
    // 選択された行のデータをフィルタリング
    const selectedRows = rows.filter(row => selectedIds.includes(row.id));
    
    if (selectedRows.length === 0) {
      alert("分析する記録を1つ以上選択してください。");
      return;
    }

    // ... (ここから、selectedRows を元にデータを集計するロジック)
    
    // 仮の集計データ
    const aggregatedData: ChartItem[] = allUsers[0]?.items.map(item => ({ ...item, value: Math.random() * 100 })) || [];
    
    onNavigateToAnalysis(aggregatedData);
  };
  
  return (
    <Box>
      <Button onClick={handleAnalyzeClick} variant="contained" sx={{ mb: 2 }}>
        選択した記録で分析ページへ ({selectedIds.length}件選択中)
      </Button>
      
      <Paper sx={{ width: '100%', height: 600, overflow: 'auto' }}>
        <List dense>
          {/* ヘッダー */}
          <ListItem divider>
            <ListItemText primary="利用者名" sx={{ flex: 1 }} />
            <ListItemText primary="作業項目" sx={{ flex: 1 }} />
            <ListItemText primary="日付" sx={{ flex: 1 }} />
            <ListItemText primary="数量" sx={{ flex: 1, textAlign: 'right' }} />
            <ListItemText primary="作業時間(分)" sx={{ flex: 1, textAlign: 'right' }} />
          </ListItem>
          {/* データ行 */}
          {rows.map((row) => {
            const labelId = `checkbox-list-label-${row.id}`;
            return (
              <ListItem
                key={row.id}
                secondaryAction={<Checkbox edge="end" />}
                disablePadding
              >
                <ListItemButton role={undefined} onClick={handleToggle(row.id)} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedIds.indexOf(row.id) !== -1}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={row.userName} sx={{ flex: 1 }} />
                  <ListItemText primary={row.label} sx={{ flex: 1 }} />
                  <ListItemText primary={row.date} sx={{ flex: 1 }} />
                  <ListItemText primary={row.quantity} sx={{ flex: 1, textAlign: 'right' }} />
                  <ListItemText primary={row.workMinutes} sx={{ flex: 1, textAlign: 'right' }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default DataGridPanel;