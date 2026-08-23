import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import Badge from '../ui/Badge';

export default function DuplicateCluster({ complaint }) {
  const navigate = useNavigate();
  const [showRelated, setShowRelated] = useState(false);

  if (!complaint) return null;

  const count = complaint.duplicateCount || 1;
  const masterId = complaint.masterIssueId || `ISSUE-${complaint.complaintId.replace('GRV-', '')}`;

  // Mock cluster records for demo visualization
  const mockClusterItems = [
    { id: `${complaint.complaintId}-D1`, location: complaint.location, date: '1 hour ago', similarity: 96, status: 'AI Grouped', severity: complaint.severityScore },
    { id: `${complaint.complaintId}-D2`, location: `${complaint.ward} Resident Group`, date: '3 hours ago', similarity: 92, status: 'AI Grouped', severity: complaint.severityScore - 2 },
    { id: `${complaint.complaintId}-D3`, location: `${complaint.location.split(',')[0]} Society`, date: '6 hours ago', similarity: 89, status: 'AI Grouped', severity: complaint.severityScore - 4 },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-primary-tint)',
                color: 'var(--color-primary)',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <Copy size={12} /> DUPLICATE & SPATIAL CLUSTER INTELLIGENCE
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Duplicate & Related Grievance Cluster
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            AI spatial and semantic correlation grouping duplicate citizen submissions into single root-cause issues
          </p>
        </div>

        <div
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            Cluster Size
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {count} {count === 1 ? 'Report' : 'Similar Reports'}
          </div>
        </div>
      </div>

      {/* Cluster Meta Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          padding: '12px',
          backgroundColor: 'var(--color-surface-sunken)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          fontSize: '0.75rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>Master Root Issue</div>
          <div className="mono" style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{masterId}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>Affected Ward</div>
          <div style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{complaint.ward}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>Estimated Citizens</div>
          <div style={{ fontWeight: 700, color: 'var(--color-ink)' }}>~{count * 25} Residents</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>Correlation Similarity</div>
          <div style={{ fontWeight: 700, color: 'var(--color-healthy)' }}>91% Avg Match</div>
        </div>
      </div>

      {/* Rationale Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--color-primary-tint)',
          fontSize: '0.72rem',
          color: 'var(--color-primary)',
        }}
      >
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>
          These {count} complaints represent <strong>one underlying infrastructure incident</strong> in {complaint.ward}. Resolving this master issue will notify all linked citizens simultaneously.
        </span>
      </div>

      {/* Expand/Collapse Button */}
      {count > 1 && (
        <div>
          <button
            onClick={() => setShowRelated(prev => !prev)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-primary)',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            {showRelated ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showRelated ? 'Hide Related Cluster Records' : `View Corroborating Reports (${count})`}
          </button>

          {showRelated && (
            <div style={{ marginTop: '10px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-sunken)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                    <th style={{ padding: '8px' }}>Related ID</th>
                    <th style={{ padding: '8px' }}>Spatial Location</th>
                    <th style={{ padding: '8px' }}>Similarity</th>
                    <th style={{ padding: '8px' }}>Severity</th>
                    <th style={{ padding: '8px' }}>Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {mockClusterItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="mono" style={{ padding: '8px', fontWeight: 700, color: 'var(--color-primary)' }}>{item.id}</td>
                      <td style={{ padding: '8px' }}>{item.location}</td>
                      <td style={{ padding: '8px', color: 'var(--color-healthy)', fontWeight: 700 }}>{item.similarity}%</td>
                      <td style={{ padding: '8px' }}>{item.severity}/100</td>
                      <td style={{ padding: '8px', color: 'var(--color-ink-muted)' }}>{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
