import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { complaintsAPI } from '../../services/api';
import { showToast } from '../../components/common/Toast';
import {
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaEdit,
  FaChevronRight,
  FaExclamationCircle,
} from 'react-icons/fa';

export default function OfficerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      const data = await complaintsAPI.list(filters);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch complaints list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleQuickStatusChange = async (complaint, newStatus) => {
    if (complaint.status === newStatus) return;
    setUpdatingId(complaint.id);
    try {
      await complaintsAPI.updateStatus(complaint.id, newStatus);
      showToast(`Status updated to ${newStatus.replace('_', ' ')}!`, 'success');
      fetchComplaints();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Invalid status transition', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = complaints.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      (item.tracking_code && item.tracking_code.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/dashboard" label="Dashboard" />
        <button onClick={fetchComplaints} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt /> Refresh Records
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Grievance Records & Triage</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Manage, assign, and update departmental complaints across municipal jurisdictions.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search complaints or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading complaints table..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchComplaints} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No complaints matching criteria"
            description="No municipal grievances match the selected status filter or search term."
            actionLabel="Reset Filters"
            onAction={() => { setSearchTerm(''); setStatusFilter(''); }}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking Code</th>
                  <th>Grievance Statement</th>
                  <th>Status</th>
                  <th>Quick Action</th>
                  <th>Filed Date</th>
                  <th>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong style={{ fontSize: '0.82rem', color: 'var(--primary-700)' }}>
                          {c.tracking_code || c.id.slice(0, 8)}
                        </strong>
                      </td>
                      <td style={{ maxWidth: '320px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.description}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        {c.status === 'submitted' && (
                          <button
                            onClick={() => handleQuickStatusChange(c, 'in_progress')}
                            disabled={updatingId === c.id}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                          >
                            {updatingId === c.id ? 'Updating...' : 'Start Action'}
                          </button>
                        )}
                        {c.status === 'in_progress' && (
                          <button
                            onClick={() => handleQuickStatusChange(c, 'resolved')}
                            disabled={updatingId === c.id}
                            className="btn btn-success btn-sm"
                            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                          >
                            {updatingId === c.id ? 'Updating...' : 'Mark Resolved'}
                          </button>
                        )}
                        {c.status === 'reopened' && (
                          <button
                            onClick={() => handleQuickStatusChange(c, 'in_progress')}
                            disabled={updatingId === c.id}
                            className="btn btn-accent btn-sm"
                            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                          >
                            {updatingId === c.id ? 'Updating...' : 'Re-engage'}
                          </button>
                        )}
                        {(c.status === 'resolved' || c.status === 'closed') && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {c.status === 'resolved' ? 'Awaiting Citizen' : 'Archived'}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={`/officer/complaints/${c.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                          Inspect <FaChevronRight style={{ fontSize: '0.7rem' }} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
