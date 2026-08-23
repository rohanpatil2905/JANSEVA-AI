import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { MUNICIPAL_DEPARTMENTS, MUNICIPAL_WARDS } from '../../data/mockData';

export default function AIReviewFilters({
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
    filters.reviewState !== 'All' ||
    filters.confidence !== 'All' ||
    filters.severity !== 'All' ||
    filters.authenticity !== 'All' ||
    filters.department !== 'All' ||
    filters.ward !== 'All';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)' }}>
          <Filter size={14} color="var(--color-primary)" />
          <span>Review Filters & Triage Controls</span>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
        }}
      >
        {/* 1. Review State */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Review State
          </label>
          <select
            value={filters.reviewState}
            onChange={e => handleChange('reviewState', e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
            }}
          >
            <option value="All">All Review States</option>
            <option value="PENDING REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="MODIFIED">Modified</option>
            <option value="HUMAN VERIFICATION REQUIRED">Human Verification Required</option>
          </select>
        </div>

        {/* 2. AI Confidence */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            AI Confidence
          </label>
          <select
            value={filters.confidence}
            onChange={e => handleChange('confidence', e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
            }}
          >
            <option value="All">All Confidences</option>
            <option value="high">≥90% (High Certainty)</option>
            <option value="med">75% – 89% (Moderate)</option>
            <option value="low">&lt;75% (Low Certainty)</option>
          </select>
        </div>

        {/* 3. Severity Level */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Severity Level
          </label>
          <select
            value={filters.severity}
            onChange={e => handleChange('severity', e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
            }}
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* 4. Authenticity Status */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Authenticity
          </label>
          <select
            value={filters.authenticity}
            onChange={e => handleChange('authenticity', e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
            }}
          >
            <option value="All">All Authenticity</option>
            <option value="Likely Genuine">Likely Genuine</option>
            <option value="Needs Verification">Needs Verification</option>
            <option value="Suspicious">Suspicious / Abuse</option>
          </select>
        </div>

        {/* 5. Department */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Department
          </label>
          <select
            value={filters.department}
            onChange={e => handleChange('department', e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
            }}
          >
            <option value="All">All Departments</option>
            {Object.values(MUNICIPAL_DEPARTMENTS).map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Ward */}
        <div>
          <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-ink-muted)', display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
            Municipal Ward
          </label>
          <select
            value={filters.ward}
            onChange={e => handleChange('ward', e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
            }}
          >
            <option value="All">All Wards</option>
            {MUNICIPAL_WARDS.map(w => (
              <option key={w.wardId} value={w.wardId}>
                {w.wardId} ({w.name})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
