"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, CircularProgress, Alert} from '@mui/material';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { UserDataset, ChartItem } from '../types';
import { v4 as uuidv4 } from 'uuid'
import { itemMaster } from '../data/itemMaster';

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
  quantity: string;
  workMinutes: number;
}

interface SheetRow {
  id: string | number;
  date: string;
  userName: string;
  taskName: string;
  quantity: string | number;
  minutes: string | number;
}

const DataGridPanel: React.FC<DataGridPanelProps> = ({ allUsers, onNavigateToAnalysis }) => {
  // --- State ---
  const [rows, setRows] = useState<RowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setSelectionCount] = useState(0);
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

        const fetchedRows: RowData[] = result.data.map((row: SheetRow) => {
          const user = allUsers.find(u => u.userName === row.userName);
          return {
            ...row,
            id: String(row.id), // idを確実にstringにする
            quantity: Number(row.quantity), // quantityをnumberにする
            workMinutes: Number(row.minutes), // minutesをnumberにする
            userId: user?.userId || 'unknown'
          };
        });
        setRows(fetchedRows);
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
    if (!apiRef.current?.getSelectedRows) return;

    const selectedRowsMap = apiRef.current.getSelectedRows();
    if (selectedRowsMap.size === 0) {
      alert("分析する記録を1つ以上選択してください。");
      return;
    }
    const selectedIds = new Set(selectedRowsMap.keys());
    const selectedRows = rows.filter(row => selectedIds.has(row.id));

    // --- 1. 集計ロジック (ユーザーで絞り込まない) ---
    const aggregation: { [taskName: string]: { totalQuantity: number; totalMinutes: number } } = {};

    selectedRows.forEach(row => {
      const taskName = row.taskName;
      if (!taskName) return;
      if (!aggregation[taskName]) {
        aggregation[taskName] = { totalQuantity: 0, totalMinutes: 0 };
      }
      aggregation[taskName].totalQuantity += Number(row.quantity);
      aggregation[taskName].totalMinutes += Number(row.workMinutes);
    });

    // --- 2. ChartItem[] の作成 (ユーザーに依存しない) ---
    const aggregatedData: ChartItem[] = Object.keys(aggregation).map(taskName => {
      const aggregatedResult = aggregation[taskName];
      const averageEfficiency = (aggregatedResult.totalMinutes > 0)
        ? (aggregatedResult.totalQuantity / aggregatedResult.totalMinutes) * 60
        : 0;

      const itemDefinition = itemMaster.find(master => master.label === taskName);
      const maxValue = itemDefinition ? itemDefinition.maxValue : 100; // 見つからなければデフォルトで100

      return {
        id: uuidv4(),
        label: taskName,
        value: Math.round(averageEfficiency),
        maxValue: maxValue,
      };
    });

    if (aggregatedData.length === 0) {
      alert("分析可能なデータが選択されていません。");
      return;
    }

    // --- 3. 分析ページへ遷移 ---
    onNavigateToAnalysis(aggregatedData);
  };

  // 選択状態の変更を監視し、件数を更新する
  const handleSelectionChange = useCallback(() => {
    // apiRef.current が初期化済みであることを確認
    if (apiRef.current?.getSelectedRows) {
      // getSelectedRows().size で現在の選択件数を取得し、stateを更新
      console.log(apiRef.current.getSelectedRows().size);
      setSelectionCount(apiRef.current.getSelectedRows().size);
    }
  }, [apiRef]);

  useEffect(() => {
    // apiRef.current が利用可能になったらイベントを購読
    if (apiRef.current) {
      // 'rowSelectionChange' イベントを購読し、変更があったら handleSelectionChange を呼ぶ
      // useEffect のクリーンアップ関数で、購読を解除する
      return apiRef.current.subscribeEvent('rowSelectionChange', handleSelectionChange);
    }
  }, [apiRef, handleSelectionChange]);

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">データ表示エラー: {error}</Alert>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <Box sx={{ mb: 2, flexShrink: 0, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button onClick={handleAnalyzeClick} variant="contained">
          選択した記録で分析
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          apiRef={apiRef}
        />
      </Box>
    </Box>
  );
};

export default DataGridPanel;