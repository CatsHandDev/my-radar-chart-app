import React from 'react';
import styles from './SwotMatrix.module.scss';

// propsの型定義
interface SwotMatrixProps {
  strengths: { id: number; label: string; value: number }[];
  weaknesses: { id: number; label: string; value: number }[];
  opportunities: string;
  setOpportunities: (value: string) => void;
  threats: string;
  setThreats: (value: string) => void;
}

const SwotMatrix: React.FC<SwotMatrixProps> = ({
  strengths,
  weaknesses,
  opportunities,
  setOpportunities,
  threats,
  setThreats,
}) => {
  return (
    <div className={styles.matrixContainer}>
      {/* 強み (Strengths) */}
      <div className={`${styles.cell} ${styles.strengths}`}>
        <h3>強み (Strengths)</h3>
        {strengths.length > 0 ? (
          <ul>
            {strengths.map((item) => (
              <li key={item.id}>{`${item.label} (${item.value})`}</li>
            ))}
          </ul>
        ) : (
          <p>基準値以上の項目はありません。</p>
        )}
      </div>

      {/* 弱み (Weaknesses) */}
      <div className={`${styles.cell} ${styles.weaknesses}`}>
        <h3>弱み (Weaknesses)</h3>
        {weaknesses.length > 0 ? (
          <ul>
            {weaknesses.map((item) => (
              <li key={item.id}>{`${item.label} (${item.value})`}</li>
            ))}
          </ul>
        ) : (
          <p>基準値未満の項目はありません。</p>
        )}
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