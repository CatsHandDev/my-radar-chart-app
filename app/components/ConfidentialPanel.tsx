"use client";

import React from 'react';
import {
  Box, Typography, TextField, FormControl, InputLabel, Select,
  MenuItem, Autocomplete, Chip, Grid, Paper
} from '@mui/material';
import { UserDataset } from '../types';

interface ConfidentialPanelProps {
  // currentUser -> dataset に名前を統一
  dataset: UserDataset;
  // page.tsxのハンドラに合わせて、汎用的な onUserPropertyChange を受け取る
  onUserPropertyChange: (property: 'disabilityType' | 'characteristics' | 'considerations', value: string[] | string) => void;
}

const ConfidentialPanel: React.FC<ConfidentialPanelProps> = ({
  dataset,
  onUserPropertyChange,
}) => {
  const disabilityOptions = ['精神障害', '発達障害', '身体障害', '知的障害'];
  const characteristicOptions = ['不安が強い', '完璧主義', '聴覚過敏', '視覚過敏', '疲れやすい', '集中が続きにくい'];

  if (!dataset) {
    return <Typography>表示するデータがありません。</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        利用者情報管理 (職員用)
      </Typography>

      <Grid container spacing={4}>
        <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
          <Typography variant="h6" gutterBottom>基本情報・特性</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>障害の種別 (複数選択可)</InputLabel>
              <Select
                multiple
                value={dataset.confidential?.disabilityType || []}
                label="障害の種別 (複数選択可)"
                onChange={(e) => onUserPropertyChange('disabilityType', e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} />)}
                  </Box>
                )}
              >
                {disabilityOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={characteristicOptions}
              value={dataset.confidential?.characteristics || []}
              onChange={(event, newValue) => {
                onUserPropertyChange('characteristics', newValue);
              }}
              freeSolo
              renderInput={(params) => <TextField {...params} label="本人の特性・傾向" />}
            />
          </Box>
        </Grid>

        <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
          <Typography variant="h6" gutterBottom>支援上の配慮事項</Typography>
          <TextField
            label="AIへの指示・特記事項"
            multiline
            rows={8}
            value={dataset.confidential?.considerations || ''}
            onChange={(e) => onUserPropertyChange('considerations', e.target.value)}
            fullWidth
            helperText="この内容はAIへの指示にのみ利用されます。"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ConfidentialPanel;