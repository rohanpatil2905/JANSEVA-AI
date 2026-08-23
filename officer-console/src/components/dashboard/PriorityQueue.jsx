import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Clock,
  Copy,
  ArrowRight,
  Sparkles,
  MapPin,
  Flame,
} from 'lucide-react';
import Badge from '../ui/Badge';

export default function PriorityQueue({ complaints = [], loading = false }) {
  const navigate = useNavigate();

  // Top priority items sorted by severityScore descending
  const priorityItems = [...complaints]
    .sort((a, b) => (b.severityScore || 0) - (a.severityScore || 0))
    .slice(0, 5);

  const getPriorityVariant = priority => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'moderate';
      case 'low':
        return 'low';
      default:
        return 'default';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-ai-tint)',
                color: 'var(--color-ai)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              <BrainCircuit size={12} /> AI PRIORITIZED QUEUE
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)' }}>
              AI recommendation &bull; Officer decides
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-ink)' }}>
            AI Priority Queue
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            Complaints ranked by AI-generated severity, urgency, and operational impact
          </p>
        </div>

        <button
          onClick={() => navigate('/complaints')}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-sunken)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          View All ({complaints.length}) &rarr;
        </button>
      </div>

      {/* List of Queue Cards (Full width utilization) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: 'var(--text-sm)' }}>
            Loading AI Priority Queue...
          </div>
        ) : priorityItems.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: 'var(--text-sm)' }}>
            No critical grievances in queue.
          </div>
        ) : (
          priorityItems.map(item => (
            <div
              key={item.complaintId}
              style={{
                backgroundColor: item.priority === 'Critical' ? 'rgba(220, 38, 38, 0.02)' : 'var(--color-surface)',
                border: item.priority === 'Critical' ? '1px solid #FECACA' : '1px solid var(--color-border)',
                borderLeft: item.priority === 'Critical' ? '4px solid var(--color-critical)' : '4px solid var(--color-high)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'box-shadow 0.12s ease, transform 0.12s ease',
              }}
              className="hover-shadow-sm"
            >
              {/* Left & Middle Info Block */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Meta Top Line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span className="mono" style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--color-primary)' }}>
                    {item.complaintId}
                  </span>
                  <Badge variant={getPriorityVariant(item.priority)} size="sm">
                    {item.priority} &bull; {item.severityScore}/100
                  </Badge>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', fontWeight: 500 }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-faint)' }}>&bull;</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                    <MapPin size={12} color="var(--color-ink-faint)" />
                    <span>{item.ward}</span>
                  </div>
                </div>

                {/* Complaint Title */}
                <h4
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    lineHeight: 1.3,
                    marginBottom: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={item.title}
                >
                  {item.title}
                </h4>

                {/* Signals Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    fontSize: '0.72rem',
                    color: 'var(--color-ink-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-ai)', fontWeight: 600 }}>
                    <Sparkles size={12} />
                    <span>AI Confidence: {item.aiConfidence}%</span>
                  </div>

                  {item.duplicateCount > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-ink)', fontWeight: 600 }}>
                      <Copy size={12} />
                      <span>{item.duplicateCount} similar reports</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} color={item.slaStatus === 'BREACHED' ? 'var(--color-critical)' : 'var(--color-high)'} />
                    <span style={{ fontWeight: 600, color: item.slaStatus === 'BREACHED' ? 'var(--color-critical)' : 'var(--color-high)' }}>
                      SLA: {item.slaStatus} {item.slaRemainingHours > 0 ? `(${item.slaRemainingHours}h remaining)` : '(Overdue)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Button */}
              <button
                onClick={() => navigate(`/complaints/${item.complaintId}`)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-xs)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Review Complaint <ArrowRight size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
