import React from 'react';
import { Flame, AlertTriangle, Clock, Copy, ChevronRight, Building2 } from 'lucide-react';

export default function HotspotPanel({
  hotspots = [],
  selectedWardId,
  onSelectWard,
}) {
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
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={16} color="var(--color-critical)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Municipal Hotspots
          </h3>
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>
          Ranked by Risk Score
        </span>
      </div>

      {/* Hotspots Card List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
        {hotspots.map(h => {
          const isSelected = selectedWardId === h.wardId;
          const isCritical = h.hotspotScore >= 80;
          const isHigh = h.hotspotScore >= 60 && h.hotspotScore < 80;

          return (
            <div
              key={h.wardId}
              onClick={() => onSelectWard(h.wardId)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-primary-tint)' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.12s ease',
              }}
              className="hover-shadow-sm"
            >
              {/* Row 1: Ward ID & Hotspot Score Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '0.875rem', fontWeight: 800, color: isSelected ? 'var(--color-primary)' : 'var(--color-ink)' }}>
                      {h.wardId}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                      &bull; {h.name.split('&')[0]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                    {h.totalComplaints} Active Complaints &bull; Main: <strong>{h.dominantCategory}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      backgroundColor: isCritical
                        ? 'var(--color-critical-bg)'
                        : isHigh
                        ? 'var(--color-high-bg)'
                        : 'var(--color-primary-tint)',
                      color: isCritical
                        ? 'var(--color-critical)'
                        : isHigh
                        ? 'var(--color-high)'
                        : 'var(--color-primary)',
                      border: isCritical
                        ? '1px solid var(--color-critical-border)'
                        : isHigh
                        ? '1px solid var(--color-high-border)'
                        : '1px solid var(--color-border)',
                    }}
                  >
                    Hotspot {h.hotspotScore}/100
                  </div>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-ink-muted)', marginTop: '2px', textTransform: 'uppercase' }}>
                    {h.riskTier} RISK
                  </div>
                </div>
              </div>

              {/* Row 2: Metrics Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '4px',
                  padding: '6px 8px',
                  backgroundColor: isSelected ? '#FFFFFF' : 'var(--color-surface-sunken)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.6875rem',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ color: 'var(--color-ink-muted)', fontSize: '0.625rem' }}>Critical</div>
                  <strong style={{ color: h.criticalCount > 0 ? 'var(--color-critical)' : 'var(--color-ink)' }}>{h.criticalCount}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--color-ink-muted)', fontSize: '0.625rem' }}>High</div>
                  <strong style={{ color: h.highCount > 0 ? 'var(--color-high)' : 'var(--color-ink)' }}>{h.highCount}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--color-ink-muted)', fontSize: '0.625rem' }}>SLA Risk</div>
                  <strong style={{ color: h.slaRiskCount > 0 ? 'var(--color-high)' : 'var(--color-ink)' }}>{h.slaRiskCount}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--color-ink-muted)', fontSize: '0.625rem' }}>Cluster</div>
                  <strong style={{ color: h.duplicateClustersCount > 0 ? 'var(--color-ai)' : 'var(--color-ink)' }}>{h.duplicateClustersCount}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
