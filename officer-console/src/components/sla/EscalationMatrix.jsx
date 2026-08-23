import React from 'react';
import { ShieldAlert, ArrowUpRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function EscalationMatrix({ summary }) {
  const { level1, level2, level3 } = summary || {
    level1: { count: 0, criticalCount: 0, avgRemaining: '0h' },
    level2: { count: 0, criticalCount: 0, avgRemaining: '0h' },
    level3: { count: 0, criticalCount: 0, avgRemaining: '0h' },
  };

  const tiers = [
    {
      level: 1,
      title: 'Level 1: Zonal Field Supervisor',
      authority: 'Ward Executive Engineer / Sector Superintendent',
      count: level1.count,
      criticalCount: level1.criticalCount,
      avgRemaining: level1.avgRemaining,
      trigger: 'Standard initial assignment & response phase (0–70% SLA elapsed)',
      bg: 'var(--color-primary-tint)',
      color: 'var(--color-primary)',
      border: 'var(--color-border)',
    },
    {
      level: 2,
      title: 'Level 2: Municipal Department Head',
      authority: 'Zonal Ward Officer & Chief Engineer',
      count: level2.count,
      criticalCount: level2.criticalCount,
      avgRemaining: level2.avgRemaining,
      trigger: 'SLA risk threshold exceeded (<4 hours) or inter-department bottleneck',
      bg: 'var(--color-high-bg)',
      color: 'var(--color-high)',
      border: 'var(--color-high-border)',
    },
    {
      level: 3,
      title: 'Level 3: Municipal Commissioner (IAS)',
      authority: 'Municipal Commissioner & Disaster Control Room',
      count: level3.count,
      criticalCount: level3.criticalCount,
      avgRemaining: level3.avgRemaining,
      trigger: 'SLA deadline breached, major public safety hazard, or emergency override',
      bg: 'var(--color-critical-bg)',
      color: 'var(--color-critical)',
      border: 'var(--color-critical-border)',
    },
  ];

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Administrative Escalation Matrix & Tiers
          </h3>
        </div>

        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--color-ink-muted)',
          }}
        >
          Prototype Escalation Policy
        </span>
      </div>

      {/* 3 Tier Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {tiers.map(t => (
          <div
            key={t.level}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${t.border}`,
              backgroundColor: t.bg,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: t.color, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Tier Level {t.level}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: '#FFFFFF',
                  color: t.color,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: `1px solid ${t.border}`,
                }}
              >
                {t.count} Active
              </span>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                {t.title}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                Authority: <strong>{t.authority}</strong>
              </div>
            </div>

            <div
              style={{
                padding: '8px 10px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                fontSize: '0.6875rem',
                color: 'var(--color-ink)',
                lineHeight: 1.35,
              }}
            >
              <strong>Trigger Rule:</strong> {t.trigger}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-ink-muted)', marginTop: 'auto' }}>
              <span>Critical Incidents: <strong style={{ color: t.criticalCount > 0 ? 'var(--color-critical)' : 'var(--color-ink)' }}>{t.criticalCount}</strong></span>
              <span>Avg Remaining: <strong>{t.avgRemaining}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
