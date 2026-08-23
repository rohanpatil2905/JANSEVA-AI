import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  ArrowRight,
  ArrowUpRight,
  FileText,
  RotateCcw,
} from 'lucide-react';

export default function ComplaintLifecycleTrace({
  complaints = [],
  initialComplaintId = 'GRV-2026-0142',
}) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(initialComplaintId);
  const [searchInput, setSearchInput] = useState('');

  const selectedComplaint = complaints.find(c => c.complaintId === selectedId) || complaints[0];

  const handleSearch = e => {
    e.preventDefault();
    if (searchInput.trim()) {
      const found = complaints.find(
        c => c.complaintId.toLowerCase() === searchInput.trim().toLowerCase()
      );
      if (found) {
        setSelectedId(found.complaintId);
        setSearchInput('');
      }
    }
  };

  if (!selectedComplaint) return null;

  const history = selectedComplaint.auditHistory || [];

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
      {/* Header & Complaint Picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Complaint Lifecycle Trace & Audit Path
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', margin: '2px 0 0' }}>
            Complete chronological audit timeline for selected grievance
          </p>
        </div>

        {/* Complaint Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{
              height: '34px',
              padding: '0 10px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78125rem',
              fontWeight: 700,
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-primary)',
            }}
          >
            {complaints.map(c => (
              <option key={c.complaintId} value={c.complaintId}>
                {c.complaintId} — {c.title.slice(0, 32)}...
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => navigate(`/complaints/${selectedComplaint.complaintId}`)}
            style={{
              height: '34px',
              padding: '0 12px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <span>Open Case</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Complaint Context Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '10px 12px',
          backgroundColor: 'var(--color-surface-sunken)',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--color-border)',
          fontSize: '0.75rem',
        }}
      >
        <div>
          <span style={{ color: 'var(--color-ink-muted)' }}>Status: </span>
          <strong style={{ color: 'var(--color-primary)' }}>{selectedComplaint.status}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--color-ink-muted)' }}>Ward: </span>
          <strong>{selectedComplaint.ward}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--color-ink-muted)' }}>Dept: </span>
          <strong>{selectedComplaint.department.split('&')[0]}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--color-ink-muted)' }}>Officer: </span>
          <strong>{selectedComplaint.assignedOfficer || 'Unassigned'}</strong>
        </div>
      </div>

      {/* Chronological Step-by-Step Flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', paddingLeft: '16px' }}>
        {/* Vertical Connecting Line */}
        <div
          style={{
            position: 'absolute',
            left: '23px',
            top: '12px',
            bottom: '12px',
            width: '2px',
            backgroundColor: 'var(--color-border)',
            zIndex: 1,
          }}
        />

        {history.map((step, idx) => {
          const isLast = idx === history.length - 1;
          const isAI = (step.role || '').toLowerCase().includes('ai');
          const isCitizen = (step.role || '').toLowerCase().includes('citizen');

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                paddingBottom: isLast ? '0' : '16px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Node Icon */}
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: isLast
                    ? 'var(--color-healthy)'
                    : isAI
                    ? 'var(--color-ai)'
                    : isCitizen
                    ? 'var(--color-primary)'
                    : 'var(--color-primary-light)',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 0 0 1px var(--color-border)',
                  flexShrink: 0,
                  marginTop: '3px',
                }}
              />

              {/* Step Content Card */}
              <div
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: isLast ? 'var(--color-healthy-bg)' : '#FFFFFF',
                  border: isLast ? '1px solid var(--color-healthy-border)' : '1px solid var(--color-border)',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: isLast ? 'var(--color-healthy)' : 'var(--color-ink)' }}>
                      {step.actor}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
                      ({step.role})
                    </span>
                  </div>

                  <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
                    {new Date(step.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div style={{ color: 'var(--color-ink)', lineHeight: 1.35, fontWeight: 500 }}>
                  {step.action}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
