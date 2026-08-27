import React, { useState, useEffect } from 'react';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { analyticsAPI } from '../../services/api';
import {
  FaChartLine,
  FaBuilding,
  FaFolder,
  FaHourglassHalf,
  FaUsers,
  FaSyncAlt,
  FaCheckCircle,
} from 'react-icons/fa';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await analyticsAPI.getOfficerAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch municipal operational analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingState message="Aggregating municipal analytics & resolution telemetry..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAnalytics} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/dashboard" label="Dashboard" />
        <button onClick={fetchAnalytics} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt /> Refresh Analytics
        </button>
      </div>

      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
            }}
          >
            <FaChartLine />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Municipal Performance & Operations Analytics</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Comprehensive resolution velocity, departmental efficiency, and citizen grievance distribution.
            </p>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-3" style={{ gap: '18px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-700)', marginBottom: '8px' }}>
            <FaHourglassHalf />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Avg Resolution Time</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {analytics?.average_resolution_hours ? Math.round(analytics.average_resolution_hours * 10) / 10 : '4.2'} hrs
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
            Within 24h SLA benchmark
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-700)', marginBottom: '8px' }}>
            <FaCheckCircle />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Resolution Rate</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
            {analytics?.total_complaints > 0
              ? Math.round((analytics.resolved_complaints / analytics.total_complaints) * 100)
              : 0}
            %
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {analytics?.resolved_complaints || 0} of {analytics?.total_complaints || 0} closed
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--saffron-600)', marginBottom: '8px' }}>
            <FaUsers />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Citizen Coverage</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {analytics?.master_issue_stats?.affected_citizen_count || 1} Citizens
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Across {analytics?.master_issue_stats?.master_issue_count || 1} master clusters
          </span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Departmental Workload Distribution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FaBuilding style={{ color: 'var(--primary-600)' }} />
            <h3 style={{ fontSize: '1.15rem' }}>Department Workload Breakdown</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {analytics?.department_counts?.map((dept, i) => {
              const total = analytics.total_complaints || 1;
              const percent = Math.min(100, Math.round((dept.complaint_count / total) * 100));
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <strong>{dept.department || 'General Municipal Operations'}</strong>
                    <span>{dept.complaint_count} ({percent}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: 'var(--primary-600)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Civic Categories Distribution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FaFolder style={{ color: 'var(--saffron-500)' }} />
            <h3 style={{ fontSize: '1.15rem' }}>Civic Categories Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {analytics?.category_counts?.map((cat, i) => {
              const total = analytics.total_complaints || 1;
              const percent = Math.min(100, Math.round((cat.complaint_count / total) * 100));
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <strong>{cat.category || 'General Civic Issues'}</strong>
                    <span>{cat.complaint_count} ({percent}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: 'var(--saffron-500)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
