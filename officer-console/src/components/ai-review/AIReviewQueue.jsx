import React, { useState } from 'react';
import { Search, Sparkles, Inbox, AlertTriangle } from 'lucide-react';
import AIReviewQueueItem from './AIReviewQueueItem';

export default function AIReviewQueue({
  complaints = [],
  selectedComplaintId,
  onSelectComplaint,
  onResetFilters,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Intelligent Prioritized Sorting:
  // 1. Human review required
  // 2. Critical severity
  // 3. SLA urgency
  // 4. Low AI confidence
  // 5. Suspicious authenticity
  // 6. Remaining
  const sortedComplaints = [...complaints].sort((a, b) => {
    const aNeedsReview =
      a.aiReviewState === 'HUMAN VERIFICATION REQUIRED' ||
      a.authenticityStatus === 'Suspicious' ||
      (a.aiConfidence || 0) < 75;
    const bNeedsReview =
      b.aiReviewState === 'HUMAN VERIFICATION REQUIRED' ||
      b.authenticityStatus === 'Suspicious' ||
      (b.aiConfidence || 0) < 75;

    if (aNeedsReview && !bNeedsReview) return -1;
    if (!aNeedsReview && bNeedsReview) return 1;

    // Severity
    if ((b.severityScore || 0) !== (a.severityScore || 0)) {
      return (b.severityScore || 0) - (a.severityScore || 0);
    }

    // SLA
    if (a.slaStatus === 'BREACHED' && b.slaStatus !== 'BREACHED') return -1;
    if (a.slaStatus !== 'BREACHED' && b.slaStatus === 'BREACHED') return 1;

    return 0;
  });

  // Client-side quick search
  const filteredList = sortedComplaints.filter(c => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.complaintId.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.ward.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
      }}
    >
      {/* Header Strip & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="var(--color-ai)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            AI Review Queue
          </h3>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--color-ink-muted)',
            }}
          >
            {filteredList.length}
          </span>
        </div>

        <div style={{ position: 'relative', minWidth: '160px', flex: 1, maxWidth: '240px' }}>
          <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-faint)' }} />
          <input
            type="text"
            placeholder="Search queue..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: '32px',
              paddingLeft: '26px',
              paddingRight: '8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.75rem',
              backgroundColor: 'var(--color-surface-sunken)',
            }}
          />
        </div>
      </div>

      {/* Queue Items List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 360px)',
          minHeight: '400px',
          paddingRight: '4px',
        }}
      >
        {filteredList.length === 0 ? (
          <div
            style={{
              padding: '40px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--color-ink-muted)',
            }}
          >
            <Inbox size={32} color="var(--color-ink-faint)" />
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ink)' }}>
              AI Review Queue Empty
            </div>
            <div style={{ fontSize: '0.75rem', maxWidth: '240px', lineHeight: 1.4 }}>
              No AI recommendations match your active filter criteria.
            </div>
            {onResetFilters && (
              <button
                onClick={onResetFilters}
                style={{
                  marginTop: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          filteredList.map(item => (
            <AIReviewQueueItem
              key={item.complaintId}
              complaint={item}
              isSelected={item.complaintId === selectedComplaintId}
              onSelect={onSelectComplaint}
            />
          ))
        )}
      </div>
    </div>
  );
}
