import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  labels: string[];
  values: number[];
  borderValue: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ labels, values, borderValue }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: '評価値',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
      {
        label: 'ボーダー',
        // 全ての項目でボーダー値を持つ配列を作成
        data: Array(labels.length).fill(borderValue),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0)', // 内側は塗りつぶさない
        borderWidth: 2,
        pointRadius: 0, // ボーダーラインの点は非表示
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100, // 例えば0から100の範囲
      },
    },
    maintainAspectRatio: false,
  };

  return <Radar data={data} options={options} />;
};

export default RadarChart;