import React from 'react';
import { BrainCircuit, Sparkles, CheckCircle2, Edit3, UserCheck, AlertTriangle } from 'lucide-react';

export default function AIReviewEvaluation({ aiStats }) {
  const {
    total = 0,
    approvedCount = 0,
    modifiedCount = 0,
    verificationReqCount = 0,
    pendingCount = 0,
    overrideRate = 'No reviewed records yet',
    confidenceTiers = {
      high: { count: 0, percent: 0 },
      medium: { count: 0, percent: 0 },
      low: { count: 0, percent: 0 },
    },
  } = aiStats || {};

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-ai-border)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BrainCircuit size={16} color="var(--color-ai)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Operational AI Review Statistics & HITL Governance
          </h3>
        </div>

        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--color-ai-tint)',
            border: '1px solid var(--color-ai-border)',
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: 'var(--color-ai)',
          }}
        >
          Officer Override Rate: {overrideRate}
        </span>
      </div>

      {/* HITL 4 Triage Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {/* Approved */}
        <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-healthy-bg)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-healthy-border)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-healthy)', textTransform: 'uppercase' }}>
            <CheckCircle2 size={12} /> AI Approved
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-healthy)' }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)' }}>Officer confirmed</div>
        </div>

        {/* Modified */}
        <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-high-bg)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-high-border)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-high)', textTransform: 'uppercase' }}>
            <Edit3 size={12} /> AI Overridden
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-high)' }}>
            {modifiedCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)' }}>Officer modified</div>
        </div>

        {/* Human Verification */}
        <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-critical-bg)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-critical-border)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-critical)', textTransform: 'uppercase' }}>
            <UserCheck size={12} /> Verification
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-critical)' }}>
            {verificationReqCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)' }}>Field audit required</div>
        </div>

        {/* Pending Review */}
        <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            <Sparkles size={12} /> Pending Review
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink)' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)' }}>Awaiting decision</div>
        </div>
      </div>

      {/* AI Confidence Distribution Tiers */}
      <div style={{ padding: '12px 14px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          NLP & Multi-Modal Confidence Tiers
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', fontSize: '0.75rem' }}>
          <div style={{ padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
            <div style={{ color: 'var(--color-healthy)', fontWeight: 800 }}>High Confidence (≥90%)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>
              {confidenceTiers.high.count} <span style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>({confidenceTiers.high.percent}%)</span>
            </div>
          </div>

          <div style={{ padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
            <div style={{ color: 'var(--color-high)', fontWeight: 800 }}>Medium (75–89%)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>
              {confidenceTiers.medium.count} <span style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>({confidenceTiers.medium.percent}%)</span>
            </div>
          </div>

          <div style={{ padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
            <div style={{ color: 'var(--color-critical)', fontWeight: 800 }}>Low (&lt;75%)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>
              {confidenceTiers.low.count} <span style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>({confidenceTiers.low.percent}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
