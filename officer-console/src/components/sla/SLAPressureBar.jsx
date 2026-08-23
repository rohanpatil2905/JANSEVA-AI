import React from 'react';
import { Clock, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function SLAPressureBar({ overview }) {
  const {
    totalActive = 0,
    onTrackCount = 0,
    atRiskCount = 0,
    breachedCount = 0,
    onTrackPercent = 0,
    atRiskPercent = 0,
    breachedPercent = 0,
  } = overview || {};

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Current Citywide SLA Pressure & Deadline Distribution
          </h3>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
          Active Workload: <strong>{totalActive} Complaints</strong>
        </div>
      </div>

      {/* Horizontal Multi-Segment Progress Bar */}
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
        {onTrackCount > 0 && (
          <div
            style={{
              width: `${onTrackPercent}%`,
              backgroundColor: 'var(--color-healthy)',
              transition: 'width 0.3s ease',
            }}
            title={`On Track: ${onTrackCount} (${onTrackPercent}%)`}
          />
        )}
        {atRiskCount > 0 && (
          <div
            style={{
              width: `${atRiskPercent}%`,
              backgroundColor: 'var(--color-high)',
              transition: 'width 0.3s ease',
            }}
            title={`At Risk: ${atRiskCount} (${atRiskPercent}%)`}
          />
        )}
        {breachedCount > 0 && (
          <div
            style={{
              width: `${breachedPercent}%`,
              backgroundColor: 'var(--color-critical)',
              transition: 'width 0.3s ease',
            }}
            title={`Breached: ${breachedCount} (${breachedPercent}%)`}
          />
        )}
      </div>

      {/* Distribution Legend & Breakdown Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        {/* On Track */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'var(--color-healthy-bg)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-healthy-border)' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-healthy)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-healthy)', textTransform: 'uppercase' }}>
              On Track: {onTrackCount} ({onTrackPercent}%)
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
              Resolving within statutory time
            </div>
          </div>
        </div>

        {/* At Risk */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'var(--color-high-bg)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-high-border)' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-high)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-high)', textTransform: 'uppercase' }}>
              At Risk: {atRiskCount} ({atRiskPercent}%)
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
              Less than 4 hours remaining
            </div>
          </div>
        </div>

        {/* Breached */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'var(--color-critical-bg)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-critical-border)' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-critical)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-critical)', textTransform: 'uppercase' }}>
              Breached: {breachedCount} ({breachedPercent}%)
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
              Requires Level 3 escalation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
