import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { analyticsAPI } from '../../services/api';
import {
  FaBell,
  FaExclamationTriangle,
  FaBolt,
  FaUserCheck,
  FaCheckCircle,
  FaSyncAlt,
  FaChevronRight,
} from 'react-icons/fa';

export default function Notifications() {
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await analyticsAPI.getNotifications();
      setNotifications(data.notifications || {});
    } catch (err) {
      console.error(err);
      setError('Failed to fetch officer notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <LoadingState message="Loading alert notifications..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;

  const critical = notifications?.critical_complaints || [];
  const slaBreaches = notifications?.sla_breaches || [];
  const escalations = notifications?.escalations || [];
  const reviews = notifications?.review_required || [];
  const resolutions = notifications?.resolutions || [];

  const allAlerts = [
    ...critical.map((c) => ({ ...c, category: 'CRITICAL', icon: <FaExclamationTriangle style={{ color: '#dc2626' }} /> })),
    ...slaBreaches.map((c) => ({ ...c, category: 'SLA_BREACH', icon: <FaBolt style={{ color: '#ea580c' }} /> })),
    ...escalations.map((c) => ({ ...c, category: 'ESCALATION', icon: <FaBolt style={{ color: '#ea580c' }} /> })),
    ...reviews.map((c) => ({ ...c, category: 'REVIEW_REQUIRED', icon: <FaUserCheck style={{ color: '#006ee6' }} /> })),
    ...resolutions.map((c) => ({ ...c, category: 'RESOLUTION', icon: <FaCheckCircle style={{ color: '#16a34a' }} /> })),
  ];

  const filteredAlerts =
    activeTab === 'ALL'
      ? allAlerts
      : allAlerts.filter((a) => a.category === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/dashboard" label="Dashboard" />
        <button onClick={fetchNotifications} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt /> Refresh Alerts
        </button>
      </div>

      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
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
            <FaBell />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Operational Notifications & Alerts Hub</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Real-time monitoring across SLA breaches, escalations, critical intake, and pending reviews.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
          >
            All Alerts ({allAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('CRITICAL')}
            className={`btn btn-sm ${activeTab === 'CRITICAL' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Critical ({critical.length})
          </button>
          <button
            onClick={() => setActiveTab('SLA_BREACH')}
            className={`btn btn-sm ${activeTab === 'SLA_BREACH' ? 'btn-primary' : 'btn-ghost'}`}
          >
            SLA Breaches ({slaBreaches.length})
          </button>
          <button
            onClick={() => setActiveTab('REVIEW_REQUIRED')}
            className={`btn btn-sm ${activeTab === 'REVIEW_REQUIRED' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Review Required ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('RESOLUTION')}
            className={`btn btn-sm ${activeTab === 'RESOLUTION' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Recent Resolutions ({resolutions.length})
          </button>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <EmptyState
          icon={<FaBell />}
          title="No alerts in this category"
          description="All operations are running within nominal parameters."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="card animate-fade-in"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                borderLeft: `4px solid ${
                  alert.category === 'CRITICAL' || alert.category === 'SLA_BREACH'
                    ? '#dc2626'
                    : alert.category === 'RESOLUTION'
                    ? '#16a34a'
                    : '#006ee6'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{ fontSize: '1.2rem', display: 'flex', flexShrink: 0 }}>
                  {alert.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {alert.title || `Alert on Complaint #${alert.complaint_id?.slice(0, 8)}`}
                    </strong>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'var(--bg-subtle)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {alert.category?.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {alert.reason || alert.escalation_reason || `Complaint ID: ${alert.complaint_id}`}
                  </div>
                </div>
              </div>

              {alert.complaint_id && (
                <Link
                  to={`/officer/complaints/${alert.complaint_id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ flexShrink: 0, fontSize: '0.8rem' }}
                >
                  Inspect &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
