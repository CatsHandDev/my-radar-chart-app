import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Card, CardActions, CardContent } from '@mui/material';
import { ChartItem, Template, UserDataset } from '../types';

// SettingsPanelが受け取るpropsの型を定義
interface SettingsPanelProps {
  datasets: UserDataset[];
  currentUserId: string;
  onUserChange: (newUserId: string) => void;
  onAddNewUser: (userName: string) => void;
  onDeleteUser: (userIdToDelete: string) => void;
  items: ChartItem[];
  onItemChange: (id: number, field: 'label' | 'value', value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
  onLoadTemplate: (templateId: string) => void;
  templates: Template[];
  onUserPropertyChange: (property: 'userName', value: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  datasets, currentUserId, items, onItemChange, onAddItem, onRemoveItem, onLoadTemplate, templates}) => {
  const [] = useState('');


  // ★ 1. onFocusイベントハンドラ: フォーカスが当たった時に値が0なら空文字にする
  const handleValueFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, id: number) => {
    if (Number(e.target.value) === 0) {
      onItemChange(id, 'value', ''); // 空文字を渡して表示をクリア
    }
  };

  // ★ 2. onBlurイベントハンドラ: フォーカスが外れた時に値が空なら0に戻す
  const handleValueBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, id: number) => {
    if (e.target.value === '') {
      onItemChange(id, 'value', 0); // 0を渡して表示を戻す
    }
  };

  // ★ 3. onChangeイベントハンドラ: 入力値を数値に変換する
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: number) => {
    // 入力値を数値に変換。空文字や数値以外の場合は0とする
    const numericValue = Number(e.target.value) || 0;
    onItemChange(id, 'value', numericValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
      }}
    >
      {/* --- 左カラム: データ管理と項目編集 --- */}
      <Box
        sx={{
          flex: '1 1 400px',
          minWidth: '320px',
        }}
      >

        {/* 項目編集UI */}
        <Typography variant="h6" gutterBottom>
          「{datasets.find(d => d.userId === currentUserId)?.userName || ''}」さんの項目
        </Typography>
        {items.map(item => (
          // 各項目を1行のFlexboxコンテナとしてレイアウト
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5, // 各要素間の隙間
              mb: 2, // 各行の下の余白
            }}
          >
            {/* 項目名入力: 利用可能なスペースを最大限に使う */}
            <TextField
              label="項目名"
              variant="outlined"
              size="small"
              value={item.label}
              onChange={(e) => onItemChange(item.id, 'label', e.target.value)}
              sx={{ flexGrow: 1, minWidth: '150px' }} // flexGrowで広がり、minWidthで潰れすぎを防止
            />

            {/* 実績値入力: 固定幅 */}
            <TextField
              label="実績値"
              variant="outlined"
              type="number"
              size="small"
              value={item.value}
              onChange={(e) => handleValueChange(e, item.id)}
              onFocus={(e) => handleValueFocus(e, item.id)}
              onBlur={(e) => handleValueBlur(e, item.id)}
              sx={{ width: '100px' }}
            />

            {/* 最大値表示: 固定幅 */}
            {/* <Typography
              variant="body2"
              sx={{ color: 'text.secondary', minWidth: '80px', textAlign: 'left' }}
            >
              (最大: {item.maxValue})
            </Typography> */}

            {/* 削除ボタン */}
            <Button
              size="small"
              color="error"
              onClick={() => onRemoveItem(item.id)}
            >
              削除
            </Button>
          </Box>
        ))}
        <Button onClick={onAddItem} variant="outlined">項目を追加</Button>
      </Box>

      {/* --- 右カラム: ガイドとテンプレート --- */}
      <Box
        sx={{
          flex: '1 1 400px',
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* テンプレートから新規作成 */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>テンプレートから新規作成</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              ボタンを押すと、選択した雛形から新しい分析データが作成されます。
            </Typography>
          </CardContent>
          <CardActions sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 2 }}>
              {templates.map(template => (
                <Button
                  key={template.templateId}
                  size="small"
                  variant="outlined"
                  onClick={() => onLoadTemplate(template.templateId)}
                >
                  {template.templateName}
                </Button>
              ))}
            </CardActions>
        </Card>
      </Box>
    </Box>
  );
};

export default SettingsPanel;