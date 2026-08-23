import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Sparkles,
  UserCheck,
  User,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

export default function AuditLedgerTable({
  records = [],
  onSelectEvent,
}) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const paginatedRecords = records.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getActorIcon = type => {
    if (type === 'AI Engine') return <Sparkles size={12} color="var(--color-ai)" />;
    if (type === 'Citizen') return <User size={12} color="var(--color-primary)" />;
    return <UserCheck size={12} color="var(--color-primary)" />;
  };

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
          <History size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Immutable Investigation Ledger
          </h3>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          Showing <strong>{records.length}</strong> chronological audit entries &bull; Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78125rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-sunken)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>
              <th style={{ padding: '10px 12px' }}>Timestamp</th>
              <th style={{ padding: '10px 12px' }}>Event Type</th>
              <th style={{ padding: '10px 12px' }}>Complaint ID</th>
              <th style={{ padding: '10px 12px' }}>Actor & Role</th>
              <th style={{ padding: '10px 12px' }}>Ward & Dept</th>
              <th style={{ padding: '10px 12px' }}>Operational Action</th>
              <th style={{ padding: '10px 12px' }}>Authority</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
                  No audit records match the current filter criteria.
                </td>
              </tr>
            ) : (
              paginatedRecords.map(rec => {
                const isAI = rec.actorType === 'AI Engine';
                const isOfficer = rec.actorType === 'Officer';
                const isCitizen = rec.actorType === 'Citizen';

                return (
                  <tr
                    key={rec.eventId}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    className="hover-shadow-sm"
                  >
                    {/* Timestamp */}
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--color-ink-muted)', fontSize: '0.72rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                        {new Date(rec.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div>
                        {new Date(rec.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Event Type */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {getActorIcon(rec.actorType)}
                        <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
                          {rec.eventType}
                        </span>
                      </div>
                    </td>

                    {/* Complaint ID */}
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        className="mono"
                        onClick={() => navigate(`/complaints/${rec.complaintId}`)}
                        style={{ fontWeight: 800, color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Open complaint investigation workspace"
                      >
                        {rec.complaintId}
                      </span>
                    </td>

                    {/* Actor & Role */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
                        {rec.actor}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
                        {rec.role}
                      </div>
                    </td>

                    {/* Ward & Dept */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                        {rec.ward}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                        {rec.department.split('&')[0]}
                      </div>
                    </td>

                    {/* Description */}
                    <td style={{ padding: '10px 12px', maxWidth: '240px' }}>
                      <div style={{ color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.75rem' }}>
                        {rec.action}
                      </div>
                    </td>

                    {/* Authority Tag */}
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          padding: '2px 7px',
                          borderRadius: '3px',
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          backgroundColor: isAI
                            ? 'var(--color-ai-tint)'
                            : isOfficer
                            ? 'var(--color-primary-tint)'
                            : 'var(--color-surface-sunken)',
                          color: isAI
                            ? 'var(--color-ai)'
                            : isOfficer
                            ? 'var(--color-primary)'
                            : 'var(--color-ink-muted)',
                          border: isAI
                            ? '1px solid var(--color-ai-border)'
                            : '1px solid var(--color-border)',
                        }}
                      >
                        {rec.authorityBadge}
                      </span>
                    </td>

                    {/* View Details Action */}
                    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => onSelectEvent?.(rec)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-primary)',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              backgroundColor: currentPage === 1 ? 'var(--color-surface-sunken)' : '#FFFFFF',
              color: currentPage === 1 ? 'var(--color-ink-muted)' : 'var(--color-ink)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronLeft size={13} /> Previous
          </button>

          <span style={{ color: 'var(--color-ink-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border)',
              backgroundColor: currentPage === totalPages ? 'var(--color-surface-sunken)' : '#FFFFFF',
              color: currentPage === totalPages ? 'var(--color-ink-muted)' : 'var(--color-ink)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
