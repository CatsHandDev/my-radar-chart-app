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
  type TooltipItem,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface BorderLine {
  label: string;
  values: number[];
  color: string;
}

interface RadarChartProps {
  labels: string[];
  values: number[];
  borderLines: BorderLine[];
}

const RadarChart: React.FC<RadarChartProps> = ({ labels, values, borderLines }) => {
  const borderDatasets = borderLines.map(line => ({
    label: line.label,
    data: line.values,
    borderColor: line.color,
    backgroundColor: 'transparent',
    borderWidth: 2,
    pointRadius: 0,
  }));

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
      ...borderDatasets,
    ],
  };

  const options = {
    scales: {
      r: { // r は radial axis (放射軸) の設定
        angleLines: { display: true },
        // suggestedMin/Max の代わりに min/max を使用してスケールを完全に固定
        min: 0,
        max: 100,
        // 目盛りの設定 (UX向上のためのオプション)
        ticks: {
          stepSize: 20, // 20%ごとに目盛りを表示
          // 目盛りの数値に '%' をつける
          callback: function (value: string | number) {
            return value + '%';
          },
        },
      },
    },
    maintainAspectRatio: false,
    // ★ ツールチップに表示される内容も '%' をつけるとより分かりやすい
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'radar'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.r !== null) {
              label += context.parsed.r.toFixed(1) + '%'; // 小数点1桁まで表示
            }
            return label;
          }
        }
      }
    }
  };

  return <Radar data={data} options={options} />;
};

export default RadarChart;