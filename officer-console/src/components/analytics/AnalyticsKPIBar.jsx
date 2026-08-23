import React from 'react';
import {
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Copy,
  UserCheck,
} from 'lucide-react';

export default function AnalyticsKPIBar({ summary }) {
  const {
    totalComplaints = 0,
    criticalRate = '0%',
    slaComplianceRate = '100%',
    resolutionRate = '0%',
    aiReviewRate = '0%',
    humanReviewRate = '0%',
    authenticityFlagRate = '0%',
    duplicateRate = '0%',
  } = summary || {};

  const cards = [
    {
      label: 'TOTAL COMPLAINTS',
      value: totalComplaints,
      subtext: 'Caseload records',
      icon: BarChart3,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-tint)',
    },
    {
      label: 'CRITICAL RATE',
      value: criticalRate,
      subtext: 'High public urgency',
      icon: AlertTriangle,
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-bg)',
    },
    {
      label: 'SLA COMPLIANCE',
      value: slaComplianceRate,
      subtext: 'On-time resolution',
      icon: Clock,
      color: 'var(--color-healthy)',
      bg: 'var(--color-healthy-bg)',
    },
    {
      label: 'RESOLUTION RATE',
      value: resolutionRate,
      subtext: 'Resolved / closed',
      icon: CheckCircle2,
      color: 'var(--color-healthy)',
      bg: 'var(--color-healthy-bg)',
    },
    {
      label: 'AI REVIEW RATE',
      value: aiReviewRate,
      subtext: 'Officer verified triage',
      icon: Sparkles,
      color: 'var(--color-ai)',
      bg: 'var(--color-ai-tint)',
    },
    {
      label: 'HUMAN REVIEW RATE',
      value: humanReviewRate,
      subtext: 'Flagged for inspection',
      icon: UserCheck,
      color: 'var(--color-high)',
      bg: 'var(--color-high-bg)',
    },
    {
      label: 'INTEGRITY FLAGS',
      value: authenticityFlagRate,
      subtext: 'Suspicious / spam rate',
      icon: ShieldAlert,
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-bg)',
    },
    {
      label: 'DUPLICATE RATE',
      value: duplicateRate,
      subtext: 'Corroborating clusters',
      icon: Copy,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-tint)',
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
