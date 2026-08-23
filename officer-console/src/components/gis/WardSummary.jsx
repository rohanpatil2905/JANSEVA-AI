import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Flame,
  Layers,
} from 'lucide-react';

export default function WardSummary({
  wardData,
  complaints = [],
}) {
  const navigate = useNavigate();

  if (!wardData) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--color-ink-muted)',
          fontSize: '0.8125rem',
        }}
      >
        Select any ward polygon or hotspot card to inspect comprehensive zonal GIS analytics.
      </div>
    );
  }

  const wardComplaints = complaints.filter(c => c.ward === wardData.wardId);

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
      {/* Ward Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {wardData.wardId}
            </span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 800,
                backgroundColor:
                  wardData.hotspotScore >= 80
                    ? 'var(--color-critical-bg)'
                    : wardData.hotspotScore >= 60
                    ? 'var(--color-high-bg)'
                    : 'var(--color-primary-tint)',
                color:
                  wardData.hotspotScore >= 80
                    ? 'var(--color-critical)'
                    : wardData.hotspotScore >= 60
                    ? 'var(--color-high)'
                    : 'var(--color-primary)',
                border:
                  wardData.hotspotScore >= 80
                    ? '1px solid var(--color-critical-border)'
                    : '1px solid var(--color-border)',
              }}
            >
              Hotspot Score: {wardData.hotspotScore} / 100 ({wardData.riskTier} RISK)
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: '2px 0 0' }}>
            {wardData.name}
          </h3>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            Coverage: {wardData.areaKm2 || 4.8} km² &bull; Population: ~{(wardData.totalPopulation || 140000).toLocaleString()} residents
          </div>
        </div>
      </div>

      {/* 3 Metric Breakdown Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {/* Priority Breakdown */}
        <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.72rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--color-ink)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Priority Profile
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Critical:</span> <strong style={{ color: 'var(--color-critical)' }}>{wardData.criticalCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>High:</span> <strong style={{ color: 'var(--color-high)' }}>{wardData.highCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Medium:</span> <strong>{wardData.mediumCount}</strong>
            </div>
          </div>
        </div>

        {/* SLA Breakdown */}
        <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.72rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--color-ink)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            SLA Risk Profile
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>At Risk:</span> <strong style={{ color: 'var(--color-high)' }}>{wardData.slaRiskCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Breached:</span> <strong style={{ color: 'var(--color-critical)' }}>{wardData.slaBreachedCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>On Track:</span> <strong>{Math.max(0, wardData.totalComplaints - wardData.slaRiskCount - wardData.slaBreachedCount)}</strong>
            </div>
          </div>
        </div>

        {/* Departments Breakdown */}
        <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.72rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--color-ink)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Top Departments
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {Object.entries(wardData.departments || {}).slice(0, 3).map(([dept, count]) => (
              <div key={dept} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{dept}:</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Incidents in this Ward List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Active Grievances in {wardData.wardId} ({wardComplaints.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
          {wardComplaints.map(c => (
            <div
              key={c.complaintId}
              onClick={() => navigate(`/complaints/${c.complaintId}`)}
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
                    {c.complaintId}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: c.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-high)', fontWeight: 700 }}>
                    &bull; {c.priority}
                  </span>
                </div>
                <div style={{ color: 'var(--color-ink)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.title}
                </div>
              </div>
              <ArrowRight size={13} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
