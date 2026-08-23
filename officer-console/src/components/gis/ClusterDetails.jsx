import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Layers, MapPin, Building2, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import Modal from '../ui/Modal';

export default function ClusterDetails({
  isOpen,
  onClose,
  complaint,
}) {
  const navigate = useNavigate();

  if (!complaint) return null;

  const count = complaint.duplicateCount || 1;
  const masterId = complaint.masterIssueId || `CLUSTER-2026-${complaint.complaintId.replace('GRV-', '')}`;

  const relatedReports = [
    { id: complaint.complaintId, title: complaint.title, location: complaint.location, time: 'Anchor Report', similarity: 100 },
    { id: `${complaint.complaintId}-D1`, title: 'Secondary pressure drop reported in adjacent lane', location: `${complaint.ward} Block B`, time: '1 hour ago', similarity: 96 },
    { id: `${complaint.complaintId}-D2`, title: 'Society booster pump airlock complaint', location: `${complaint.ward} Sector 4`, time: '3 hours ago', similarity: 92 },
    { id: `${complaint.complaintId}-D3`, title: 'Commercial complex water outage report', location: `${complaint.location.split(',')[0]} Main Road`, time: '5 hours ago', similarity: 89 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CORROBORATING GRIEVANCE CLUSTER"
      maxWidth="560px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Cluster Header Banner */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-ai-tint)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-ai-border)',
            fontSize: '0.78125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span className="mono" style={{ fontWeight: 800, color: 'var(--color-ai)' }}>
              {masterId}
            </span>
            <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
              {count} Similar Citizen Reports
            </span>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.3 }}>
            {complaint.title}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
            Ward: <strong>{complaint.ward}</strong> &bull; Dept: <strong>{complaint.department}</strong>
          </div>
        </div>

        {/* Spatial Correlation Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--color-border)',
            fontSize: '0.72rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ color: 'var(--color-ink-muted)', fontSize: '0.65rem' }}>Spatial Radius</div>
            <strong style={{ color: 'var(--color-ink)' }}>&lt; 350 meters</strong>
          </div>
          <div>
            <div style={{ color: 'var(--color-ink-muted)', fontSize: '0.65rem' }}>Semantic Match</div>
            <strong style={{ color: 'var(--color-healthy)' }}>94% Avg</strong>
          </div>
          <div>
            <div style={{ color: 'var(--color-ink-muted)', fontSize: '0.65rem' }}>Affected Population</div>
            <strong style={{ color: 'var(--color-primary)' }}>~{count * 25} Citizens</strong>
          </div>
        </div>

        {/* List of Corroborating Grievances */}
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Linked Grievance Records ({relatedReports.length} Shown)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {relatedReports.map(rep => (
              <div
                key={rep.id}
                onClick={() => {
                  onClose();
                  navigate(`/complaints/${complaint.complaintId}`);
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
                className="hover-shadow-sm"
              >
                <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                      {rep.id}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-healthy)', fontWeight: 700 }}>
                      &bull; {rep.similarity}% Match
                    </span>
                  </div>
                  <div style={{ color: 'var(--color-ink)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rep.title}
                  </div>
                </div>
                <ArrowRight size={13} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '38px',
              padding: '0 18px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Close Cluster Viewer
          </button>
        </div>
      </div>
    </Modal>
  );
}
