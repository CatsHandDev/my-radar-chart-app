export interface ChartItem {
  id: string;
  label: string;
  value: number;
  maxValue: number;
}

export interface UserDataset {
  userId: string;
  userName: string;
  items: ChartItem[];
// ★ 1. SWOT分析 (利用者本人が入力する部分)
  swot?: {
    opportunities?: string;
    threats?: string;
  };
  // ★ 2. 職員専用の機密情報 (利用者には見せない)
  confidential?: {
    considerations?: string;
    disabilityType?: string[]; // ★ 追加: 障害種別（選択式）
    characteristics?: string[]; // ★ 追加: 特性タグ（複数選択）
  };
}

export type BorderType = 'A' | 'B';

export interface Template {
  templateId: string;
  templateName: string;
  items: ChartItem[];
}

// 作業記録一件を表す型
export interface WorkLog {
  itemId: string;
  quantity: number;
  startTime: Date;
  endTime: Date;
  breakDuration: number;
}