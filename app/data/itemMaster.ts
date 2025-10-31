// ChartItem['label'] と ChartItem['maxValue'] だけを持つ型
type ItemMaster = {
  label: string;
  maxValue: number;
}

// アプリケーションで利用する全ての作業項目をここで定義
export const itemMaster: ItemMaster[] = [
  { label: 'ダンボール作成速度', maxValue: 140 },
  { label: 'ﾋﾟｯｷﾝｸﾞ-60以上', maxValue: 300 },
  { label: '箱出し-60以上', maxValue: 120 },
  { label: 'ﾋﾟｯｷﾝｸﾞ-ﾈｺﾎﾟｽ･ｺﾝﾊﾟｸﾄ', maxValue: 400 },
  { label: '箱出し-ﾈｺﾎﾟｽ･ｺﾝﾊﾟｸﾄ', maxValue: 300 },
  { label: 'アタック1個セット作成', maxValue: 50 },
  // ... 今後増える作業項目はここに追加
];