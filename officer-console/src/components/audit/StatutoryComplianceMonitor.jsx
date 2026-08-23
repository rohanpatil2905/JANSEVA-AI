import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export default function StatutoryComplianceMonitor({ complianceData }) {
  const {
    checks = [],
    traceabilityScore = 92,
    alerts = [],
  } = complianceData || {};

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
        gap: '14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="var(--color-healthy)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Statutory Governance & Compliance Checks
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
            Operational Traceability:
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: traceabilityScore >= 80 ? 'var(--color-healthy-bg)' : 'var(--color-high-bg)',
              color: traceabilityScore >= 80 ? 'var(--color-healthy)' : 'var(--color-high)',
              border: traceabilityScore >= 80 ? '1px solid var(--color-healthy-border)' : '1px solid var(--color-high-border)',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}
          >
            {traceabilityScore}% Traceability
          </span>
        </div>
      </div>

      {/* Compliance Checks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
        {checks.map(chk => (
          <div
            key={chk.id}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--color-healthy)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                  {chk.label}
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                {chk.description}
              </div>
            </div>

            <span
              style={{
                padding: '2px 6px',
                borderRadius: '3px',
                backgroundColor: 'var(--color-healthy-bg)',
                color: 'var(--color-healthy)',
                border: '1px solid var(--color-healthy-border)',
                fontSize: '0.625rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              COMPLIANT
            </span>
          </div>
        ))}
      </div>

      {/* Missing Trace Alerts / Attention Box */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: alerts.length > 0 ? 'var(--color-high-bg)' : 'var(--color-surface-sunken)',
          border: alerts.length > 0 ? '1px solid var(--color-high-border)' : '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
        }}
      >
        {alerts.length > 0 ? (
          <>
            <AlertCircle size={15} color="var(--color-high)" style={{ flexShrink: 0 }} />
            <span style={{ color: 'var(--color-high)' }}>
              <strong>Attention Required:</strong> {alerts[0].complaintId} — {alerts[0].message}
            </span>
          </>
        ) : (
          <>
            <Info size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <span style={{ color: 'var(--color-ink)' }}>
              <strong>Traceability Integrity:</strong> All active grievance workflows maintain verified audit signatures and officer accountability trails.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
