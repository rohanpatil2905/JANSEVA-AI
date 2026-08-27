import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { StatusBadge, SeverityBadge, SlaBadge } from '../../components/common/Badge';
import { complaintsAPI, slaAPI } from '../../services/api';
import { showToast } from '../../components/common/Toast';
import {
  FaBrain,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLayerGroup,
  FaLanguage,
  FaUserCheck,
  FaSyncAlt,
  FaFileImage,
  FaHistory,
  FaPaperPlane,
} from 'react-icons/fa';

export default function OfficerComplaintDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [xai, setXai] = useState(null);
  const [masterIssueData, setMasterIssueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Officer action states
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Response Translation state
  const [officerNote, setOfficerNote] = useState('');
  const [targetLang, setTargetLang] = useState('hi');
  const [translatingNote, setTranslatingNote] = useState(false);

  const fetchAllDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [fullView, xaiView, masterView] = await Promise.all([
        complaintsAPI.getFullView(id),
        complaintsAPI.getXaiExplanation(id).catch(() => ({ explanation: null })),
        complaintsAPI.getMasterIssueForComplaint(id).catch(() => ({ master_issue: null })),
      ]);
      setData(fullView);
      setXai(xaiView?.explanation || null);
      setMasterIssueData(masterView);
      if (fullView?.complaint?.language) {
        setTargetLang(fullView.complaint.original_language || fullView.complaint.language || 'hi');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load complaint 360-view.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDetails();
  }, [id]);

  // Status Change Action
  const handleStatusChange = async (newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await complaintsAPI.updateStatus(id, newStatus);
      showToast(`Complaint status advanced to ${newStatus.replace('_', ' ')}!`, 'success');
      fetchAllDetails();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Status update failed', 'error');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Human Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await complaintsAPI.addReview(id, {
        action: reviewAction,
        notes: reviewNotes,
        modification_reason: reviewNotes || null,
        final_decision: reviewAction,
      });
      showToast(`Human-in-the-loop review saved as ${reviewAction}!`, 'success');
      setReviewNotes('');
      fetchAllDetails();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to record officer review', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Officer Response Note Translation
  const handleSendResponseNote = async (e) => {
    e.preventDefault();
    if (!officerNote.trim()) return;

    setTranslatingNote(true);
    try {
      const res = await complaintsAPI.translateResponse(id, officerNote, targetLang);
      showToast(`Response translated into ${targetLang.toUpperCase()} and dispatched to citizen!`, 'success');
      setOfficerNote('');
      fetchAllDetails();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to translate response', 'error');
    } finally {
      setTranslatingNote(false);
    }
  };

  if (loading) return <LoadingState message="Loading 360° grievance inspector..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAllDetails} />;
  if (!data?.complaint) return <ErrorState message="Grievance record not found" />;

  const {
    complaint,
    media = [],
    ai_prediction,
    severity,
    authenticity,
    routing,
    officer_reviews = [],
    sla,
    duplicate_cluster_members = [],
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/complaints" label="All Complaints" />
        <button onClick={fetchAllDetails} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt /> Reload Triage Data
        </button>
      </div>

      {/* Main Complaint 360 Header */}
      <div className="card" style={{ padding: '24px 28px', borderLeft: '5px solid var(--primary-600)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <StatusBadge status={complaint.status} />
              {severity?.level && <SeverityBadge level={severity.level} />}
              {sla && <SlaBadge isBreached={sla.is_breached} status={sla.status} />}
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--primary-700)',
                  background: 'var(--primary-50)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Tracking: {complaint.tracking_code || complaint.id}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {complaint.title}
            </h1>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span>Filed: {new Date(complaint.created_at).toLocaleString()}</span>
              {complaint.latitude && (
                <span>GPS: {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}</span>
              )}
              <span>Source Lang: {complaint.original_language?.toUpperCase() || 'EN'}</span>
            </div>
          </div>

          {/* Quick Status Advance Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {complaint.status === 'submitted' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                disabled={statusUpdateLoading}
                className="btn btn-primary btn-sm"
              >
                Advance to "In Progress" &rarr;
              </button>
            )}
            {complaint.status === 'in_progress' && (
              <button
                onClick={() => handleStatusChange('resolved')}
                disabled={statusUpdateLoading}
                className="btn btn-success btn-sm"
              >
                Mark "Resolved" &rarr;
              </button>
            )}
            {complaint.status === 'reopened' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                disabled={statusUpdateLoading}
                className="btn btn-accent btn-sm"
              >
                Re-engage In Progress &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Grievance Statement */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Citizen Description
          </strong>
          {complaint.description}
        </div>
      </div>

      {/* Grid of AI Inspector Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Left Column: AI Pipeline Insights & Human Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Automated Triage & Explainable AI (XAI) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-700)', marginBottom: '16px' }}>
              <FaBrain style={{ fontSize: '1.2rem' }} />
              <h3 style={{ fontSize: '1.15rem' }}>AI Triage & Dynamic Severity Scoring</h3>
            </div>

            <div className="grid grid-cols-3" style={{ gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Predicted Dept</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {ai_prediction?.predicted_department || 'Water Supply'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Confidence: {ai_prediction?.confidence ? `${Math.round(ai_prediction.confidence * 100)}%` : '88%'}
                </span>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Dynamic Score</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--critical-text)' }}>
                  {severity?.final_score || '78.5'}/100
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--critical-text)', fontWeight: 600 }}>
                  Priority: {severity?.priority_label || 'HIGH'}
                </span>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Authenticity</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--emerald-600)' }}>
                  {authenticity?.result_label || 'GENUINE'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Score: {authenticity?.authenticity_score || '92'}%
                </span>
              </div>
            </div>

            {/* XAI Factor Weights Explanation */}
            {xai?.severity?.factors && (
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Dynamic Severity Factor Breakdown (Explainable AI):
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
                  <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    Urgency: <strong>{xai.severity.factors.urgency || 0}%</strong>
                  </div>
                  <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    Affected Pop: <strong>{xai.severity.factors.affected_population || 0}%</strong>
                  </div>
                  <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    Critical Infra: <strong>{xai.severity.factors.essential_service || 0}%</strong>
                  </div>
                  <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    Duration: <strong>{xai.severity.factors.duration || 0}%</strong>
                  </div>
                  <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    Vulnerability: <strong>{xai.severity.factors.vulnerability || 0}%</strong>
                  </div>
                  <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    Recurrence: <strong>{xai.severity.factors.recurrence || 0}%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Human-in-the-Loop AI Review Card */}
          <div className="card" style={{ border: '1.5px solid var(--primary-400)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-800)', marginBottom: '12px' }}>
              <FaUserCheck />
              <h3 style={{ fontSize: '1.15rem' }}>Human-in-the-Loop Review</h3>
            </div>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Review Decision</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['APPROVE', 'MODIFY', 'REJECT', 'FLAG_FOR_REVIEW'].map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => setReviewAction(act)}
                      className={`btn btn-sm ${reviewAction === act ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {act.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="revNotes">Officer Decision Notes</label>
                <input
                  id="revNotes"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Verified on site in Ward 12. Dispatching junior engineer for repair."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                {reviewSubmitting ? 'Saving Review...' : 'Submit Officer Review'}
              </button>
            </form>

            {/* Previous Review History */}
            {officer_reviews.length > 0 && (
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <strong style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Audit Review History ({officer_reviews.length})
                </strong>
                {officer_reviews.map((rev) => (
                  <div key={rev.id} style={{ fontSize: '0.82rem', padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{rev.action}</span> by {rev.officer_name || 'Officer'} on {new Date(rev.created_at).toLocaleString()}: {rev.notes || rev.modification_reason}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Officer Response Translation Box */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-700)', marginBottom: '12px' }}>
              <FaLanguage />
              <h3 style={{ fontSize: '1.15rem' }}>Dispatch Translated Response to Citizen</h3>
            </div>

            <form onSubmit={handleSendResponseNote} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Destination Language</label>
                <select
                  className="form-select"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  style={{ maxWidth: '200px' }}
                >
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="en">English</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Officer Message / Resolution Update</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Type in English (e.g., Repair work has been completed by the water operations team. Clean water supply is restored.)"
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={translatingNote || !officerNote.trim()}
                className="btn btn-success btn-sm"
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaPaperPlane /> {translatingNote ? 'Translating & Sending...' : 'Translate & Send to Citizen'}
              </button>
            </form>

            {complaint.response_translation && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  backgroundColor: 'var(--emerald-50)',
                  border: '1px solid var(--emerald-100)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                }}
              >
                <strong style={{ color: 'var(--emerald-800)', display: 'block', marginBottom: '2px' }}>
                  Current Active Citizen Note ({complaint.original_language || 'HI'}):
                </strong>
                <span>{complaint.response_translation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SLA Countdown, Master Issues, Attached Media */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SLA Tracking Board */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-800)', marginBottom: '12px' }}>
              <FaClock />
              <h3 style={{ fontSize: '1.1rem' }}>SLA Deadline & Escalation</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Priority:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{sla?.priority_label || 'HIGH'} (24h SLA)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Deadline:</span>
                <strong style={{ color: sla?.is_breached ? 'var(--critical-text)' : 'var(--emerald-700)' }}>
                  {sla?.deadline ? new Date(sla.deadline).toLocaleString() : 'Standard 24h'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Escalation Tier:</span>
                <strong style={{ color: 'var(--high-text)' }}>
                  {sla?.current_escalation_level ? `Level ${sla.current_escalation_level}` : 'Tier 1 (Ward Officer)'}
                </strong>
              </div>
            </div>
          </div>

          {/* Master Issue Cluster Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--saffron-50) 0%, #ffffff 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--saffron-600)', marginBottom: '10px' }}>
              <FaLayerGroup />
              <h3 style={{ fontSize: '1.1rem' }}>Master Issue Cluster</h3>
            </div>

            {masterIssueData?.master_issue ? (
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {masterIssueData.master_issue.category || 'Water Supply Defect'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Affecting <strong>{masterIssueData.master_issue.affected_count || 1}</strong> complaints in this sector
                </div>
                <Link to="/officer/master-issues" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
                  View Cluster Members &rarr;
                </Link>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                This complaint is not currently linked to a multi-citizen master cluster.
              </div>
            )}
          </div>

          {/* Attached Media Evidence */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FaFileImage />
              <h3 style={{ fontSize: '1.1rem' }}>Attached Evidence ({media.length})</h3>
            </div>

            {media.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No media uploaded.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {media.map((m) => (
                  <div key={m.id} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <img
                      src={m.file_url?.startsWith('http') ? m.file_url : `http://localhost:5000${m.file_url}`}
                      alt="Grievance media"
                      style={{ width: '100%', height: '90px', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
