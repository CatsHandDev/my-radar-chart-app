"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics'; // 分析ページ
import TableViewIcon from '@mui/icons-material/TableView'; // データページ (DataGrid)
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // 職員用
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  // 1. ナビゲーション項目を新しいページ構成に合わせる
  const navItems = [
    { text: '分析ページ', icon: <AnalyticsIcon /> },
    { text: 'データページ', icon: <TableViewIcon /> },
  ];
  
  // 職員でログインしている場合のみ、「職員用」を追加
  if (isAdmin) {
    navItems.push({ text: '職員用', icon: <AdminPanelSettingsIcon /> });
  }

  // 2. ログアウトハンドラ
  const handleLogout = () => {
    // sessionStorageからログイン情報を削除
    sessionStorage.removeItem('isAdmin');
    // page.tsxのハンドラを呼び出してstateを更新し、リロードさせる
    onLogout();
  };

  // 3. 使い方ガイドの開閉ハンドラ
  const handleGuideChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setIsGuideExpanded(isExpanded);
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
            onChange={handleGuideChange}
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