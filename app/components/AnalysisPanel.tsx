import React, { useState } from 'react';
import { Button, Box, Typography, Tabs, Tab, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ChartItem } from '../types';
import RadarChart from './RadarChart';
import SwotMatrix from './SwotMatrix';
import styles from './AnalysisMatrix.module.scss';
import { BorderType, BORDER_PERCENTAGES } from '../page';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// AnalysisPanelが受け取るpropsの型を定義
interface AnalysisPanelProps {
  items: ChartItem[];
  strengths: ChartItem[];
  weaknesses: ChartItem[];
  opportunities: string;
  threats: string;
  aiAdvice: string;
  isLoading: boolean;
  onOpportunitiesChange: (value: string) => void;
  onThreatsChange: (value: string) => void;
  onAnalyze: () => void;
  borderPercentage: number;
  borderType: BorderType;
  onBorderChange: (newBorder: BorderType) => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  items,
  strengths,
  weaknesses,
  opportunities,
  threats,
  aiAdvice,
  isLoading,
  onOpportunitiesChange,
  onThreatsChange,
  onAnalyze,
  borderPercentage,
  borderType,
  onBorderChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const percentageValues = items.map(item =>
    item.maxValue > 0 ? (item.value / item.maxValue) * 100 : 0
  );

    // SettingsPanelから移動してきたハンドラ
  const handleBorderChange = (
    event: React.MouseEvent<HTMLElement>,
    newBorder: BorderType | null,
  ) => {
    if (newBorder !== null) {
      onBorderChange(newBorder);
    }
  };

  // 変更点 2: ボーダーラインの値もパーセンテージに変換
  const borderLineValue = borderPercentage * 100;
  const borderLine = {
    label: `${borderType}型基準 (${Math.round(borderLineValue)}%)`,
    // 全ての項目で同じパーセンテージの値を持つ配列を作成
    values: Array(items.length).fill(borderLineValue),
    color: borderType === 'A' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 159, 64, 1)',
  };

  return (
    <div className={styles.panelContainer}>
      <div>
        {/* 1. 上部: レーダーチャート (常に表示) */}
        <div className={styles.chartContainer}>
          <RadarChart
            labels={items.map(item => item.label)}
            values={percentageValues}
            borderLines={[borderLine]}
          />
        </div>

        <Box sx={{ my: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #eee', borderRadius: '8px' }}>
          <Typography gutterBottom>評価基準の選択</Typography>
          <ToggleButtonGroup
            value={borderType} // selectedBorderの代わりにborderTypeを使用
            exclusive
            onChange={handleBorderChange}
            aria-label="border selection"
          >
            <ToggleButton value="A" aria-label="A-rank border">高い目標</ToggleButton>
            <ToggleButton value="B" aria-label="B-rank border">基礎目標</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            現在の基準: {Math.round(BORDER_PERCENTAGES[borderType] * 100)}%
          </Typography>
        </Box>
      </div>

      {/* 2. 下部: タブ切り替えUI */}
      <Box sx={{ width: '100%', mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="analysis tabs" centered>
            <Tab label="SWOT分析" id="analysis-tab-0" />
            <Tab label="アドバイス" id="analysis-tab-1" />
          </Tabs>
        </Box>

        {/* SWOT分析タブのコンテンツ */}
        <TabPanel value={activeTab} index={0}>
          <SwotMatrix
            strengths={strengths}
            weaknesses={weaknesses}
            opportunities={opportunities}
            setOpportunities={onOpportunitiesChange}
            threats={threats}
            setThreats={onThreatsChange}
            borderType={borderType}
          />
        </TabPanel>

        {/* AIアドバイスタブのコンテンツ */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={onAnalyze}
              disabled={isLoading}
              fullWidth
              sx={{ maxWidth: '400px' }}
            >
              {isLoading ? '分析中...' : 'アドバイスを求める'}
            </Button>
            {aiAdvice && (
              <Box sx={{ width: '100%', mt: 2, p: 2, background: '#f4f4f4', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                <Typography variant="h6">アドバイス</Typography>
                <Typography component="p">{aiAdvice}</Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Box>
    </div>
  );
};

export default AnalysisPanel;