// client/components/ActivityChart.tsx
"use client";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ActivityChartProps {
  transactions: any[];
}

export default function ActivityChart({ transactions }: ActivityChartProps) {
  
  const dataMap = new Map<string, number>();

  transactions.forEach((tx) => {
    const date = new Date(tx.timeStamp);
    // Format: "8/2024"
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    dataMap.set(key, (dataMap.get(key) || 0) + 1);
  });

  // --- FIX: Sort dates chronologically, not alphabetically ---
  const sortedKeys = Array.from(dataMap.keys()).sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number);
    // Compare Years first, then Months
    return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
  });

  const chartData = sortedKeys.map(key => dataMap.get(key));

  const data = {
    labels: sortedKeys,
    datasets: [
      {
        label: 'Transaction Volume',
        data: chartData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Monthly Activity',
        color: '#9ca3af',
      },
    },
    scales: {
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mt-6">
      <Line data={data} options={options} />
    </div>
  );
}