"use client";
import { useState, useMemo } from 'react';
import RadarChart from './components/RadarChart';

// 項目の型定義
interface ChartItem {
  id: number;
  label: string;
  value: number;
}

export default function Home() {
  // レーダーチャートの項目リスト
  const [items, setItems] = useState<ChartItem[]>([
    { id: 1, label: '項目A', value: 80 },
    { id: 2, label: '項目B', value: 50 },
    { id: 3, label: '項目C', value: 70 },
    { id: 4, label: '項目D', value: 30 },
    { id: 5, label: '項目E', value: 90 },
  ]);

  // ボーダーラインの値
  const [borderValue, setBorderValue] = useState<number>(60);

  // SWOT分析用の状態
  const [opportunities, setOpportunities] = useState<string>('');
  const [threats, setThreats] = useState<string>('');

  // AIからのアドバイス
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const strengths = useMemo(() =>
    items.filter(item => item.value >= borderValue),
    [items, borderValue]
  );

  const weaknesses = useMemo(() =>
    items.filter(item => item.value < borderValue),
    [items, borderValue]
  );

    const handleAnalyze = async () => {
    setIsLoading(true);
    setAiAdvice('');

    const swotData = {
      strengths: strengths.map(item => item.label),
      weaknesses: weaknesses.map(item => item.label),
      opportunities,
      threats,
    };

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swotData),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setAiAdvice(data.advice);
    } catch (error) {
      console.error('Failed to get AI advice:', error);
      setAiAdvice('分析に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>レーダーチャート SWOT分析アプリ</h1>
      <div style={{ width: '500px', height: '500px' }}>
        <RadarChart
          labels={items.map(item => item.label)}
          values={items.map(item => item.value)}
          borderValue={borderValue}
        />
      </div>
      <div>
        <h2>SWOT分析</h2>
        <div>
          <h3>強み (Strengths)</h3>
          <ul>
            {strengths.map(item => <li key={item.id}>{item.label} ({item.value})</li>)}
          </ul>
        </div>
        <div>
          <h3>弱み (Weaknesses)</h3>
          <ul>
            {weaknesses.map(item => <li key={item.id}>{item.label} ({item.value})</li>)}
          </ul>
        </div>
        <div>
          <h3>機会 (Opportunities)</h3>
          <textarea
            value={opportunities}
            onChange={(e) => setOpportunities(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <h3>脅威 (Threats)</h3>
          <textarea
            value={threats}
            onChange={(e) => setThreats(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <button onClick={handleAnalyze} disabled={isLoading}>
        {isLoading ? '分析中...' : 'AIにアドバイスを求める'}
      </button>

      {aiAdvice && (
        <div>
          <h3>AIからのアドバイス</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '1rem' }}>
            {aiAdvice}
          </pre>
        </div>
      )}
    </main>
  );
}