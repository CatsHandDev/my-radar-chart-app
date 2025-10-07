import React from 'react';
import { Button, TextField, Slider, Box, Typography } from '@mui/material';
import { ChartItem } from '../types';

// SettingsPanelが受け取るpropsの型を定義
interface SettingsPanelProps {
  items: ChartItem[];
  borderValue: number;
  onItemChange: (id: number, field: 'label' | 'value', value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
  onBorderValueChange: (newValue: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  items,
  borderValue,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onBorderValueChange,
}) => {
  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        設定
      </Typography>

      {items.map((item) => (
        <Box
          key={item.id}
          sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}
        >
          <TextField
            label="項目名"
            variant="outlined"
            size="small"
            value={item.label}
            onChange={(e) => onItemChange(item.id, 'label', e.target.value)}
          />
          <TextField
            label="値"
            variant="outlined"
            type="number"
            size="small"
            value={item.value}
            onChange={(e) => onItemChange(item.id, 'value', Number(e.target.value))}
            sx={{ width: '80px' }}
          />
          <Button
            size="small"
            color="error"
            onClick={() => onRemoveItem(item.id)}
          >
            削除
          </Button>
        </Box>
      ))}

      <Button onClick={onAddItem} variant="outlined" sx={{ mb: 2 }}>
        項目を追加
      </Button>

      <Typography gutterBottom>ボーダー値: {borderValue}</Typography>
      <Slider
        value={borderValue}
        onChange={(_, newValue) => onBorderValueChange(newValue as number)}
        aria-labelledby="border-slider"
        valueLabelDisplay="auto"
        step={5}
        min={0}
        max={100}
      />
    </Box>
  );
};

export default SettingsPanel;