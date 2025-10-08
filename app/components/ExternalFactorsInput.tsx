import React from 'react';
import styles from './AnalysisMatrix.module.scss';

interface ExternalFactorsInputProps {
  opportunities: string;
  setOpportunities: (value: string) => void;
  threats: string;
  setThreats: (value: string) => void;
}

const ExternalFactorsInput: React.FC<ExternalFactorsInputProps> = ({
  opportunities,
  setOpportunities,
  threats,
  setThreats,
}) => {
  return (
    <div className={styles.matrixContainer}>
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

export default ExternalFactorsInput;