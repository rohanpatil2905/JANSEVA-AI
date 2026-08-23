import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KPICard({
  title,
  value,
  subtext,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  icon: Icon,
  variant = 'default', // 'default' | 'critical' | 'high' | 'healthy' | 'ai'
  onClick,
  active = false,
}) {
  let accentColor = 'var(--color-primary)';
  let bgGradient = 'var(--color-surface)';
  let borderColor = 'var(--color-border)';

  if (variant === 'critical') {
    accentColor = 'var(--color-critical)';
    borderColor = active ? 'var(--color-critical)' : 'var(--color-border)';
  } else if (variant === 'high') {
    accentColor = 'var(--color-high)';
    borderColor = active ? 'var(--color-high)' : 'var(--color-border)';
  } else if (variant === 'healthy') {
    accentColor = 'var(--color-healthy)';
    borderColor = active ? 'var(--color-healthy)' : 'var(--color-border)';
  } else if (variant === 'ai') {
    accentColor = 'var(--color-ai)';
    borderColor = active ? 'var(--color-ai)' : 'var(--color-border)';
  }

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: bgGradient,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        boxShadow: active ? '0 0 0 2px ' + accentColor : 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.18s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = active ? '0 0 0 2px ' + accentColor : 'var(--shadow-sm)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-sunken)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
            }}
          >
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-ink)', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
          {value}
        </div>
        {change && (
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              color: changeType === 'positive' ? 'var(--color-healthy)' : changeType === 'negative' ? 'var(--color-critical)' : 'var(--color-ink-muted)',
            }}
          >
            {changeType === 'positive' && <ArrowUpRight size={14} />}
            {changeType === 'negative' && <ArrowDownRight size={14} />}
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-faint)', lineHeight: 1.3 }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
