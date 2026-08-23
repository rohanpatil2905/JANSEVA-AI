import React from 'react';
import { Layers } from 'lucide-react';

export default function EventDistributionChart({ distribution = [] }) {
  const maxCount = distribution.length > 0 ? Math.max(...distribution.map(d => d.count), 1) : 1;

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
        gap: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Operational Event Distribution
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          By action classification
        </span>
      </div>

      {/* Horizontal Bar Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {distribution.map(item => {
          const barWidth = Math.max(6, Math.round((item.count / maxCount) * 100));

          return (
            <div key={item.eventType} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
                  {item.eventType}
                </span>
                <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>
                  <strong>{item.count}</strong> ({item.percent}%)
                </span>
              </div>

              <div
                style={{
                  height: '7px',
                  backgroundColor: 'var(--color-surface-sunken)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
