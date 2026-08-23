import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { MUNICIPAL_DEPARTMENTS, MUNICIPAL_WARDS } from '../../data/mockData';

export default function AnalyticsFilters({
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
    filters.department !== 'All' ||
    filters.ward !== 'All' ||
    filters.priority !== 'All' ||
    filters.slaStatus !== 'All' ||
    filters.authenticity !== 'All' ||
    filters.reviewState !== 'All';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)' }}>
          <Filter size={14} color="var(--color-primary)" />
          <span>Filter Analytics Scope</span>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
        }}
      >
        {/* Department */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Department
          </label>
          <select
            value={filters.department}
            onChange={e => handleChange('department', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Departments</option>
            {Object.values(MUNICIPAL_DEPARTMENTS).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Ward Zone
          </label>
          <select
            value={filters.ward}
            onChange={e => handleChange('ward', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Wards</option>
            {MUNICIPAL_WARDS.map(w => (
              <option key={w.wardId} value={w.wardId}>
                {w.wardId} ({w.name.split('&')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={e => handleChange('priority', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* SLA Status */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            SLA Status
          </label>
          <select
            value={filters.slaStatus}
            onChange={e => handleChange('slaStatus', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All SLA States</option>
            <option value="ON TRACK">On Track</option>
            <option value="AT RISK">At Risk</option>
            <option value="BREACHED">Breached</option>
          </select>
        </div>

        {/* Authenticity */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Integrity Signal
          </label>
          <select
            value={filters.authenticity}
            onChange={e => handleChange('authenticity', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Signals</option>
            <option value="Likely Genuine">Likely Genuine</option>
            <option value="Needs Verification">Needs Verification</option>
            <option value="Suspicious">Suspicious</option>
          </select>
        </div>

        {/* Review State */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            AI Review State
          </label>
          <select
            value={filters.reviewState}
            onChange={e => handleChange('reviewState', e.target.value)}
            style={{ width: '100%', height: '32px', padding: '0 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '0.75rem', backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
          >
            <option value="All">All Review States</option>
            <option value="APPROVED">AI Approved</option>
            <option value="MODIFIED">AI Modified</option>
            <option value="HUMAN VERIFICATION REQUIRED">Human Verification</option>
            <option value="PENDING REVIEW">Pending Review</option>
          </select>
        </div>
      </div>
    </div>
  );
}
