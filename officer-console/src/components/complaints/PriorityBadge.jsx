import React from 'react';

export default function PriorityBadge({ priority, severityScore, showScore = true }) {
  const p = (priority || 'Low').toLowerCase();

  const getColors = () => {
    switch (p) {
      case 'critical':
        return {
          bg: 'var(--color-critical-bg)',
          color: 'var(--color-critical)',
          border: 'var(--color-critical-border)',
          dot: 'var(--color-critical)',
        };
      case 'high':
        return {
          bg: 'var(--color-high-bg)',
          color: 'var(--color-high)',
          border: 'var(--color-high-border)',
          dot: 'var(--color-high)',
        };
      case 'medium':
      case 'moderate':
        return {
          bg: 'var(--color-moderate-bg)',
          color: 'var(--color-moderate)',
          border: 'var(--color-moderate-border)',
          dot: 'var(--color-moderate)',
        };
      case 'low':
      default:
        return {
          bg: 'var(--color-low-bg)',
          color: 'var(--color-low)',
          border: 'var(--color-low-border)',
          dot: 'var(--color-low)',
        };
    }
  };

  const c = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-xs)',
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: c.dot,
        }}
      />
      <span>{priority}</span>
      {showScore && severityScore !== undefined && (
        <span
          style={{
            marginLeft: '2px',
            paddingLeft: '5px',
            borderLeft: `1px solid ${c.border}`,
            opacity: 0.9,
            fontWeight: 800,
          }}
        >
          {severityScore}
        </span>
      )}
    </span>
  );
}
