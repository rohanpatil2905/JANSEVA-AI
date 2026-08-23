import React from 'react';
import { Info, Clock } from 'lucide-react';

export default function TrendNotice() {
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
      <Clock size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
      <div style={{ fontSize: '0.78125rem', color: 'var(--color-ink)', lineHeight: 1.4 }}>
        <strong>Complaint Intake & Multi-Month Longitudinal Trend:</strong> Historical multi-month time-series forecasting is unavailable in the standalone prototype environment. Metrics shown above reflect active municipal registry snapshots and operational decision telemetry.
      </div>
    </div>
  );
}
