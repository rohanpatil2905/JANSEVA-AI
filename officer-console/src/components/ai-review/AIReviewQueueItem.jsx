import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import PriorityBadge from '../complaints/PriorityBadge';

export default function AIReviewQueueItem({
  complaint,
  isSelected,
  onSelect,
}) {
  const reviewState = complaint.aiReviewState || 'PENDING REVIEW';
  const needsHumanVerification =
    reviewState === 'HUMAN VERIFICATION REQUIRED' ||
    complaint.authenticityStatus === 'Suspicious' ||
    (complaint.aiConfidence || 0) < 75;

  const getReviewBadge = state => {
    switch (state) {
      case 'APPROVED':
        return {
          label: 'Approved',
          bg: 'var(--color-healthy-bg)',
          color: 'var(--color-healthy)',
          border: 'var(--color-healthy-border)',
        };
      case 'MODIFIED':
        return {
          label: 'Modified',
          bg: 'var(--color-high-bg)',
          color: 'var(--color-high)',
          border: 'var(--color-high-border)',
        };
      case 'HUMAN VERIFICATION REQUIRED':
        return {
          label: 'Verification Required',
          bg: 'var(--color-critical-bg)',
          color: 'var(--color-critical)',
          border: 'var(--color-critical-border)',
        };
      case 'PENDING REVIEW':
      default:
        return {
          label: 'Pending Review',
          bg: 'var(--color-primary-tint)',
          color: 'var(--color-primary)',
          border: 'var(--color-border)',
        };
    }
  };

  const badge = getReviewBadge(reviewState);

  return (
    <div
      onClick={() => onSelect(complaint)}
      style={{
        padding: '14px 16px',
        backgroundColor: isSelected ? 'var(--color-primary-tint)' : '#FFFFFF',
        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
        transition: 'all 0.12s ease',
      }}
      className="hover-shadow-sm"
    >
      {/* Top Header Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="mono" style={{ fontSize: '0.8125rem', fontWeight: 800, color: isSelected ? 'var(--color-primary)' : 'var(--color-ink)' }}>
            {complaint.complaintId}
          </span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)' }}>
            &bull; {complaint.ward}
          </span>
        </div>

        <span
          style={{
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.35 }}>
        {complaint.title}
      </div>

      {/* AI Metrics Mini Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          padding: '8px 10px',
          backgroundColor: isSelected ? '#FFFFFF' : 'var(--color-surface-sunken)',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--color-border)',
          fontSize: '0.6875rem',
        }}
      >
        <div>
          <span style={{ color: 'var(--color-ink-muted)' }}>AI Severity: </span>
          <strong style={{ color: complaint.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-high)' }}>
            {complaint.priority} ({complaint.severityScore}/100)
          </strong>
        </div>

        <div>
          <span style={{ color: 'var(--color-ink-muted)' }}>Confidence: </span>
          <strong style={{ color: complaint.aiConfidence >= 90 ? 'var(--color-healthy)' : 'var(--color-ink)' }}>
            {complaint.aiConfidence}%
          </strong>
        </div>

        <div>
          <span style={{ color: 'var(--color-ink-muted)' }}>Dept: </span>
          <strong style={{ color: 'var(--color-primary)' }}>
            {(complaint.recommendedDepartment || complaint.department).split('&')[0]}
          </strong>
        </div>

        <div>
          <span style={{ color: 'var(--color-ink-muted)' }}>Authenticity: </span>
          <strong style={{ color: complaint.authenticityStatus === 'Suspicious' ? 'var(--color-critical)' : 'var(--color-healthy)' }}>
            {complaint.authenticityScore || 98}%
          </strong>
        </div>
      </div>

      {/* Human Verification Callout Tag */}
      {needsHumanVerification && reviewState !== 'APPROVED' && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--color-critical)',
          }}
        >
          <AlertTriangle size={12} />
          <span>Requires Human Review (Low Confidence / Flagged)</span>
        </div>
      )}
    </div>
  );
}
