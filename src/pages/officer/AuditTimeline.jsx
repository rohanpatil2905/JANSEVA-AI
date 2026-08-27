import React, { useState, useEffect } from 'react';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { complaintsAPI, analyticsAPI } from '../../services/api';
import {
  FaHistory,
  FaSearch,
  FaUser,
  FaRobot,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
} from 'react-icons/fa';

export default function AuditTimeline() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [error, setError] = useState('');

  // Initial load: get complaints list to choose from
  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true);
      try {
        const data = await complaintsAPI.list();
        const list = data.complaints || [];
        setComplaints(list);
        if (list.length > 0) {
          setSelectedComplaintId(list[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch complaint records.');
      } finally {
        setLoading(false);
      }
    };
    loadComplaints();
  }, []);

  // When selectedComplaintId changes, load timeline
  useEffect(() => {
    if (!selectedComplaintId) return;

    const loadTimeline = async () => {
      setLoadingTimeline(true);
      try {
        const res = await analyticsAPI.getTimeline(selectedComplaintId);
        setTimeline(res.timeline || []);
      } catch (err) {
        console.error(err);
        // Fallback to complaint audit endpoint
        try {
          const auditRes = await complaintsAPI.getAuditTrail(selectedComplaintId);
          setTimeline(
            auditRes.audit_trail?.map((a) => ({
              complaint_id: a.complaint_id,
              action: a.action,
              actor_id: a.actor_id,
              actor_name: a.actor_name,
              timestamp: a.created_at,
              details: a.details,
            })) || []
          );
        } catch {
          setTimeline([]);
        }
      } finally {
        setLoadingTimeline(false);
      }
    };

    loadTimeline();
  }, [selectedComplaintId]);

  if (loading) return <LoadingState message="Loading audit trail explorer..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/dashboard" label="Dashboard" />
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
            <FaHistory />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Forensic Audit Trail & Event Timeline</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Immutable audit log tracking all citizen filings, AI inferences, officer status transitions, and reviews.
            </p>
          </div>
        </div>

        {/* Complaint Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ margin: 0 }}>
            Select Grievance:
          </label>
          <select
            className="form-select"
            value={selectedComplaintId}
            onChange={(e) => setSelectedComplaintId(e.target.value)}
            style={{ maxWidth: '400px' }}
          >
            {complaints.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tracking_code || c.id.slice(0, 8)} — {c.title} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '18px' }}>
          Chronological Event History (Complaint #{selectedComplaintId?.slice(0, 8)})
        </h3>

        {loadingTimeline ? (
          <LoadingState message="Loading event trail..." />
        ) : timeline.length === 0 ? (
          <EmptyState
            icon={<FaHistory />}
            title="No audit events recorded"
            description="Audit events are logged whenever an action, status update, or AI scoring occurs on this grievance."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px' }}>
            {/* Timeline Vertical Track */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '7px',
                width: '2px',
                backgroundColor: 'var(--border-subtle)',
              }}
            />

            {timeline.map((event, idx) => {
              const isAi = event.action?.startsWith('AI_');
              const isOfficer = event.action?.startsWith('OFFICER_') || event.action?.startsWith('STATUS_');

              return (
                <div key={idx} className="animate-fade-in" style={{ position: 'relative' }}>
                  {/* Bullet Node */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-24px',
                      top: '6px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: isAi ? 'var(--primary-600)' : isOfficer ? 'var(--emerald-600)' : 'var(--saffron-500)',
                      border: '3px solid #ffffff',
                      boxShadow: '0 0 0 1px var(--border-subtle)',
                    }}
                  />

                  {/* Event Card */}
                  <div
                    style={{
                      padding: '14px 18px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {event.action?.replace(/_/g, ' ')}
                      </strong>

                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <FaClock style={{ marginRight: '4px' }} />
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      Actor:{' '}
                      <strong>{event.actor_name || (isAi ? 'Automated AI Engine' : 'Citizen / System')}</strong>
                    </div>

                    {event.details && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#ffffff',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          color: 'var(--text-secondary)',
                          overflowX: 'auto',
                        }}
                      >
                        {JSON.stringify(event.details, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
