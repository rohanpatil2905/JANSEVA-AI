import React from 'react';
import { Flame, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';

export default function SeverityAnalysis({
  severityScore = 94,
  priority = 'Critical',
  severityFactors = [],
}) {
  const isCritical = priority === 'Critical';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: isCritical ? '1px solid var(--color-critical-border)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: isCritical ? 'var(--color-critical-bg)' : 'var(--color-high-bg)',
                color: isCritical ? 'var(--color-critical)' : 'var(--color-high)',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <Flame size={12} /> SEVERITY & RISK VECTOR
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Municipal Risk Vector Analysis
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            Multi-dimensional risk scoring calibrated against citizen density and civic infrastructure
          </p>
        </div>

        <div
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isCritical ? 'var(--color-critical-bg)' : 'var(--color-high-bg)',
            border: isCritical ? '1px solid var(--color-critical-border)' : '1px solid var(--color-high-border)',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: isCritical ? 'var(--color-critical)' : 'var(--color-high)', textTransform: 'uppercase' }}>
            {priority} PRIORITY
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isCritical ? 'var(--color-critical)' : 'var(--color-high)', lineHeight: 1.1 }}>
            {severityScore} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* Factors Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {severityFactors.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: '0.75rem' }}>
            No specific severity sub-vectors provided.
          </div>
        ) : (
          severityFactors.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
                  {item.factor}
                </span>
                <span style={{ fontWeight: 800, color: item.score > 85 ? 'var(--color-critical)' : 'var(--color-primary)' }}>
                  {item.score} / 100
                </span>
              </div>

              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-border)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${item.score}%`,
                    height: '100%',
                    backgroundColor: item.score > 85 ? 'var(--color-critical)' : item.score > 60 ? 'var(--color-high)' : 'var(--color-primary)',
                    borderRadius: '9999px',
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
