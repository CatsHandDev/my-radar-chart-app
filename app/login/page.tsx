"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Card } from '@mui/material';

// ★ 実際のパスワードは環境変数で管理するのがベスト
const ADMIN_PASSWORD = process.env.ADMIN_MODE || 'your-default-password';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      // ログイン成功
      setError('');
      // ★ セッションストレージにログイン状態を保存
      //    セッションストレージはタブを閉じると消える一時的な保存場所
      sessionStorage.setItem('isAdmin', 'true');
      // ログイン後はホームページにリダイレクト
      router.push('/');
    } else {
      // ログイン失敗
      setError('パスワードが違います。');
      setPassword('');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Card sx={{ p: 4, width: '100%', maxWidth: '400px' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          職員用ログイン
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            fullWidth
          />
          <Button type="submit" variant="contained">
            ログイン
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default LoginPage;