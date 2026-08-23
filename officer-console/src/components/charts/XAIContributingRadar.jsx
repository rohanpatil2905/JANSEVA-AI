import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function XAIContributingRadar({ factors = [] }) {
  if (!factors || factors.length === 0) {
    return <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No XAI factors</div>;
  }

  // Format data for radar
  const chartData = factors.map(f => ({
    indicator: f.indicator.split('(')[0].trim(),
    weight: f.weight,
    impact: f.impact,
    value: f.value,
  }));

  return (
    <div style={{ width: '100%', height: '260px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey="indicator" tick={{ fill: 'var(--color-ink-muted)', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 40]} tick={{ fontSize: 9 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              boxShadow: 'var(--shadow-md)',
            }}
            formatter={(val, name, item) => [`${val}% attribution (${item.payload.value})`, 'Weight']}
          />
          <Radar
            name="Deficit Attribution Weight"
            dataKey="weight"
            stroke="#4F46E5"
            fill="#4F46E5"
            fillOpacity={0.45}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
