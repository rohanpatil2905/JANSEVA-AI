import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default', // 'default' | 'critical' | 'high' | 'healthy' | 'ai'
  trend,
  onClick,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return { borderLeft: '4px solid var(--color-critical)', iconColor: 'var(--color-critical)', bg: 'var(--color-surface)' };
      case 'high':
        return { borderLeft: '4px solid var(--color-high)', iconColor: 'var(--color-high)', bg: 'var(--color-surface)' };
      case 'healthy':
        return { borderLeft: '4px solid var(--color-healthy)', iconColor: 'var(--color-healthy)', bg: 'var(--color-surface)' };
      case 'ai':
        return { borderLeft: '4px solid var(--color-ai)', iconColor: 'var(--color-ai)', bg: 'var(--color-surface)' };
      default:
        return { borderLeft: '4px solid var(--color-primary)', iconColor: 'var(--color-primary)', bg: 'var(--color-surface)' };
    }
  };

  const style = getVariantStyles();

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: style.bg,
        border: '1px solid var(--color-border)',
        borderLeft: style.borderLeft,
        borderRadius: 'var(--radius-md)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      }}
      className={onClick ? 'stat-card-clickable' : ''}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-muted)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{ color: style.iconColor, opacity: 0.9 }}>
            <Icon size={20} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1.1 }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: trend.startsWith('+') ? 'var(--color-ink-muted)' : 'var(--color-healthy)' }}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '6px' }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
