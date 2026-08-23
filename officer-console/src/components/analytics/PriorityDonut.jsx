import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function PriorityDonut({ priorityDistribution = [] }) {
  const total = priorityDistribution.reduce((acc, p) => acc + p.count, 0);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} color="var(--color-high)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Priority & Severity Distribution
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Total: <strong>{total}</strong>
        </span>
      </div>

      {/* Multi-Segment Stacked Bar */}
      <div
        style={{
          display: 'flex',
          height: '14px',
          borderRadius: '7px',
          overflow: 'hidden',
          backgroundColor: 'var(--color-surface-sunken)',
          border: '1px solid var(--color-border)',
        }}
      >
        {priorityDistribution.map(p => {
          if (p.count === 0) return null;
          return (
            <div
              key={p.label}
              style={{
                width: `${p.percent}%`,
                backgroundColor: p.color,
                transition: 'width 0.3s ease',
              }}
              title={`${p.label}: ${p.count} (${p.percent}%)`}
            />
          );
        })}
      </div>

      {/* Grid Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {priorityDistribution.map(p => (
          <div
            key={p.label}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              backgroundColor: p.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                {p.label}
              </span>
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: p.color }}>
              {p.count} <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--color-ink-muted)' }}>({p.percent}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
