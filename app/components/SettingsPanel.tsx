import React from 'react';
import { Button, TextField, Box, Typography, ToggleButton, ToggleButtonGroup, Accordion, AccordionDetails, AccordionSummary, Card, CardActions, CardContent, Grid } from '@mui/material';
import { ChartItem } from '../types';
import { BorderType, BORDER_PERCENTAGES } from '../page';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// SettingsPanelが受け取るpropsの型を定義
interface SettingsPanelProps {
  items: ChartItem[];
  onItemChange: (id: number, field: 'label' | 'value', value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
  onLoadTemplate: (templateType: 'classA' | 'classB') => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onLoadTemplate,
}) => {
  return (
    <Grid container spacing={4}>
      {/* --- 左カラム: 既存の設定UI --- */}
      <Grid sx={{ xs: 12, md: 6}}>
        <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2 }}>
          <Typography variant="h6" gutterBottom>設定</Typography>

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
                label="実績/h"
                variant="outlined"
                type="number"
                size="small"
                value={item.value}
                onChange={(e) => onItemChange(item.id, 'value', Number(e.target.value))}
                sx={{ width: '80px' }}
              />

              {/* <Typography
                variant="body2"
                sx={{ color: 'text.secondary', minWidth: '80px', textAlign: 'center' }}
              >
                (基準値: {item.maxValue})
              </Typography> */}

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
      </Grid>

      {/* --- ★ 右カラム: 新しく追加するコンテンツ --- */}
      <Grid sx={{ xs: 12, md: 6}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* --- 1. 使い方ガイドのカード --- */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>使い方ガイド</Typography>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>評価基準の使い分け</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    <b>Aランク基準(66%)</b>は、高い目標を設定し、自身の強みをさらに伸ばしたい場合に使用します。<br/>
                    <b>Bランク基準(33%)</b>は、基礎的な能力が身についているかを確認し、弱点の克服を目指す場合におすすめです。
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>AIアドバイスの活用法</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    分析結果タブの「AIにアドバイスを求める」ボタンを押すと、現在のあなたの強み・弱みと外部要因を総合的に判断し、具体的なアクションプランを提案します。
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* --- 2. 項目テンプレートのカード --- */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>項目テンプレート</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                ボタンを押すと、一般的な評価項目のセットが自動で入力されます。
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => onLoadTemplate('classA')}>高い目標</Button>
              <Button size="small" onClick={() => onLoadTemplate('classB')}>基礎目標</Button>
            </CardActions>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
};

export default SettingsPanel;