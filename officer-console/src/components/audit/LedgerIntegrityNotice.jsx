import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function LedgerIntegrityNotice() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <ShieldCheck size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
      <div style={{ fontSize: '0.78125rem', color: 'var(--color-ink)', lineHeight: 1.45 }}>
        <strong>Append-Only Prototype Session Ledger:</strong> Audit events are recorded chronologically during the active officer session. AI triage assessments are explicitly tagged as <em>AI ADVISORY</em> to distinguish automated inferences from statutory <em>OFFICER AUTHORITY</em> signatures. Production deployment transitions this interface to immutable relational ledger tables.
      </div>
    </div>
  );
}
