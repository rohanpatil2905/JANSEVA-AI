import React from 'react';
import { Clock, ShieldCheck, AlertTriangle, Sparkles, ShieldAlert } from 'lucide-react';

export default function AIReviewSummary({ complaints = [] }) {
  // Dynamically derive KPI counts from actual dataset
  const pendingCount = complaints.filter(
    c => !c.aiReviewState || c.aiReviewState === 'PENDING REVIEW'
  ).length;

  const highConfidenceCount = complaints.filter(
    c => (c.aiConfidence || 0) >= 90
  ).length;

  const humanReviewReqCount = complaints.filter(
    c =>
      c.aiReviewState === 'HUMAN VERIFICATION REQUIRED' ||
      c.authenticityStatus === 'Suspicious' ||
      (c.aiConfidence || 0) < 75
  ).length;

  const lowConfidenceCount = complaints.filter(
    c => (c.aiConfidence || 0) < 75
  ).length;

  const suspiciousCount = complaints.filter(
    c => c.authenticityStatus === 'Suspicious' || (c.authenticityScore && c.authenticityScore < 60)
  ).length;

  const cards = [
    {
      label: 'AI REVIEWS PENDING',
      value: pendingCount,
      subtext: 'Awaiting officer sign-off',
      icon: Clock,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-tint)',
    },
    {
      label: 'HIGH CONFIDENCE',
      value: highConfidenceCount,
      subtext: '≥90% model certainty',
      icon: Sparkles,
      color: 'var(--color-healthy)',
      bg: 'var(--color-healthy-bg)',
    },
    {
      label: 'HUMAN REVIEW REQUIRED',
      value: humanReviewReqCount,
      subtext: 'Flagged for verification',
      icon: AlertTriangle,
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-bg)',
    },
    {
      label: 'LOW CONFIDENCE',
      value: lowConfidenceCount,
      subtext: '<75% model certainty',
      icon: ShieldAlert,
      color: 'var(--color-high)',
      bg: 'var(--color-high-bg)',
    },
    {
      label: 'SUSPICIOUS / ABUSE',
      value: suspiciousCount,
      subtext: 'Anti-abuse integrity flags',
      icon: ShieldAlert,
      color: 'var(--color-critical)',
      bg: 'var(--color-critical-bg)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
