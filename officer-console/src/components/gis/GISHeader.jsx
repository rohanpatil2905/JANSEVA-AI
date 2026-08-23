import React from 'react';
import { MapPin, ShieldCheck, Layers } from 'lucide-react';

export default function GISHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Breadcrumb & Title */}
      <div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
          JanSeva AI / GIS Intelligence
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.02em' }}>
              GIS Intelligence
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', margin: '4px 0 0' }}>
              Municipal grievance hotspots, spatial clusters, and ward-level operational intelligence
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-tint)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <MapPin size={14} />
            <span>Pune Municipal Corporation (PMC) GIS Grid</span>
          </div>
        </div>
      </div>

      {/* Governance Notice Banner */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-surface-sunken)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <ShieldCheck size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--color-primary)' }}>STATUTORY GOVERNANCE NOTE:</strong> Spatial intelligence is advisory. Officers retain statutory authority for field action, assignment, escalation, and resolution.
        </div>
      </div>
    </div>
  );
}
