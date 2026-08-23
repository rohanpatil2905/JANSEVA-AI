import React from 'react';

export default function GISLegend() {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xs)',
        padding: '8px 12px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        fontSize: '0.6875rem',
      }}
    >
      {/* Priority Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
          Priority:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-critical)' }} />
          <span>Critical</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-high)' }} />
          <span>High</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-moderate)' }} />
          <span>Medium</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)' }} />
          <span>Low</span>
        </div>
      </div>

      <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--color-border)' }} />

      {/* Spatial Markers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
          Intelligence:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'rgba(220, 38, 38, 0.2)', border: '1px solid var(--color-critical)' }} />
          <span>Hotspot Zone</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px dashed var(--color-ai)' }} />
          <span>Master Cluster</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-high)', boxShadow: '0 0 0 2px rgba(234, 88, 12, 0.3)' }} />
          <span>SLA Risk</span>
        </div>
      </div>
    </div>
  );
}
