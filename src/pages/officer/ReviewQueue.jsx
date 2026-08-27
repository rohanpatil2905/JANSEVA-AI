import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { SeverityBadge, StatusBadge } from '../../components/common/Badge';
import { complaintsAPI } from '../../services/api';
import { showToast } from '../../components/common/Toast';
import {
  FaUserCheck,
  FaCheck,
  FaTimes,
  FaFlag,
  FaEdit,
  FaSyncAlt,
  FaChevronRight,
  FaBrain,
} from 'react-icons/fa';

export default function ReviewQueue() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintsAPI.getPendingReviews();
      setReviews(data.pending_reviews || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending human-in-the-loop reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleQuickReviewAction = async (complaintId, action) => {
    setProcessingId(complaintId);
    try {
      await complaintsAPI.addReview(complaintId, {
        action,
        notes: `Quick review action: ${action}`,
        final_decision: action,
      });
      showToast(`Review recorded: AI recommendation ${action}!`, 'success');
      fetchPendingReviews();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to submit review', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/dashboard" label="Dashboard" />
        <button onClick={fetchPendingReviews} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt /> Refresh Queue
        </button>
      </div>

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
            <FaUserCheck />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Human-in-the-Loop Review Queue</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              High-priority or sensitive complaints requiring officer verification of AI classification & severity.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading pending review queue..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPendingReviews} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<FaUserCheck />}
          title="Review Queue is Clean!"
          description="There are currently no AI triage decisions flagged for mandatory human supervisor verification."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reviews.map((item) => (
            <div
              key={item.id}
              className="card animate-fade-in"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderLeft: '4px solid var(--primary-500)',
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <StatusBadge status={item.status} />
                  {item.severity_level && <SeverityBadge level={item.severity_level} />}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Complaint #{item.id.slice(0, 8)}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <FaBrain style={{ color: 'var(--primary-600)', marginRight: '4px' }} />
                  Routing Reason: {item.routing_reason || 'High severity municipal impact flagged for review'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleQuickReviewAction(item.id, 'APPROVE')}
                  disabled={processingId === item.id}
                  className="btn btn-success btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FaCheck /> Approve
                </button>

                <button
                  onClick={() => handleQuickReviewAction(item.id, 'FLAG_FOR_REVIEW')}
                  disabled={processingId === item.id}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FaFlag /> Flag
                </button>

                <Link
                  to={`/officer/complaints/${item.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FaEdit /> Inspect &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
