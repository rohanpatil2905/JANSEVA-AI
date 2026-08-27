import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { SeverityBadge, StatusBadge } from '../../components/common/Badge';
import { complaintsAPI } from '../../services/api';
import { showToast } from '../../components/common/Toast';
import { FaLayerGroup, FaSyncAlt, FaUsers, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function MasterIssues() {
  const [masterIssues, setMasterIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshingId, setRefreshingId] = useState(null);

  const fetchMasterIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintsAPI.listMasterIssues();
      setMasterIssues(res.master_issues || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch master issue clusters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterIssues();
  }, []);

  const handleRefreshCluster = async (issueId, representativeId) => {
    if (!representativeId) return;
    setRefreshingId(issueId);
    try {
      await complaintsAPI.refreshMasterIssue(representativeId);
      showToast('Master cluster recalculation complete!', 'success');
      fetchMasterIssues();
    } catch (err) {
      console.error(err);
      showToast('Failed to refresh cluster', 'error');
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/dashboard" label="Dashboard" />
        <button onClick={fetchMasterIssues} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt /> Refresh Clusters
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--saffron-50)',
              color: 'var(--saffron-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
            }}
          >
            <FaLayerGroup />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Master Civic Issues (Duplicate Clusters)</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Semantic AI clusters grouping multiple citizen complaints for synchronized municipal action.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Aggregating master issue clusters..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMasterIssues} />
      ) : masterIssues.length === 0 ? (
        <EmptyState
          icon={<FaLayerGroup />}
          title="No master issue clusters active"
          description="When multiple citizens report the same defect (e.g. water pipeline break in Ward 12), the AI clusters them into a Master Issue."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {masterIssues.map((issue) => (
            <div
              key={issue.id}
              className="card animate-fade-in"
              style={{
                borderTop: '4px solid var(--saffron-500)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '22px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--saffron-600)',
                      background: 'var(--saffron-50)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    Cluster #{issue.id.slice(0, 8)}
                  </span>

                  <SeverityBadge level={issue.severity || 'HIGH'} />
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {issue.category || 'Civic Infrastructure Defect'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaUsers style={{ color: 'var(--primary-600)' }} />
                    <span>
                      Affected Complaints: <strong>{issue.affected_count || 1}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaMapMarkerAlt style={{ color: 'var(--emerald-600)' }} />
                    <span>Location: {issue.location || 'Ward 12 Municipal Sector'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Status:</span>
                    <strong style={{ textTransform: 'capitalize', color: issue.status === 'resolved' ? 'var(--emerald-700)' : 'var(--high-text)' }}>
                      {issue.status || 'Active'}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                {issue.representative_complaint_id && (
                  <Link
                    to={`/officer/complaints/${issue.representative_complaint_id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    Inspect Lead Complaint &rarr;
                  </Link>
                )}

                {issue.representative_complaint_id && (
                  <button
                    onClick={() => handleRefreshCluster(issue.id, issue.representative_complaint_id)}
                    disabled={refreshingId === issue.id}
                    className="btn btn-ghost btn-sm"
                    title="Recalculate cluster members"
                  >
                    <FaSyncAlt className={refreshingId === issue.id ? 'animate-spin' : ''} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
