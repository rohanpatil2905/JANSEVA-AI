import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Flame } from 'lucide-react';

export default function WardPerformanceTable({ wardStats = [] }) {
  const navigate = useNavigate();

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
          <MapPin size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Ward Operational Overview & Hotspot Index
          </h3>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Click row to inspect in GIS Intelligence
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78125rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-sunken)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>
              <th style={{ padding: '10px 12px' }}>Ward Zone</th>
              <th style={{ padding: '10px 12px' }}>Complaints</th>
              <th style={{ padding: '10px 12px' }}>Critical</th>
              <th style={{ padding: '10px 12px' }}>SLA Risk</th>
              <th style={{ padding: '10px 12px' }}>Breached</th>
              <th style={{ padding: '10px 12px' }}>Hotspot Score</th>
              <th style={{ padding: '10px 12px' }}>Top Department</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {wardStats.map(ward => (
              <tr
                key={ward.wardId}
                onClick={() => navigate('/gis-map')}
                style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                className="hover-shadow-sm"
              >
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
                    {ward.wardId}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
                    {ward.name.split('&')[0]}
                  </div>
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--color-ink)' }}>
                  {ward.totalComplaints}
                </td>
                <td style={{ padding: '10px 12px', color: ward.criticalCount > 0 ? 'var(--color-critical)' : 'var(--color-ink)', fontWeight: 700 }}>
                  {ward.criticalCount}
                </td>
                <td style={{ padding: '10px 12px', color: ward.slaRiskCount > 0 ? 'var(--color-high)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                  {ward.slaRiskCount}
                </td>
                <td style={{ padding: '10px 12px', color: ward.slaBreachedCount > 0 ? 'var(--color-critical)' : 'var(--color-ink-muted)', fontWeight: 700 }}>
                  {ward.slaBreachedCount}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      backgroundColor:
                        ward.hotspotScore >= 80
                          ? 'var(--color-critical-bg)'
                          : ward.hotspotScore >= 60
                          ? 'var(--color-high-bg)'
                          : 'var(--color-primary-tint)',
                      color:
                        ward.hotspotScore >= 80
                          ? 'var(--color-critical)'
                          : ward.hotspotScore >= 60
                          ? 'var(--color-high)'
                          : 'var(--color-primary)',
                      border:
                        ward.hotspotScore >= 80
                          ? '1px solid var(--color-critical-border)'
                          : '1px solid var(--color-border)',
                    }}
                  >
                    {ward.hotspotScore} / 100
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--color-ink)' }}>
                  {ward.dominantCategory || 'General'}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    GIS Map <ArrowRight size={12} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
