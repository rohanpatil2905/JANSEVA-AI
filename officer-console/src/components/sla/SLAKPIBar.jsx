import React from 'react';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2, Flame, ArrowUpRight } from 'lucide-react';

export default function SLAKPIBar({ overview }) {
  const {
    totalActive = 0,
    onTrackCount = 0,
    atRiskCount = 0,
    breachedCount = 0,
    dueWithin4HoursCount = 0,
    escalatedCount = 0,
  } = overview || {};

  const cards = [
    {
      label: 'TOTAL ACTIVE',
      value: totalActive,
      subtext: 'Pending operational closure',
      icon: Clock,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-tint)',
    },
    {
      label: 'ON TRACK',
      value: onTrackCount,
      subtext: 'Within standard SLA buffer',
      icon: CheckCircle2,
      color: 'var(--color-healthy)',
      bg: 'var(--color-healthy-bg)',
    },
    {
      label: 'AT RISK',
      value: atRiskCount,
      subtext: '< 4 hours buffer remaining',
      icon: AlertTriangle,
      color: 'var(--color-high)',
      bg: 'var(--color-high-bg)',
    },
    {
      label: 'BREACHED',
      value: breachedCount,
      subtext: 'Statutory deadline exceeded',
      icon: ShieldAlert,
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-bg)',
    },
    {
      label: 'DUE WITHIN 4H',
      value: dueWithin4HoursCount,
      subtext: 'Urgent immediate action',
      icon: Flame,
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-bg)',
    },
    {
      label: 'ESCALATED',
      value: escalatedCount,
      subtext: 'Level 2 & Level 3 tickets',
      icon: ArrowUpRight,
      color: 'var(--color-ai)',
      bg: 'var(--color-ai-tint)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px',
      }}
    >
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--color-ink-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                {card.label}
              </span>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={13} color={card.color} />
              </div>
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1.1 }}>
              {card.value}
            </div>

            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
