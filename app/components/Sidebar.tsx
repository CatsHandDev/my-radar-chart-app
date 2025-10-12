import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import LogoutIcon from '@mui/icons-material/Logout';

// --- Propsの型定義 ---
interface SidebarProps {
  drawerWidth: number;
  activeTab: number;
  onTabChange: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, activeTab, onTabChange }) => {
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const { isAdmin } = useAuth();
  const router = useRouter();
  const navItems = [
    { text: 'データ設定', icon: <SettingsIcon /> },
    { text: '分析結果', icon: <AnalyticsIcon /> },
  ];

  if (isAdmin) {
    navItems.push({ text: '職員用', icon: <AdminPanelSettingsIcon /> });
  }

    // ログアウト処理用のハンドラ
  const handleLogout = () => {
    // 1. セッションストレージからログイン情報を削除
    sessionStorage.removeItem('isAdmin');
    // 2. ホームページに遷移し、ページを完全にリロードして状態をリセット
    router.push('/');
    router.refresh(); // Next.js 13+ App Routerでのリロード推奨方法
  };

  const handleGuideToggle = () => {
    setIsGuideExpanded(prev => !prev);
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
          // ★ display: 'flex' と flexDirection: 'column' を追加して
          //    flexGrow が正しく機能するようにする
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
          {/* 配列をmapして動的にリストを生成 */}
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

      {/* --- 下部: 使い方ガイド --- */}
      {/* このスペーサーが上部と下部を分離する */}
      <Box sx={{ flexGrow: 1 }} />

      {/* 職員モードの場合のみログアウトボタンを表示 */}
      {isAdmin && (
        <>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="ログアウト" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}

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
              // sxプロパティでアイコンのスタイルを直接制御
              sx={{
                // アイコンコンテナのデフォルトの回転アニメーションを無効化
                '.MuiAccordionSummary-expandIconWrapper': {
                  transform: 'none',
                  transition: 'none',
                }
              }}
            >
              {/* アイコンとテキストをFlexboxで配置 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography variant="subtitle2">使い方ガイド</Typography>
                <ExpandMoreIcon
                  sx={{
                    // stateに基づいて回転を適用
                    transform: isGuideExpanded ? 'rotateX(0deg)' : 'rotateX(180deg)',
                    // 滑らかなアニメーションを追加
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
        <Link
          href="/login"
          aria-label="Admin Login"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '20px',
            height: '20px',
            cursor: 'default',
            // background: 'rgba(255,0,0,0.1)', // デバッグ用
          }}
        />
      </div>
    </Drawer>
  );
};

export default Sidebar;