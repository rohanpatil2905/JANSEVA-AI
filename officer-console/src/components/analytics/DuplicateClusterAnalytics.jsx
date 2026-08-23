import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, ArrowRight, Layers } from 'lucide-react';

export default function DuplicateClusterAnalytics({ clusterStats }) {
  const navigate = useNavigate();

  const {
    clusteredTicketsCount = 0,
    totalCorroboratingReports = 0,
    largestCluster = { id: 'N/A', count: 0, title: 'None', ward: 'N/A', complaintId: '' },
    avgClusterSize = '1.0',
  } = clusterStats || {};

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
          <Copy size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Duplicate & Spatial Cluster Intelligence
          </h3>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Spatial root-cause deduplication
        </span>
      </div>

      {/* 3 Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{ padding: '10px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            Clustered Incidents
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
            {clusteredTicketsCount}
          </div>
        </div>

        <div style={{ padding: '10px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            Citizen Reports
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-healthy)', marginTop: '2px' }}>
            {totalCorroboratingReports}
          </div>
        </div>

        <div style={{ padding: '10px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            Avg Cluster Size
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>
            {avgClusterSize}
          </div>
        </div>
      </div>

      {/* Largest Cluster Card */}
      {largestCluster.count > 0 && (
        <div
          onClick={() => {
            if (largestCluster.complaintId) {
              navigate(`/complaints/${largestCluster.complaintId}`);
            }
          }}
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-ai-tint)',
            border: '1px solid var(--color-ai-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            cursor: largestCluster.complaintId ? 'pointer' : 'default',
          }}
          className="hover-shadow-sm"
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-ai)' }}>
                {largestCluster.id}
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                &bull; {largestCluster.count} Citizen Reports ({largestCluster.ward})
              </span>
            </div>
            <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {largestCluster.title}
            </div>
          </div>
          <ArrowRight size={14} color="var(--color-ai)" style={{ flexShrink: 0 }} />
        </div>
      )}
    </div>
  );
}
