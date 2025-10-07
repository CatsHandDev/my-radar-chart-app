import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { ChartItem } from '../types';
import RadarChart from './RadarChart';
import SwotMatrix from './SwotMatrix';
import styles from './AnalysisPanel.module.scss';

// AnalysisPanelが受け取るpropsの型を定義
interface AnalysisPanelProps {
  items: ChartItem[];
  borderValue: number;
  strengths: ChartItem[];
  weaknesses: ChartItem[];
  opportunities: string;
  threats: string;
  aiAdvice: string;
  isLoading: boolean;
  onOpportunitiesChange: (value: string) => void;
  onThreatsChange: (value: string) => void;
  onAnalyze: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  items,
  borderValue,
  strengths,
  weaknesses,
  opportunities,
  threats,
  aiAdvice,
  isLoading,
  onOpportunitiesChange,
  onThreatsChange,
  onAnalyze,
}) => {
  return (
    <div className={styles.panelContainer}>
      <div className={styles.chartContainer}>
        <RadarChart
          labels={items.map((item) => item.label)}
          values={items.map((item) => item.value)}
          borderValue={borderValue}
        />
      </div>

      <SwotMatrix
        strengths={strengths}
        weaknesses={weaknesses}
        opportunities={opportunities}
        setOpportunities={onOpportunitiesChange}
        threats={threats}
        setThreats={onThreatsChange}
      />

      <Box sx={{ mt: 3, width: '100%', maxWidth: '800px' }}>
        <Button variant="contained" onClick={onAnalyze} disabled={isLoading} fullWidth>
          {isLoading ? '分析中...' : 'AIにアドバイスを求める'}
        </Button>
        {aiAdvice && (
          <Box sx={{ mt: 2, p: 2, background: '#f4f4f4', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
            <Typography variant="h6">AIからのアドバイス</Typography>
            <Typography component="p">{aiAdvice}</Typography>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default AnalysisPanel;