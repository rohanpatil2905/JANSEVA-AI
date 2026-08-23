import React from 'react';
import { Sparkles, ShieldCheck, Info } from 'lucide-react';

export default function AIReviewHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Breadcrumb & Title */}
      <div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
          JanSeva AI / AI Review Workbench
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.02em' }}>
              AI Review Workbench
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', margin: '4px 0 0' }}>
              Human verification of AI-generated grievance classification, severity, routing, and authenticity recommendations.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-ai-tint)',
              border: '1px solid var(--color-ai-border)',
              color: 'var(--color-ai)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} />
            <span>Human-in-the-Loop Verification</span>
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
          <strong style={{ color: 'var(--color-primary)' }}>JANSEVA AI GOVERNANCE:</strong> AI-generated recommendations are advisory only. Final classification, routing, prioritization, and statutory action remain under authorized officer control.
        </div>
      </div>
    </div>
  );
}
