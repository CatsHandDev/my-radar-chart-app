"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { DataGrid, GridColDef, GridRowId, GridValueGetter, useGridApiRef } from '@mui/x-data-grid';
import { UserDataset, ChartItem } from '../types';
import { v4 as uuidv4 } from 'uuid'

// --- Props & 型定義 ---
interface DataGridPanelProps {
  allUsers: UserDataset[];
  onNavigateToAnalysis: (chartData: ChartItem[]) => void;
}
interface RowData {
  id: string; // work_logのドキュメントID
  userId: string;
  userName: string;
  taskName: string;
  date: string;
  quantity: number;
  workMinutes: number;
}

const DataGridPanel: React.FC<DataGridPanelProps> = ({ allUsers, onNavigateToAnalysis }) => {
  // --- State ---
  const [rows, setRows] = useState<RowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionCount, setSelectionCount] = useState(0);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowId[]>([]);
  const apiRef = useGridApiRef();

  // --- データ取得 ---
  useEffect(() => {
    const fetchSheetData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/sheets');
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'APIエラー');

        // APIから返されたデータに、対応するuserIdを追加する
        const fetchedRows: RowData[] = result.data.map((row: any) => {
          const user = allUsers.find(u => u.userName === row.userName);
          return { ...row, userId: user?.userId || 'unknown' };
        });
        
        setRows(fetchedRows);
        // デフォルトの分析対象ユーザーを設定
        if (allUsers.length > 0) {
          setTargetUserId(allUsers[0].userId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データ取得失敗');
      } finally {
        setIsLoading(false);
      }
    };
    // allUsersが読み込まれてから実行
    if (allUsers.length > 0) {
      fetchSheetData();
    }
  }, [allUsers]);

  // --- カラム定義 ---
  const columns: GridColDef[] = [
    { field: 'date', headerName: '日付', width: 120 },
    { field: 'userName', headerName: '名前', width: 150 },
    { field: 'taskName', headerName: '作業名', width: 150 },
    { field: 'quantity', headerName: '件数or個数', type: 'number', width: 110, editable: true },
    { field: 'minutes', headerName: '時間(分)', type: 'number', width: 110, editable: true },
    {
      field: 'efficiencyPerHour',
      headerName: '効率 (個/時間)',
      type: 'number',
      width: 130,
      valueGetter: (value, row) => {
        const quantity = Number(row.quantity);
        const minutes = Number(row.minutes);
        if (!minutes || minutes <= 0 || !quantity) return null;
        const efficiency = (quantity / minutes) * 60;
        return efficiency.toFixed(1);
      },
    },
  ];

  // --- ハンドラ ---
  const handleAnalyzeClick = () => {
    console.log("Analyze clicked. Selected IDs:", selectedRowIds);
    
    if (selectedRowIds.length === 0) {
      alert("分析する記録を1つ以上選択してください。");
      return;
    }

    const selectedIds = new Set(selectedRowIds);
    const selectedRows = rows.filter(row => selectedIds.has(row.id));

    // --- 1. 新しい集計ロジック ---
    // a. 集計用のオブジェクトを準備
    const aggregation: { [taskName: string]: { totalQuantity: number; totalMinutes: number; count: number } } = {};

    // b. 選択された行をループして、作業名ごとに「合計数量」と「合計時間」を集計
    selectedRows.forEach(row => {
      const taskName = row.taskName;
      if (!taskName) return;

      if (!aggregation[taskName]) {
        aggregation[taskName] = { totalQuantity: 0, totalMinutes: 0, count: 0 };
      }

      aggregation[taskName].totalQuantity += Number(row.quantity);
      aggregation[taskName].totalMinutes += Number(row.workMinutes);
      aggregation[taskName].count += 1;
    });

    // c. 集計結果から、レーダーチャート用の ChartItem[] 配列を作成
    //    チャートに表示する項目名は、集計結果のキー（作業名）から動的に生成する
    const aggregatedData: ChartItem[] = Object.keys(aggregation).map(taskName => {
      const aggregatedResult = aggregation[taskName];
      
      // 全体の平均効率を計算
      const averageEfficiency = (aggregatedResult.totalMinutes > 0)
        ? (aggregatedResult.totalQuantity / aggregatedResult.totalMinutes) * 60
        : 0;

      // この作業名の基準となる maxValue を allUsers から探す
      // (どのユーザーの定義でも良いので、最初に見つかったものを採用)
      let maxValue = 100; // デフォルト値
      for (const user of allUsers) {
        const itemDef = user.items.find(item => item.label === taskName);
        if (itemDef) {
          maxValue = itemDef.maxValue;
          break;
        }
      }
        
      return {
        id: uuidv4(), // 新しい項目なのでユニークIDを生成
        label: taskName,
        value: Math.round(averageEfficiency), // 平均効率を実績値とする
        maxValue: maxValue,
      };
    });

    if (aggregatedData.length === 0) {
        alert("分析可能なデータが選択されていません。");
        return;
    }
    
    // --- 2. 親コンポーネントにデータを渡してページ遷移 ---
    onNavigateToAnalysis(aggregatedData);
  };

  // 選択状態の変更を監視し、件数を更新する
  const handleSelectionChange = useCallback(() => {
    if (apiRef.current?.getSelectedRows) {
      setSelectionCount(apiRef.current.getSelectedRows().size);
    }
  }, [apiRef]);
  
  useEffect(() => {
    if (apiRef.current) {
      // DataGridの `rowSelectionChange` イベントを購読する
      return apiRef.current.subscribeEvent('rowSelectionChange', handleSelectionChange);
    }
  }, [apiRef, handleSelectionChange]);

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">データ表示エラー: {error}</Alert>;
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <Box sx={{ mb: 2, flexShrink: 0, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button onClick={handleAnalyzeClick} variant="contained">
          選択した記録で分析 ({selectionCount}件)
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          
          // ★★★ 2. ここが欠落していた、最も重要な部分 ★★★
          onRowSelectionModelChange={(newSelectionModel) => {
            // チェックボックスの状態が変わるたびに、この関数が呼ばれ、
            // newSelectionModel（IDの配列）で state を更新する
            setSelectedRowIds(newSelectionModel);
          }}
          // ★ 3. DataGridに現在の選択状態を伝える（制御モード）
          rowSelectionModel={selectedRowIds}

          keepNonExistentRowsSelected
        />
      </Box>
    </Box>
  );
};

export default DataGridPanel;