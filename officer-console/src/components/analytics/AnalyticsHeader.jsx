import React from 'react';
import { BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';

export default function AnalyticsHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Breadcrumb & Title */}
      <div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
          JanSeva AI / Analytics
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Municipal Analytics & AI Evaluation
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', margin: '4px 0 0' }}>
              Citywide grievance trends, operational performance, and AI decision-support evaluation.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-tint)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <BarChart3 size={14} />
            <span>Executive Performance Intelligence</span>
          </div>
        </div>
      </div>

      {/* Governance Notice Banner */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-surface-sunken)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <ShieldCheck size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--color-primary)' }}>DATA INTEGRITY NOTICE:</strong> Analytics describe operational patterns and AI system behavior from the municipal registry snapshot. They do not replace statutory officer decisions.
        </div>
      </div>
    </div>
  );
}
