import { UserDataset } from "../types";
import { itemMaster } from "./itemMaster"; // ★ マスター項目定義をインポート

// ヘルパー関数: マスターから項目定義を取得
const getItemDef = (label: string) => {
  const def = itemMaster.find(item => item.label === label);
  if (!def) {
    // マスターに定義がない場合はデフォルト値を返す
    console.warn(`Item master definition not found for: ${label}`);
    return { label, maxValue: 100 };
  }
  return def;
};

export const userMasterData: UserDataset[] = [
  {
    userId: 'user-1',
    userName: '大村 可南子',
    password_plain: 'pass1234',
    items: [
      { id: "item-1-1", ...getItemDef('段ボール作成'), value: 85 },
      { id: "item-1-2", ...getItemDef('ピッキング'), value: 70 },
      { id: "item-1-3", ...getItemDef('箱出し'), value: 90 },
    ],
    swot: {
      opportunities: '',
      threats: '',
    },
    confidential: {
      disabilityType: ['知的障害'],
      characteristics: [],
      considerations: '軽度の知的障害があり、簡単な計算などが苦手で暗算に詰まる。ぎっくり腰から腰椎ヘルニアを発症しており、負荷のかかる仕事に対して不安を覚えている。ネガティブな側面が強く、不安が募ると直接のアプローチはないが他者への攻撃性を見せるときがある。ポジティブな面もあり、A型就労から社員やパートへの一般就労を目指して、特に数字に準拠したステップアップを意欲的に目指している。',
    },
  },

  // --- Bさん (user-2) の完全なデータ ---
  {
    userId: 'user-2',
    userName: '四宮 直樹',
    password_plain: 'pass5678',
    items: [
      { id: "item-2-1", ...getItemDef('段ボール作成'), value: 60 },
      { id: "item-2-2", ...getItemDef('ピッキング'), value: 95 },
      { id: "item-2-3", ...getItemDef('清掃スキル'), value: 75 }, // 例として別の項目
    ],
    swot: {
      opportunities: '',
      threats: '',
    },
    confidential: {
      disabilityType: ['精神障害', '身体障害'],
      characteristics: ['対人緊張'],
      considerations: 'うつ病を発症し対人関係に支障を来した経験あり。現在は服用により小康状態を保っているが、想定外の事態や不安や焦りが募るとパニックになって動きが止まる。薬の副作用で振戦が出るなど作業に支障が出ることがたまにある。作業能力は特に低いというわけではなく、段ボール作成、アタック箱詰め、ピッキング、箱田氏は一定以上の評価を得ている。本人はやる気があり、就労時間を延ばしたいと自己申告するほど。',
    },
  },

  // --- Cさん (user-3) など、今後ここに追加していく ---
];