import React from 'react';
import { Button, TextField, Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ChartItem } from '../types';
import { BorderType, BORDER_PERCENTAGES } from '../page';

// SettingsPanelが受け取るpropsの型を定義
interface SettingsPanelProps {
  items: ChartItem[];
  onItemChange: (id: number, field: 'label' | 'value', value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
  selectedBorder: BorderType; // ★ 選択中のボーダーを受け取る
  onBorderChange: (newBorder: BorderType) => void; // ★ ボーダー変更関数を受け取る
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
  selectedBorder,
  onBorderChange,
}) => {
    const handleBorderChange = (
    event: React.MouseEvent<HTMLElement>,
    newBorder: BorderType | null,
  ) => {
    if (newBorder !== null) {
      onBorderChange(newBorder);
    }
  };

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2 }}>
      <Typography variant="h6" gutterBottom>設定</Typography>

      {/* ボーダー選択UI */}
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>評価基準の選択</Typography>
        <ToggleButtonGroup
          value={selectedBorder}
          exclusive
          onChange={handleBorderChange}
          aria-label="border selection"
        >
          <ToggleButton value="A" aria-label="A-rank border">
            A型基準 (65%)
          </ToggleButton>
          <ToggleButton value="B" aria-label="B-rank border">
            B型基準 (45%)
          </ToggleButton>
        </ToggleButtonGroup>

        {/* 選択中の基準値を表示 */}
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          現在の基準: {Math.round(BORDER_PERCENTAGES[selectedBorder] * 100)}%
        </Typography>
      </Box>

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

          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', minWidth: '80px', textAlign: 'center' }}
          >
            (最大: {item.maxValue})
          </Typography>

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
    </Box>
  );
};

export default SettingsPanel;