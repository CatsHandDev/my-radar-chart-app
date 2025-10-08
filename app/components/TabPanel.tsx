import React from 'react';
import { Box } from '@mui/material';

// 共通で利用するPropsの型定義
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// 共通コンポーネントとしてエクスポート
const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        // p: 3 は各呼び出し元で設定した方が柔軟性が高い
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;