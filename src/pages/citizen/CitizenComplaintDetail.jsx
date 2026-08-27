import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/Badge';
import { complaintsAPI } from '../../services/api';
import { showToast } from '../../components/common/Toast';
import {
  FaCheckCircle,
  FaClock,
  FaCamera,
  FaCommentDots,
  FaExclamationCircle,
  FaCalendarAlt,
  FaFileImage,
  FaSyncAlt,
  FaHandsHelping,
} from 'react-icons/fa';

export default function CitizenComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Resolution confirmation state
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintsAPI.getById(id);
      setData(res);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load grievance details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleConfirmResolution = async (confirmed) => {
    setConfirming(true);
    try {
      await complaintsAPI.confirmResolution(id, confirmed, confirmNotes);
      showToast(
        confirmed
          ? 'Thank you! The grievance has been confirmed resolved and closed.'
          : 'Grievance reopened. Municipal officers will re-inspect the issue.',
        confirmed ? 'success' : 'info'
      );
      setConfirmNotes('');
      fetchDetails();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to update resolution confirmation', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      await complaintsAPI.uploadMedia(id, file);
      showToast('New photo/evidence attached successfully!', 'success');
      fetchDetails();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to upload photo', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  if (loading) return <div className="container"><LoadingState message="Loading grievance progress..." /></div>;
  if (error) return <div className="container"><ErrorState message={error} onRetry={fetchDetails} /></div>;
  if (!data?.complaint) return <div className="container"><ErrorState message="Grievance not found" /></div>;

  const { complaint, media = [] } = data;

  const timelineSteps = [
    { key: 'submitted', label: 'Grievance Registered', desc: 'Received & triaged by AI system' },
    { key: 'in_progress', label: 'Municipal Action', desc: 'Assigned to field officer for repair' },
    { key: 'resolved', label: 'Work Completed', desc: 'Officer marked resolution complete' },
    { key: 'closed', label: 'Citizen Confirmed', desc: 'Resolved and closed' },
  ];

  const currentStepIndex =
    complaint.status === 'closed'
      ? 3
      : complaint.status === 'resolved'
      ? 2
      : complaint.status === 'in_progress'
      ? 1
      : 0;

  return (
    <div className="container container-narrow">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <BackButton to="/citizen/my-complaints" label="My Grievances" />
        <button onClick={fetchDetails} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt /> Refresh Status
        </button>
      </div>

      {/* Main Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <StatusBadge status={complaint.status} />
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--primary-700)',
                  background: 'var(--primary-50)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Tracking: {complaint.tracking_code || complaint.id}
              </span>
            </div>

            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {complaint.title}
            </h1>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span>
                <FaCalendarAlt /> Submitted on: {new Date(complaint.created_at).toLocaleString()}
              </span>
              {complaint.language && <span>Language: {complaint.language.toUpperCase()}</span>}
            </div>
          </div>
        </div>

        {/* Status Timeline Bar */}
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px' }}>
            STATUS PROGRESSION TIMELINE
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              position: 'relative',
            }}
          >
            {timelineSteps.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isPastOrCurrent ? 'var(--emerald-600)' : 'var(--border-strong)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      marginBottom: '8px',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.25)' : 'none',
                    }}
                  >
                    {isPastOrCurrent ? '✓' : idx + 1}
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: isPastOrCurrent ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {step.label}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grievance Details Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Grievance Statement</h3>
        <p style={{ fontSize: '0.98rem', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '16px' }}>
          {complaint.description}
        </p>

        {complaint.translated_text && complaint.translated_text !== complaint.description && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-200)',
              fontSize: '0.9rem',
              marginBottom: '16px',
            }}
          >
            <strong style={{ color: 'var(--primary-800)', display: 'block', marginBottom: '2px' }}>
              Normalized Translation:
            </strong>
            <span>{complaint.translated_text}</span>
          </div>
        )}

        {/* Attached Photos & Evidence Gallery */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaFileImage /> Attached Media / Photos ({media.length})
            </h4>

            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
              <FaCamera /> {uploadingMedia ? 'Uploading...' : 'Add Photo'}
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleMediaUpload}
                disabled={uploadingMedia}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {media.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No photos or media attached to this grievance yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {media.map((m) => (
                <div
                  key={m.id}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                  }}
                >
                  <img
                    src={m.file_url?.startsWith('http') ? m.file_url : `http://localhost:5000${m.file_url}`}
                    alt="Complaint evidence"
                    style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#ffffff', background: 'rgba(0,0,0,0.7)', textTransform: 'capitalize' }}>
                    {m.type} • {new Date(m.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Officer Response Translation Box */}
      {complaint.response_translation && (
        <div
          className="card"
          style={{
            backgroundColor: 'var(--emerald-50)',
            border: '1.5px solid var(--emerald-500)',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-700)', fontWeight: 700, marginBottom: '8px' }}>
            <FaCommentDots /> Official Municipal Officer Response
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {complaint.response_translation}
          </p>
        </div>
      )}

      {/* Citizen Resolution Confirmation Section (When status is resolved) */}
      {complaint.status === 'resolved' && (
        <div
          className="card"
          style={{
            border: '2px solid var(--primary-500)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-700)', marginBottom: '8px' }}>
            <FaHandsHelping style={{ fontSize: '1.4rem' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Citizen Resolution Confirmation</h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Municipal officers marked this issue as resolved. Please verify if the repair/cleaning was completed satisfactorily.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="feedbackNotes">
              Feedback Notes (Optional)
            </label>
            <input
              id="feedbackNotes"
              type="text"
              className="form-input"
              placeholder="e.g., Water pressure is fully restored now. Thank you!"
              value={confirmNotes}
              onChange={(e) => setConfirmNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleConfirmResolution(true)}
              disabled={confirming}
              className="btn btn-success btn-lg"
              style={{ flex: 1, minWidth: '200px' }}
            >
              <FaCheckCircle /> Confirm Resolved & Close
            </button>

            <button
              onClick={() => handleConfirmResolution(false)}
              disabled={confirming}
              className="btn btn-danger btn-lg"
              style={{ flex: 1, minWidth: '200px' }}
            >
              <FaExclamationCircle /> Dissatisfied — Reopen Grievance
            </button>
          </div>
        </div>
      )}

      {complaint.status === 'closed' && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--emerald-50)',
            border: '1px solid var(--emerald-100)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--emerald-700)',
            fontWeight: 600,
          }}
        >
          <FaCheckCircle />
          <span>This grievance has been confirmed resolved and closed. Thank you for helping keep our city clean and well-maintained!</span>
        </div>
      )}
    </div>
  );
}
