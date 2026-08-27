import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { StatusBadge, SeverityBadge, SlaBadge } from '../../components/common/Badge';
import { slaAPI, complaintsAPI } from '../../services/api';
import { showToast } from '../../components/common/Toast';
import {
  FaClock,
  FaBolt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaShieldAlt,
  FaSyncAlt,
  FaChevronRight,
} from 'react-icons/fa';

export default function SLAEscalations() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sweeping, setSweeping] = useState(false);

  const fetchSLAData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintsAPI.list();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch SLA tracking records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSLAData();
  }, []);

  const handleRunSweep = async () => {
    setSweeping(true);
    try {
      const res = await slaAPI.checkEscalations();
      showToast(`Escalation sweep finished! ${res.escalated_count} issues processed.`, 'success');
      fetchSLAData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Sweep failed', 'error');
    } finally {
      setSweeping(false);
    }
  };

  const activeComplaints = complaints.filter((c) => c.status === 'submitted' || c.status === 'in_progress' || c.status === 'reopened');
  const resolvedComplaints = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/dashboard" label="Dashboard" />
        <button
          onClick={handleRunSweep}
          disabled={sweeping}
          className="btn btn-accent btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FaBolt className={sweeping ? 'animate-spin' : ''} />
          {sweeping ? 'Sweeping SLA Deadlines...' : 'Trigger SLA Escalation Sweep'}
        </button>
      </div>

      {/* Header & Policy Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
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
            <FaClock />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>SLA Monitoring & Escalation Engine</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Automated multi-tier escalation hierarchy guaranteeing timely civic grievance resolution.
            </p>
          </div>
        </div>
      </div>

      {/* Escalation Hierarchy Tiers */}
      <div className="grid grid-cols-3" style={{ gap: '16px' }}>
        <div className="card" style={{ borderTop: '4px solid var(--primary-500)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-600)' }}>TIER 1 (0 - 24 HOURS)</span>
          <h4 style={{ fontSize: '1.05rem', margin: '4px 0' }}>Ward Field Officer</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Initial triage, on-site physical inspection, and contractor work assignment.
          </p>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--saffron-500)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--saffron-600)' }}>TIER 2 (24 - 48 HOURS)</span>
          <h4 style={{ fontSize: '1.05rem', margin: '4px 0' }}>Executive Engineer</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Automated escalation on initial deadline breach with departmental alert.
          </p>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--critical-text)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--critical-text)' }}>TIER 3 (&gt; 48 HOURS)</span>
          <h4 style={{ fontSize: '1.05rem', margin: '4px 0' }}>Municipal Commissioner</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            High-priority dashboard flag with executive oversight audit logging.
          </p>
        </div>
      </div>

      {/* Active SLA Tracking Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Active SLA Countdown Queue ({activeComplaints.length})</h3>
          <button onClick={fetchSLAData} className="btn btn-secondary btn-sm">
            <FaSyncAlt /> Refresh
          </button>
        </div>

        {loading ? (
          <LoadingState message="Loading SLA matrix..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchSLAData} />
        ) : activeComplaints.length === 0 ? (
          <EmptyState
            title="All SLA deadlines met!"
            description="There are currently no active grievances pending past their assigned SLA window."
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking Code</th>
                  <th>Grievance</th>
                  <th>Status</th>
                  <th>SLA Window</th>
                  <th>Escalation Level</th>
                  <th>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {activeComplaints.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--primary-700)' }}>
                        {item.tracking_code || item.id.slice(0, 8)}
                      </strong>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Filed on {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <span className="badge badge-submitted">⏱️ 24h Standard</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-700)' }}>
                        Tier 1 (Ward Desk)
                      </span>
                    </td>
                    <td>
                      <Link to={`/officer/complaints/${item.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                        Inspect <FaChevronRight style={{ fontSize: '0.7rem' }} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
