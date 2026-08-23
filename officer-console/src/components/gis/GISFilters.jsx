import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { MUNICIPAL_DEPARTMENTS, MUNICIPAL_WARDS } from '../../data/mockData';

export default function GISFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
}) {
  const handleChange = (key, val) => {
    onFilterChange(prev => ({
      ...prev,
      [key]: val,
    }));
  };

  const isFiltered =
    Boolean(searchTerm.trim()) ||
    filters.priority !== 'All' ||
    filters.department !== 'All' ||
    filters.ward !== 'All' ||
    filters.slaStatus !== 'All' ||
    filters.authenticity !== 'All' ||
    filters.clusterStatus !== 'All';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 18px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Top Row: Search & Reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-faint)' }} />
          <input
            type="text"
            placeholder="Search ward, complaint ID, location, or department..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              paddingLeft: '32px',
              paddingRight: '12px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-surface-sunken)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
            <span>Data Mode:</span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-primary-tint)',
                color: 'var(--color-primary)',
                fontWeight: 700,
              }}
            >
              All Active Records
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bottom Filter Controls Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
        }}
      >
        {/* 1. Priority */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={e => handleChange('priority', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* 2. Department */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Department
          </label>
          <select
            value={filters.department}
            onChange={e => handleChange('department', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Departments</option>
            {Object.values(MUNICIPAL_DEPARTMENTS).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* 3. Ward */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Ward Zone
          </label>
          <select
            value={filters.ward}
            onChange={e => handleChange('ward', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Municipal Wards</option>
            {MUNICIPAL_WARDS.map(w => (
              <option key={w.wardId} value={w.wardId}>
                {w.wardId} ({w.name.split('&')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* 4. SLA Status */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            SLA Risk
          </label>
          <select
            value={filters.slaStatus}
            onChange={e => handleChange('slaStatus', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All SLA Statuses</option>
            <option value="AT RISK">SLA At Risk</option>
            <option value="BREACHED">SLA Breached</option>
            <option value="ON TRACK">On Track</option>
          </select>
        </div>

        {/* 5. Authenticity */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Authenticity
          </label>
          <select
            value={filters.authenticity}
            onChange={e => handleChange('authenticity', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Authenticity</option>
            <option value="Likely Genuine">Likely Genuine</option>
            <option value="Needs Verification">Needs Verification</option>
            <option value="Suspicious">Suspicious Activity</option>
          </select>
        </div>

        {/* 6. Cluster Status */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Cluster Status
          </label>
          <select
            value={filters.clusterStatus}
            onChange={e => handleChange('clusterStatus', e.target.value)}
            style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.78125rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Incidents</option>
            <option value="clustered">Duplicate Clusters (5+ Reports)</option>
            <option value="single">Single Incidents</option>
          </select>
        </div>
      </div>
    </div>
  );
}
