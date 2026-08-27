import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, complaintsAPI, slaAPI } from '../../services/api';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { StatusBadge, SeverityBadge } from '../../components/common/Badge';
import { showToast } from '../../components/common/Toast';
import {
  FaChartPie,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaLayerGroup,
  FaBolt,
  FaMapMarkedAlt,
  FaUserCheck,
  FaArrowRight,
  FaBuilding,
  FaSyncAlt,
} from 'react-icons/fa';

export default function OfficerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sweeping, setSweeping] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsData, complaintsData] = await Promise.all([
        analyticsAPI.getOfficerAnalytics(),
        complaintsAPI.list(),
      ]);
      setAnalytics(analyticsData);
      setRecentComplaints(complaintsData.complaints || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch officer command center data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunSweep = async () => {
    setSweeping(true);
    try {
      const res = await slaAPI.checkEscalations();
      showToast(`SLA escalation sweep complete: ${res.escalated_count} issues processed.`, 'success');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Sweep failed', 'error');
    } finally {
      setSweeping(false);
    }
  };

  if (loading) return <LoadingState message="Loading officer command metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner & Quick Actions */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #ffffff 0%, var(--primary-50) 100%)',
          borderLeft: '5px solid var(--primary-600)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Operations Command Center</h1>
            <span className="badge badge-submitted">Live Triage</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Real-time municipal grievance telemetry, automated SLA countdowns, and explainable AI triage.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRunSweep}
            disabled={sweeping}
            className="btn btn-accent btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FaBolt className={sweeping ? 'animate-spin' : ''} />
            {sweeping ? 'Sweeping SLA...' : 'Run SLA Sweep'}
          </button>

          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-4" style={{ gap: '18px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Complaints
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <FaChartPie />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {analytics?.total_complaints || 0}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>All municipal categories</span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pending / Active
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--high-bg)', color: 'var(--high-text)' }}>
              <FaClock />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--high-text)' }}>
            {analytics?.pending_complaints || 0}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Require officer action</span>
        </div>

        <div className="card" style={{ padding: '20px', border: analytics?.critical_high_complaints > 0 ? '1px solid var(--critical-border)' : '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--critical-text)', textTransform: 'uppercase' }}>
              Critical / High
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--critical-bg)', color: 'var(--critical-text)' }}>
              <FaExclamationTriangle />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--critical-text)' }}>
            {analytics?.critical_high_complaints || 0}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--critical-text)' }}>Priority resolution required</span>
        </div>

        <div className="card" style={{ padding: '20px', border: analytics?.sla_breached > 0 ? '1px solid var(--critical-border)' : '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--critical-text)', textTransform: 'uppercase' }}>
              SLA Breached
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--critical-bg)', color: 'var(--critical-text)' }}>
              <FaBolt />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--critical-text)' }}>
            {analytics?.sla_breached || 0}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--critical-text)' }}>Escalation trigger active</span>
        </div>
      </div>

      {/* Middle Layout: Department Workload & Master Issue Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Department Workload Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBuilding style={{ color: 'var(--primary-600)' }} /> Departmental Workload Distribution
            </h3>
            <Link to="/officer/analytics" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Full Analytics &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analytics?.department_counts?.length ? (
              analytics.department_counts.map((dept, idx) => {
                const totalCount = analytics.total_complaints || 1;
                const percent = Math.min(100, Math.round((dept.complaint_count / totalCount) * 100));
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <strong>{dept.department || 'Unassigned / General'}</strong>
                      <span>{dept.complaint_count} complaints ({percent}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: 'linear-gradient(90deg, var(--primary-500), var(--primary-700))',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No departmental breakdown data.</div>
            )}
          </div>
        </div>

        {/* Master Issues & GIS Quick Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--saffron-50) 0%, #ffffff 100%)', border: '1px solid var(--saffron-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--saffron-600)', marginBottom: '8px' }}>
              <FaLayerGroup />
              <h4 style={{ fontSize: '1.05rem' }}>Master Issues Clustered</h4>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {analytics?.master_issue_stats?.master_issue_count || 0} Clusters
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Aggregating {analytics?.master_issue_stats?.affected_complaint_count || 0} complaints from {analytics?.master_issue_stats?.affected_citizen_count || 0} residents.
            </p>
            <Link to="/officer/master-issues" className="btn btn-accent btn-sm">
              Inspect Master Clusters &rarr;
            </Link>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <div>
              <h4 style={{ fontSize: '0.98rem', marginBottom: '2px' }}>GIS Spatial Hotspots</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Ward-level grid clustering</p>
            </div>
            <Link to="/officer/gis" className="btn btn-primary btn-sm">
              <FaMapMarkedAlt /> Open Map
            </Link>
          </div>
        </div>
      </div>

      {/* Live Priority Grievance Intake Queue */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Priority Triage & Intake Queue</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Active complaints requiring departmental assignment or status advancement.
            </p>
          </div>

          <Link to="/officer/complaints" className="btn btn-secondary btn-sm">
            View All Complaints &rarr;
          </Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title & Grievance</th>
                <th>Status</th>
                <th>Filed Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.slice(0, 6).map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--primary-700)' }}>
                      {c.tracking_code || c.id.slice(0, 8)}
                    </strong>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.description}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/officer/complaints/${c.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                      Inspect &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
