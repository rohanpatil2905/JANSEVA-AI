import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export default function CivicIntegrityAnalytics({ authenticityStats }) {
  const {
    genuineCount = 0,
    needsVerificationCount = 0,
    suspiciousCount = 0,
    suspiciousRate = '0%',
    genuineRate = '100%',
  } = authenticityStats || {};

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Civic Integrity & Anti-Spam Telemetry
          </h3>
        </div>

        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: suspiciousCount > 0 ? 'var(--color-critical-bg)' : 'var(--color-healthy-bg)',
            color: suspiciousCount > 0 ? 'var(--color-critical)' : 'var(--color-healthy)',
            border: suspiciousCount > 0 ? '1px solid var(--color-critical-border)' : '1px solid var(--color-healthy-border)',
            fontSize: '0.6875rem',
            fontWeight: 800,
          }}
        >
          Suspicious Rate: {suspiciousRate}
        </span>
      </div>

      {/* 3 Integrity Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {/* Genuine */}
        <div style={{ padding: '10px', backgroundColor: 'var(--color-healthy-bg)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-healthy-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-healthy)', textTransform: 'uppercase' }}>
            Likely Genuine
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-healthy)', marginTop: '2px' }}>
            {genuineCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)' }}>Verified civic signals</div>
        </div>

        {/* Needs Verification */}
        <div style={{ padding: '10px', backgroundColor: 'var(--color-high-bg)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-high-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-high)', textTransform: 'uppercase' }}>
            Needs Verification
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-high)', marginTop: '2px' }}>
            {needsVerificationCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)' }}>Low citizen history</div>
        </div>

        {/* Suspicious */}
        <div style={{ padding: '10px', backgroundColor: 'var(--color-critical-bg)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-critical-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-critical)', textTransform: 'uppercase' }}>
            Suspicious
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-critical)', marginTop: '2px' }}>
            {suspiciousCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)' }}>Potential duplicate flood</div>
        </div>
      </div>

      {/* Note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
        <Info size={12} style={{ flexShrink: 0 }} />
        <span>Integrity signals represent multi-vector heuristic scores. They do not constitute formal legal determinations.</span>
      </div>
    </div>
  );
}
