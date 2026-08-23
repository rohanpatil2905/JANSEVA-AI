import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', dot = false }) {
  let bg = 'var(--color-surface-sunken)';
  let color = 'var(--color-ink-muted)';
  let border = 'var(--color-border)';

  switch (variant.toLowerCase()) {
    case 'critical':
      bg = 'var(--color-critical-bg)';
      color = 'var(--color-critical)';
      border = 'var(--color-critical-border)';
      break;
    case 'high':
      bg = 'var(--color-high-bg)';
      color = 'var(--color-high)';
      border = 'var(--color-high-border)';
      break;
    case 'moderate':
    case 'medium':
      bg = 'var(--color-moderate-bg)';
      color = 'var(--color-moderate)';
      border = 'var(--color-moderate-border)';
      break;
    case 'healthy':
    case 'low':
    case 'optimal':
    case 'success':
    case 'resolved':
      bg = 'var(--color-healthy-bg)';
      color = 'var(--color-healthy)';
      border = 'var(--color-healthy-border)';
      break;
    case 'ai':
      bg = 'var(--color-ai-tint)';
      color = 'var(--color-ai)';
      border = 'var(--color-ai-border)';
      break;
    case 'water':
    case 'info':
    case 'new':
      bg = 'var(--color-water-tint)';
      color = 'var(--color-water)';
      border = '#BAE6FD';
      break;
    case 'open':
    case 'in review':
    case 'acknowledged':
      bg = '#FEF3C7';
      color = '#B45309';
      border = '#FDE68A';
      break;
    case 'escalated':
      bg = '#FEE2E2';
      color = '#B91C1C';
      border = '#FECACA';
      break;
    case 'closed':
      bg = '#F1F5F9';
      color = '#64748B';
      border = '#CBD5E1';
      break;
    default:
      break;
  }

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-full)',
        padding: isSmall ? '1px 7px' : '3px 10px',
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
}
