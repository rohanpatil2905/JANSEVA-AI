import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Tag,
  Layers,
  MapPin,
  Flame,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  X,
  Copy,
} from 'lucide-react';
import { WARD_SVG_BOUNDS, getComplaintSVGCoordinates } from '../../services/gisService';
import GISLegend from './GISLegend';

export default function GISMapCanvas({
  complaints = [],
  hotspots = [],
  selectedWardId,
  onSelectWard,
  onSelectCluster,
}) {
  const navigate = useNavigate();

  // Map Transformation State (Zoom & Pan)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);

  // Active Map Layer Toggles
  const [layers, setLayers] = useState({
    density: true,
    critical: true,
    slaRisk: true,
    clusters: true,
    suspicious: true,
    hotspots: true,
  });

  // Active Selected Marker Popup
  const [activePopupComplaint, setActivePopupComplaint] = useState(null);

  const toggleLayer = key => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActivePopupComplaint(null);
  };

  // Get hotspot data map by wardId
  const hotspotLookup = {};
  hotspots.forEach(h => {
    hotspotLookup[h.wardId] = h;
  });

  // Filter visible complaints based on active layer toggles
  const visibleComplaints = complaints.filter(c => {
    if (!layers.critical && c.priority === 'Critical') return false;
    if (!layers.slaRisk && (c.slaStatus === 'AT RISK' || c.slaStatus === 'BREACHED')) return false;
    if (!layers.suspicious && c.authenticityStatus === 'Suspicious') return false;
    if (!layers.clusters && c.duplicateCount && c.duplicateCount > 5) return false;
    return true;
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
        position: 'relative',
        minHeight: '620px',
      }}
    >
      {/* Map Control Bar & Layer Toggles Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {/* Layer Checkbox Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Layers:
          </span>

          <button
            type="button"
            onClick={() => toggleLayer('hotspots')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              border: layers.hotspots ? '1px solid var(--color-critical-border)' : '1px solid var(--color-border)',
              backgroundColor: layers.hotspots ? 'var(--color-critical-bg)' : 'var(--color-surface-sunken)',
              color: layers.hotspots ? 'var(--color-critical)' : 'var(--color-ink-muted)',
              cursor: 'pointer',
            }}
          >
            {layers.hotspots ? '✓' : '○'} Ward Hotspots
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('critical')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              border: layers.critical ? '1px solid var(--color-critical-border)' : '1px solid var(--color-border)',
              backgroundColor: layers.critical ? 'var(--color-critical-bg)' : 'var(--color-surface-sunken)',
              color: layers.critical ? 'var(--color-critical)' : 'var(--color-ink-muted)',
              cursor: 'pointer',
            }}
          >
            {layers.critical ? '✓' : '○'} Critical
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('slaRisk')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              border: layers.slaRisk ? '1px solid var(--color-high-border)' : '1px solid var(--color-border)',
              backgroundColor: layers.slaRisk ? 'var(--color-high-bg)' : 'var(--color-surface-sunken)',
              color: layers.slaRisk ? 'var(--color-high)' : 'var(--color-ink-muted)',
              cursor: 'pointer',
            }}
          >
            {layers.slaRisk ? '✓' : '○'} SLA Risk
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('clusters')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              border: layers.clusters ? '1px solid var(--color-ai-border)' : '1px solid var(--color-border)',
              backgroundColor: layers.clusters ? 'var(--color-ai-tint)' : 'var(--color-surface-sunken)',
              color: layers.clusters ? 'var(--color-ai)' : 'var(--color-ink-muted)',
              cursor: 'pointer',
            }}
          >
            {layers.clusters ? '✓' : '○'} Duplicate Clusters
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('suspicious')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              border: layers.suspicious ? '1px solid var(--color-critical-border)' : '1px solid var(--color-border)',
              backgroundColor: layers.suspicious ? 'var(--color-critical-bg)' : 'var(--color-surface-sunken)',
              color: layers.suspicious ? 'var(--color-critical)' : 'var(--color-ink-muted)',
              cursor: 'pointer',
            }}
          >
            {layers.suspicious ? '✓' : '○'} Suspicious
          </button>
        </div>

        {/* Zoom & Pan Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setShowLabels(prev => !prev)}
            title="Toggle Ward Labels"
            style={{ height: '28px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', backgroundColor: showLabels ? 'var(--color-primary-tint)' : '#FFFFFF', color: showLabels ? 'var(--color-primary)' : 'var(--color-ink)', fontSize: '0.6875rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <Tag size={12} /> Labels
          </button>
          <button
            onClick={handleResetView}
            title="Reset View"
            style={{ height: '28px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: 'var(--color-ink)', fontSize: '0.6875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: 1,
          minHeight: '480px',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Prototype Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            fontSize: '0.6875rem',
            color: 'var(--color-ink-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            pointerEvents: 'none',
            backgroundColor: 'rgba(255,255,255,0.85)',
            padding: '2px 8px',
            borderRadius: '3px',
            border: '1px solid var(--color-border)',
          }}
        >
          PROTOTYPE MUNICIPAL GIS VIEW &bull; PUNE MUNICIPAL CORPORATION (PMC)
        </div>

        {/* SVG Viewport */}
        <svg
          viewBox="0 0 800 600"
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '560px',
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Background Grid Pattern */}
          <defs>
            <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#gis-grid)" />

          {/* 1. Ward Polygon Zones */}
          {Object.entries(WARD_SVG_BOUNDS).map(([wId, data]) => {
            const isSelected = selectedWardId === wId;
            const hData = hotspotLookup[wId];
            const score = hData?.hotspotScore || 30;

            // Heatmap color intensity based on score
            let fillColor = 'rgba(2, 132, 199, 0.08)';
            let strokeColor = '#0284c7';
            if (layers.hotspots) {
              if (score >= 80) {
                fillColor = 'rgba(220, 38, 38, 0.22)';
                strokeColor = '#dc2626';
              } else if (score >= 60) {
                fillColor = 'rgba(234, 88, 12, 0.18)';
                strokeColor = '#ea580c';
              } else if (score >= 40) {
                fillColor = 'rgba(2, 132, 199, 0.12)';
                strokeColor = '#0284c7';
              }
            }

            if (isSelected) {
              fillColor = 'rgba(15, 23, 42, 0.18)';
              strokeColor = 'var(--color-primary)';
            }

            return (
              <g key={wId} onClick={() => onSelectWard?.(wId)} style={{ cursor: 'pointer' }}>
                <path
                  d={data.path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 1.5}
                  strokeDasharray={isSelected ? 'none' : '4 2'}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* Ward Label */}
                {showLabels && (
                  <g transform={`translate(${data.center.x}, ${data.center.y - 12})`} style={{ pointerEvents: 'none' }}>
                    <rect
                      x="-55"
                      y="-12"
                      width="110"
                      height="24"
                      rx="4"
                      fill="#FFFFFF"
                      stroke={isSelected ? 'var(--color-primary)' : 'var(--color-border)'}
                      strokeWidth={isSelected ? 2 : 1}
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                    />
                    <text
                      textAnchor="middle"
                      y="4"
                      fontSize="9.5"
                      fontWeight="800"
                      fill={isSelected ? 'var(--color-primary)' : '#0f172a'}
                    >
                      {wId} {hData ? `(${hData.totalComplaints})` : ''}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. Complaint Markers */}
          {visibleComplaints.map((c, idx) => {
            const coords = getComplaintSVGCoordinates(c, idx);
            const isCritical = c.priority === 'Critical';
            const isHigh = c.priority === 'High';
            const isSlaRisk = c.slaStatus === 'AT RISK' || c.slaStatus === 'BREACHED';
            const isCluster = c.duplicateCount && c.duplicateCount > 5;
            const isSelectedMarker = activePopupComplaint?.complaintId === c.complaintId;

            let markerColor = 'var(--color-primary-light)';
            if (isCritical) markerColor = 'var(--color-critical)';
            else if (isHigh) markerColor = 'var(--color-high)';
            else if (c.priority === 'Medium') markerColor = 'var(--color-moderate)';

            return (
              <g
                key={c.complaintId}
                transform={`translate(${coords.x}, ${coords.y})`}
                onClick={e => {
                  e.stopPropagation();
                  setActivePopupComplaint(c);
                  if (onSelectWard) onSelectWard(c.ward);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Critical Pulse Glow */}
                {isCritical && (
                  <circle
                    r="12"
                    fill="var(--color-critical)"
                    opacity="0.25"
                    style={{ animation: 'pulse 1.8s infinite' }}
                  />
                )}

                {/* Cluster Ring */}
                {isCluster && (
                  <circle
                    r="10"
                    fill="none"
                    stroke="var(--color-ai)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Main Node Pin */}
                <circle
                  r={isSelectedMarker ? 7 : 5}
                  fill={markerColor}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
                />
              </g>
            );
          })}
        </svg>

        {/* 3. Interactive Marker Popup Card */}
        {activePopupComplaint && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '320px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-border)',
              padding: '14px 16px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {activePopupComplaint.complaintId}
                </span>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.3, marginTop: '2px' }}>
                  {activePopupComplaint.title}
                </div>
              </div>
              <button
                onClick={() => setActivePopupComplaint(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-muted)', padding: '2px' }}
              >
                <X size={15} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                padding: '8px 10px',
                backgroundColor: 'var(--color-surface-sunken)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.6875rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-ink-muted)' }}>Ward: </span>
                <strong>{activePopupComplaint.ward}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-ink-muted)' }}>Priority: </span>
                <strong style={{ color: activePopupComplaint.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-high)' }}>
                  {activePopupComplaint.priority} ({activePopupComplaint.severityScore}/100)
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-ink-muted)' }}>Dept: </span>
                <strong>{activePopupComplaint.department.split('&')[0]}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-ink-muted)' }}>SLA: </span>
                <strong style={{ color: activePopupComplaint.slaStatus === 'BREACHED' ? 'var(--color-critical)' : 'var(--color-high)' }}>
                  {activePopupComplaint.slaStatus}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <button
                type="button"
                onClick={() => navigate(`/complaints/${activePopupComplaint.complaintId}`)}
                style={{
                  flex: 1,
                  height: '34px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <span>Review Grievance</span>
                <ArrowRight size={13} />
              </button>

              {activePopupComplaint.duplicateCount > 1 && (
                <button
                  type="button"
                  onClick={() => onSelectCluster?.(activePopupComplaint)}
                  style={{
                    height: '34px',
                    padding: '0 10px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--color-ai-tint)',
                    color: 'var(--color-ai)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    border: '1px solid var(--color-ai-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Copy size={13} />
                  <span>Cluster ({activePopupComplaint.duplicateCount})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <GISLegend />
    </div>
  );
}
