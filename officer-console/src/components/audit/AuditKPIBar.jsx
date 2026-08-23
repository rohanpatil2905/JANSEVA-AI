import React from 'react';
import {
  History,
  Clock,
  Sparkles,
  UserCheck,
  ArrowUpRight,
  CheckCircle2,
  ShieldAlert,
  User,
} from 'lucide-react';

export default function AuditKPIBar({ summary }) {
  const {
    totalEvents = 0,
    sessionEvents = 0,
    aiEvents = 0,
    officerEvents = 0,
    escalations = 0,
    resolutions = 0,
    humanVerifications = 0,
    citizenConfirmations = 0,
  } = summary || {};

  const cards = [
    {
      label: 'TOTAL AUDIT EVENTS',
      value: totalEvents,
      subtext: 'Immutable logged steps',
      icon: History,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-tint)',
    },
    {
      label: 'CURRENT SESSION',
      value: sessionEvents,
      subtext: 'Active runtime ledger',
      icon: Clock,
      color: 'var(--color-ink)',
      bg: 'var(--color-surface-sunken)',
    },
    {
      label: 'AI EVENTS',
      value: aiEvents,
      subtext: 'Advisory triage events',
      icon: Sparkles,
      color: 'var(--color-ai)',
      bg: 'var(--color-ai-tint)',
    },
    {
      label: 'OFFICER EVENTS',
      value: officerEvents,
      subtext: 'Statutory decisions',
      icon: UserCheck,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-tint)',
    },
    {
      label: 'ESCALATIONS',
      value: escalations,
      subtext: 'Level 2 & 3 triggers',
      icon: ArrowUpRight,
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-bg)',
    },
    {
      label: 'RESOLUTIONS',
      value: resolutions,
      subtext: 'Signed declarations',
      icon: CheckCircle2,
      color: 'var(--color-healthy)',
      bg: 'var(--color-healthy-bg)',
    },
    {
      label: 'HUMAN VERIFICATIONS',
      value: humanVerifications,
      subtext: 'On-ground audits',
      icon: ShieldAlert,
      color: 'var(--color-high)',
      bg: 'var(--color-high-bg)',
    },
    {
      label: 'CITIZEN CONFIRMATIONS',
      value: citizenConfirmations,
      subtext: 'Citizen OTP verified',
      icon: User,
      color: 'var(--color-healthy)',
      bg: 'var(--color-healthy-bg)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
              padding: '12px 14px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  color: 'var(--color-ink-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                {card.label}
              </span>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '4px',
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={12} color={card.color} />
              </div>
            </div>

            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1.1 }}>
              {card.value}
            </div>

            <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)' }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
