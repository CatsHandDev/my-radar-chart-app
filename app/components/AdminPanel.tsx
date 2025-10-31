"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { UserDataset } from '../types';

interface AdminPanelProps {
  allUsers: UserDataset[];
  onUpdateUser: (userId: string, newConfidential: UserDataset['confidential']) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, onUpdateUser }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [currentUserData, setCurrentUserData] = useState<UserDataset | null>(null);

  useEffect(() => {
    if(allUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(allUsers[0].userId);
    }
  }, [allUsers, selectedUserId]);

  useEffect(() => {
    setCurrentUserData(allUsers.find(u => u.userId === selectedUserId) || null);
  }, [selectedUserId, allUsers]);

  const handleSave = () => {
    if(currentUserData) {
      onUpdateUser(currentUserData.userId, currentUserData.confidential);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>利用者情報管理</Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>利用者を選択</InputLabel>
        <Select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} label="利用者を選択">
          {allUsers.map(user => <MenuItem key={user.userId} value={user.userId}>{user.userName}</MenuItem>)}
        </Select>
      </FormControl>

      {currentUserData && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* ... (障害種別、特性、配慮事項の入力UI) ... */}
          {/* onChangeでは handleConfidentialChange を呼ぶ */}
          <Button onClick={handleSave} variant="contained">この内容で保存</Button>
        </Box>
      )}
    </Box>
  );
};

export default AdminPanel;