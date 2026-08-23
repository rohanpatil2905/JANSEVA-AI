import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowRight, Eye, Clock } from 'lucide-react';
import Badge from '../ui/Badge';

export default function RecentComplaints({ complaints = [], loading = false }) {
  const navigate = useNavigate();

  // Show recent 6 complaints
  const recentList = complaints.slice(0, 6);

  const getPriorityVariant = priority => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'moderate';
      case 'low':
        return 'low';
      default:
        return 'default';
    }
  };

  const getStatusVariant = status => {
    switch (status) {
      case 'Resolved':
        return 'healthy';
      case 'In Progress':
        return 'default';
      case 'Assigned':
        return 'moderate';
      case 'AI Classified':
        return 'ai';
      default:
        return 'default';
    }
  };

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
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)' }}>
            Recent Citizen Complaints
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
            Latest incoming municipal grievances across all wards
          </p>
        </div>

        <button
          onClick={() => navigate('/complaints')}
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          View All Complaints &rarr;
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-ink-muted)' }}>
              <th style={{ padding: '8px 10px', fontWeight: 700 }}>ID</th>
              <th style={{ padding: '8px 10px', fontWeight: 700 }}>Title & Category</th>
              <th style={{ padding: '8px 10px', fontWeight: 700 }}>Ward</th>
              <th style={{ padding: '8px 10px', fontWeight: 700 }}>Priority</th>
              <th style={{ padding: '8px 10px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '8px 10px', fontWeight: 700 }}>SLA</th>
              <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
                  Loading recent grievances...
                </td>
              </tr>
            ) : recentList.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
                  No recent complaints found.
                </td>
              </tr>
            ) : (
              recentList.map(item => (
                <tr
                  key={item.complaintId}
                  style={{ borderBottom: '1px solid var(--color-surface-sunken)', transition: 'background-color 0.1s ease' }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '10px 8px' }}>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {item.complaintId}
                    </span>
                  </td>

                  <td style={{ padding: '10px 8px', maxWidth: '260px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)' }}>
                      {item.category}
                    </div>
                  </td>

                  <td style={{ padding: '10px 8px', fontWeight: 500 }}>
                    {item.ward}
                  </td>

                  <td style={{ padding: '10px 8px' }}>
                    <Badge variant={getPriorityVariant(item.priority)} size="sm">
                      {item.priority}
                    </Badge>
                  </td>

                  <td style={{ padding: '10px 8px' }}>
                    <Badge variant={getStatusVariant(item.status)} size="sm">
                      {item.status}
                    </Badge>
                  </td>

                  <td style={{ padding: '10px 8px' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        color: item.slaStatus === 'BREACHED' ? 'var(--color-critical)' : item.slaStatus === 'AT RISK' ? 'var(--color-high)' : 'var(--color-healthy)',
                      }}
                    >
                      {item.slaStatus}
                    </span>
                  </td>

                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    <button
                      onClick={() => navigate(`/complaints/${item.complaintId}`)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface-sunken)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                      }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
