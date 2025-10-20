import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DnsIcon from '@mui/icons-material/Dns';
import HistoryIcon from '@mui/icons-material/History';
import Link from 'next/link';
import LogoutIcon from '@mui/icons-material/Logout';

// --- Propsの型定義 ---
interface SidebarProps {
  drawerWidth: number;
  activeTab: number;
  onTabChange: (index: number) => void;
  isAdmin: boolean;
  onLogout: () => void;
  isLoggedIn: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, activeTab, onTabChange, isAdmin, onLogout, isLoggedIn }) => {
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const navItems = [
    { text: 'データ設定', icon: <SettingsIcon /> },
    { text: '分析結果', icon: <AnalyticsIcon /> },
    { text: '作業記録', icon: <HistoryIcon /> },
  ];

  if (isAdmin) {
    navItems.push({ text: '職員用', icon: <AdminPanelSettingsIcon /> });
  }

  const handleGuideToggle = () => {
    setIsGuideExpanded(prev => !prev);
  };

    // ★ 初期データ書き込みAPIを呼び出すハンドラ
  const handleSeedDatabase = async () => {
    if (!confirm("本当にデータベースを初期化しますか？既存のデータが上書きされる可能性があります。")) {
      return;
    }

    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        // 成功したらページをリロードして、新しいデータを読み込ませる
        window.location.reload();
      } else {
        throw new Error(data.error || '不明なエラー');
      }
    } catch (error) {
      console.error("Failed to seed database:", error);

      // 1. error が Error オブジェクトのインスタンスであるかチェック
      if (error instanceof Error) {
        // 2. チェック後であれば、安全に .message プロパティにアクセスできる
        alert(`初期化に失敗しました: ${error.message}`);
      } else {
        // 3. Error オブジェクトでない、予期しないエラーの場合
        alert(`初期化中に予期しないエラーが発生しました。`);
      }
    }
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* --- 上部: ヘッダーとナビゲーション --- */}
      <div>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="h1">
            分析メニュー
          </Typography>
        </Box>
        <List>
          {navItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={activeTab === index}
                onClick={() => onTabChange(index)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>

      {isLoggedIn && (
        <ListItemButton onClick={onLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="ログアウト" />
        </ListItemButton>
      )}

      {/* isAdmin が true の場合のみ、職員用メニューを表示 */}
      {isAdmin && (
        <>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleSeedDatabase}>
                <ListItemIcon>
                  <DnsIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="DB初期化 (開発用)" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}

      {/* ログインしていない場合のみ、隠しリンクを表示 */}
      {!isAdmin && (
        <Link
          href="/login"
          aria-label="Admin Login"
          style={{
            position: 'absolute', // 親要素(Drawer)の右下に配置
            bottom: 75,
            left: 0,
            width: '20px',
            height: '20px',
            // background: 'rgba(255,0,0,0.1)', // デバッグ用に色をつける場合はコメント解除
          }}
        />
      )}

      {/* --- 下部: 使い方ガイド --- */}
      <Box sx={{ flexGrow: 1 }} />

      <div>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ p: 1 }}>
          <Accordion
            expanded={isGuideExpanded}
            onChange={handleGuideToggle}
            disableGutters
            elevation={0}
            sx={{ backgroundColor: 'transparent' }}
          >
            <AccordionSummary
              aria-controls="guide-content"
              id="guide-header"
              sx={{
                '.MuiAccordionSummary-expandIconWrapper': {
                  transform: 'none',
                  transition: 'none',
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography variant="subtitle2">使い方ガイド</Typography>
                <ExpandMoreIcon
                  sx={{
                    transform: isGuideExpanded ? 'rotateX(0deg)' : 'rotateX(180deg)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <b>分析データの管理:</b><br/>
                「データ設定」ページで、複数の分析データを管理できます。
              </Typography>
              <Typography variant="body2">
                <b>分析結果の見方:</b><br/>
                「分析結果」ページでは、レーダーチャートとSWOT分析が表示されます。
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </div>
    </Drawer>
  );
};

export default Sidebar;