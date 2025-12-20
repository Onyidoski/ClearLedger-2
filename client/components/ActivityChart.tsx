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
  
  // 1. Group by Day + YEAR (MM/DD/YYYY)
  const dataMap = new Map<string, number>();

  transactions.forEach((tx) => {
    const date = new Date(tx.timeStamp);
    // New Format: "8/3/2021" (Month/Day/Year)
    const key = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    dataMap.set(key, (dataMap.get(key) || 0) + 1);
  });

  // 2. Sort chronologically including the YEAR
  const sortedKeys = Array.from(dataMap.keys()).sort((a, b) => {
    const [monthA, dayA, yearA] = a.split('/').map(Number);
    const [monthB, dayB, yearB] = b.split('/').map(Number);
    
    // Compare Years first
    if (yearA !== yearB) return yearA - yearB;
    // Then Months
    if (monthA !== monthB) return monthA - monthB;
    // Then Days
    return dayA - dayB;
  });

  const chartData = sortedKeys.map(key => dataMap.get(key));

  const data = {
    labels: sortedKeys,
    datasets: [
      {
        label: 'Daily Transactions',
        data: chartData,
        borderColor: '#8b5cf6', // Purple to match theme
        backgroundColor: 'rgba(139, 92, 246, 0.1)', // Transparent Purple
        pointBackgroundColor: '#fff',
        pointBorderColor: '#8b5cf6',
        tension: 0.4, // Smooth curves
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Daily Activity (Last 50 Tx)',
        color: '#9ca3af',
        font: { size: 14, weight: 'normal' as const }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#6b7280', precision: 0 },
        grid: { color: '#374151', drawBorder: false },
        border: { display: false }
      },
      x: {
        ticks: { color: '#6b7280' },
        grid: { display: false },
        border: { display: false }
      },
    },
  };

  return (
    <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 mt-6 h-[300px]">
      <Line data={data} options={options} />
    </div>
  );
}