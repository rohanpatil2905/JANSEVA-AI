import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { SeverityBadge } from '../../components/common/Badge';
import { gisAPI } from '../../services/api';
import {
  FaMapMarkedAlt,
  FaFilter,
  FaSyncAlt,
  FaCrosshairs,
  FaLayerGroup,
  FaExclamationTriangle,
  FaFire,
} from 'react-icons/fa';

export default function GISMap() {
  const [hotspots, setHotspots] = useState([]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [precision, setPrecision] = useState(3);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const fetchGISData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { precision };
      if (statusFilter) params.status = statusFilter;

      const [hotspotRes, pointsRes] = await Promise.all([
        gisAPI.getHotspots(params),
        gisAPI.getHeatmapPoints(params).catch(() => ({ points: [] })),
      ]);

      setHotspots(hotspotRes.hotspots || []);
      setPoints(pointsRes.points || []);
      if (hotspotRes.hotspots?.length) {
        setSelectedHotspot(hotspotRes.hotspots[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load GIS spatial hotspots from PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGISData();
  }, [precision, statusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/dashboard" label="Dashboard" />
        <button onClick={fetchGISData} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt /> Refresh Map Data
        </button>
      </div>

      {/* Header & Controls */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
              }}
            >
              <FaMapMarkedAlt />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem' }}>GIS Spatial Hotspots Explorer</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Grid-bucketed spatial clustering without PostGIS dependency (Vanilla PostgreSQL Haversine).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Precision Grid:</span>
              <select
                className="form-select"
                value={precision}
                onChange={(e) => setPrecision(Number(e.target.value))}
                style={{ width: '130px', padding: '6px 10px' }}
              >
                <option value={2}>2 (~1.1 km)</option>
                <option value={3}>3 (~110 m)</option>
                <option value={4}>4 (~11 m)</option>
              </select>
            </div>

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px', padding: '6px 10px' }}
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Computing spatial clusters and hotspots..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchGISData} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          {/* Visual Hotspot Map Canvas */}
          <div
            className="card"
            style={{
              minHeight: '480px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '24px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {/* Map Header Overlay */}
            <div style={{ zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                <FaCrosshairs style={{ color: 'var(--primary-400)', marginRight: '6px' }} />
                <span>Active Hotspot Clusters: <strong>{hotspots.length}</strong></span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                <FaFire style={{ color: 'var(--saffron-500)', marginRight: '6px' }} />
                <span>Raw Data Points: <strong>{points.length}</strong></span>
              </div>
            </div>

            {/* Simulated Interactive GIS Grid Map Canvas */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Grid Lines */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Clustered Hotspot Pins */}
              {hotspots.map((h, i) => {
                const isSelected = selectedHotspot === h;
                const size = Math.min(80, Math.max(36, h.complaint_count * 14));
                const posX = 20 + ((i * 35) % 70);
                const posY = 25 + ((i * 28) % 60);

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedHotspot(h)}
                    style={{
                      position: 'absolute',
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: 'translate(-50%, -50%)',
                      width: `${size}px`,
                      height: `${size}px`,
                      borderRadius: '50%',
                      background: h.avg_severity >= 70
                        ? 'radial-gradient(circle, rgba(220, 38, 38, 0.9) 0%, rgba(220, 38, 38, 0.3) 70%)'
                        : 'radial-gradient(circle, rgba(0, 110, 230, 0.9) 0%, rgba(0, 110, 230, 0.3) 70%)',
                      border: isSelected ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 20px #ffffff' : '0 0 10px rgba(0, 110, 230, 0.5)',
                      transition: 'all 0.2s ease',
                      zIndex: isSelected ? 20 : 5,
                    }}
                    title={`Lat: ${h.center_lat?.toFixed(4)}, Lng: ${h.center_lng?.toFixed(4)} (${h.complaint_count} complaints)`}
                  >
                    {h.complaint_count}
                  </div>
                );
              })}
            </div>

            {/* Map Legend Footer */}
            <div
              style={{
                zIndex: 10,
                display: 'flex',
                gap: '16px',
                background: 'rgba(15, 23, 42, 0.85)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                alignSelf: 'flex-start',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }} />
                <span>High Severity Cluster (&ge; 70)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#006ee6' }} />
                <span>Standard Density Cluster</span>
              </div>
            </div>
          </div>

          {/* Hotspot Cluster Inspector Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Hotspot Cluster Details</h3>

              {selectedHotspot ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coordinates</div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {selectedHotspot.center_lat?.toFixed(5)}, {selectedHotspot.center_lng?.toFixed(5)}
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ward 12 Municipal Sector</div>
                  </div>

                  <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                    <div style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Complaints in Cell</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedHotspot.complaint_count}</div>
                    </div>

                    <div style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Avg Severity</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--critical-text)' }}>
                        {selectedHotspot.avg_severity || '75'}/100
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Dominant Status:</span>{' '}
                    <strong style={{ textTransform: 'capitalize' }}>{selectedHotspot.dominant_status || 'Submitted'}</strong>
                  </div>

                  {selectedHotspot.complaint_ids?.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Linked Complaints ({selectedHotspot.complaint_ids.length}):
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                        {selectedHotspot.complaint_ids.slice(0, 4).map((cid) => (
                          <Link
                            key={cid}
                            to={`/officer/complaints/${cid}`}
                            className="btn btn-secondary btn-sm"
                            style={{ justifyContent: 'space-between', fontSize: '0.8rem' }}
                          >
                            <span>Complaint #{cid.slice(0, 8)}</span>
                            <span>Inspect &rarr;</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState title="No hotspot selected" description="Click on any map cluster to view localized complaints." />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
