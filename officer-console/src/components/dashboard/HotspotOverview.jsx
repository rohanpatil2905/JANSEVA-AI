import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Map, Flame, ArrowRight, Layers } from 'lucide-react';
import Badge from '../ui/Badge';

export default function HotspotOverview({ hotspots = [], loading = false }) {
  const navigate = useNavigate();

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
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-tint)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MapPin size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)' }}>
              Ward Hotspot Overview
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
              Geospatial cluster density across high-frequency wards
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/gis-map')}
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          View GIS Map &rarr;
        </button>
      </div>

      {/* Hotspots List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: 'var(--text-sm)' }}>
            Loading ward hotspots...
          </div>
        ) : hotspots.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: 'var(--text-sm)' }}>
            No active hotspots detected.
          </div>
        ) : (
          hotspots.slice(0, 4).map(spot => (
            <div
              key={spot.wardId}
              style={{
                backgroundColor: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Row 1: Ward & Count */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-ink)' }}>
                    {spot.wardId}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', marginLeft: '6px' }}>
                    {spot.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-primary)' }}>
                    {spot.totalComplaints}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)' }}>complaints</span>
                </div>
              </div>

              {/* Row 2: Categories Breakdown Pill List */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.6875rem' }}>
                {Object.entries(spot.categories || {}).map(([cat, count]) => (
                  <span
                    key={cat}
                    style={{
                      padding: '2px 7px',
                      borderRadius: '3px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-ink)',
                      fontWeight: 500,
                    }}
                  >
                    {cat}: <strong>{count}</strong>
                  </span>
                ))}
              </div>

              {/* Row 3: Severity Ratios & Hotspot trigger */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.6875rem',
                  color: 'var(--color-ink-muted)',
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  paddingTop: '6px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--color-critical)', fontWeight: 700 }}>
                    Critical: {spot.criticalCount}
                  </span>
                  <span style={{ color: 'var(--color-high)', fontWeight: 700 }}>
                    High: {spot.highCount}
                  </span>
                  <span>
                    Medium: {spot.mediumCount}
                  </span>
                </div>

                <span style={{ color: 'var(--color-ink-faint)' }}>
                  Area: {spot.affectedAreaKm2} km²
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
