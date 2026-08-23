import React from 'react';

export default function StatusBadge({ status }) {
  const s = status || 'Submitted';

  const getStyle = () => {
    switch (s) {
      case 'Resolved':
        return {
          bg: 'var(--color-healthy-bg)',
          color: 'var(--color-healthy)',
          border: 'var(--color-healthy-border)',
        };
      case 'In Progress':
        return {
          bg: 'var(--color-primary-tint)',
          color: 'var(--color-primary)',
          border: 'var(--color-border)',
        };
      case 'Assigned':
        return {
          bg: 'var(--color-moderate-bg)',
          color: 'var(--color-moderate)',
          border: 'var(--color-moderate-border)',
        };
      case 'AI Classified':
        return {
          bg: 'var(--color-ai-tint)',
          color: 'var(--color-ai)',
          border: 'var(--color-ai-border)',
        };
      case 'Reopened':
      case 'Escalated':
        return {
          bg: 'var(--color-high-bg)',
          color: 'var(--color-high)',
          border: 'var(--color-high-border)',
        };
      case 'Rejected':
        return {
          bg: 'var(--color-critical-bg)',
          color: 'var(--color-critical)',
          border: 'var(--color-critical-border)',
        };
      case 'Submitted':
      default:
        return {
          bg: 'var(--color-surface-sunken)',
          color: 'var(--color-ink-muted)',
          border: 'var(--color-border)',
        };
    }
  };

  const style = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 'var(--radius-xs)',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {s}
    </span>
  );
}
