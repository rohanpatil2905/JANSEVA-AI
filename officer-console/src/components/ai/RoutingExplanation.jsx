import React from 'react';
import { Building2, CheckCircle2, Navigation, Compass, Sparkles } from 'lucide-react';

export default function RoutingExplanation({
  recommendedDepartment = 'Water Supply & Operations Department',
  routingConfidence = 95,
  routingReasons = [],
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
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
                backgroundColor: 'var(--color-primary-tint)',
                color: 'var(--color-primary)',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <Compass size={12} /> ROUTING INTELLIGENCE
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Why This Department?
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            Automated jurisdiction classification matching civic rules and location coordinates
          </p>
        </div>

        <div
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-primary-tint)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Building2 size={16} color="var(--color-primary)" />
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
              Target Department ({routingConfidence}% Confidence)
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {recommendedDepartment}
            </div>
          </div>
        </div>
      </div>

      {/* Rationale Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {routingReasons.length === 0 ? (
          <div style={{ padding: '12px', color: 'var(--color-ink-muted)', fontSize: '0.75rem' }}>
            No specific routing reasons recorded.
          </div>
        ) : (
          routingReasons.map((reason, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                fontSize: '0.78125rem',
                color: 'var(--color-ink)',
              }}
            >
              <CheckCircle2 size={14} color="var(--color-healthy)" style={{ flexShrink: 0 }} />
              <span>{reason}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
