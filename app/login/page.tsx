"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Card } from '@mui/material';

// パスワードは .env.local ファイルから読み込みます。
// NEXT_PUBLIC_ADMIN_PASSWORD=your_password のように設定してください。
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'default_password';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      // ログイン成功時の処理
      setError('');
      try {
        // sessionStorageにログイン状態を保存
        sessionStorage.setItem('isAdmin', 'true');
        // ログイン後はホームページにリダイレクト
        router.push('/');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        // sessionStorageが利用できない環境（シークレットモードの一部など）のためのエラーハンドリング
        setError('ブラウザのストレージにアクセスできません。設定を確認してください。');
      }
    } else {
      // ログイン失敗時の処理
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
        minHeight: '100vh', // 画面全体の高さを使う
        backgroundColor: '#f5f5f5', // 背景色
      }}
    >
      <Card sx={{ p: 4, width: '100%', maxWidth: '400px', boxShadow: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          職員用ログイン
        </Typography>
        <Box
          component="form"
          // Enterキーで送信できるように onSubmit を使う
          onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }} // マージン調整
        >
          <TextField
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            fullWidth
            autoFocus // ページを開いたときに自動でフォーカスする
          />
          <Button type="submit" variant="contained" size="large">
            ログイン
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default LoginPage;