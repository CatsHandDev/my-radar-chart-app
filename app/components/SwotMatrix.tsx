import React from 'react';
import { ChartItem } from '../types';
import { BorderType } from '../page';
import styles from './AnalysisMatrix.module.scss';

// propsの型定義を新しい仕様に合わせる
interface AnalysisMatrixProps {
  strengths: ChartItem[]; // 66%以上の項目
  weaknesses: ChartItem[]; // 33%未満の項目
  opportunities: string;
  setOpportunities: (value: string) => void;
  threats: string;
  setThreats: (value: string) => void;
  borderType: BorderType;
}

const SwotMatrix: React.FC<AnalysisMatrixProps> = ({
  strengths,
  weaknesses,
  opportunities,
  setOpportunities,
  threats,
  setThreats,
  borderType,
}) => {
  const borderLabels = {
    A: 'A型基準 (65%)',
    B: 'B型基準 (45%)',
  };
  const currentLabel = borderLabels[borderType];

return (
    <div className={styles.matrixContainer}>
      <div className={`${styles.cell} ${styles.strengths}`}>
        {/* ★ 変更点: 見出しを動的にする */}
        <h3>強み ({currentLabel} 以上)</h3>
        {strengths.length > 0 ? (
          <ul>{strengths.map(item => <li key={item.id}>{`${item.label} (${item.value})`}</li>)}</ul>
        ) : <p>基準値以上の項目はありません。</p>}
      </div>
      <div className={`${styles.cell} ${styles.weaknesses}`}>
        {/* ★ 変更点: 見出しを動的にする */}
        <h3>弱み ({currentLabel} 未満)</h3>
        {weaknesses.length > 0 ? (
          <ul>{weaknesses.map(item => <li key={item.id}>{`${item.label} (${item.value})`}</li>)}</ul>
        ) : <p>基準値未満の項目はありません。</p>}
      </div>

      {/* 機会 (Opportunities) */}
      <div className={`${styles.cell} ${styles.opportunities}`}>
        <h3>機会 (Opportunities)</h3>
        <textarea
          placeholder="外部環境から得られるチャンスなどを入力"
          value={opportunities}
          onChange={(e) => setOpportunities(e.target.value)}
        />
      </div>

      {/* 脅威 (Threats) */}
      <div className={`${styles.cell} ${styles.threats}`}>
        <h3>脅威 (Threats)</h3>
        <textarea
          placeholder="目標達成の障害となる外部要因などを入力"
          value={threats}
          onChange={(e) => setThreats(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SwotMatrix;