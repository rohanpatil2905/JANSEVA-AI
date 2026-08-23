import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Building2,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import AIReviewHeader from '../components/ai-review/AIReviewHeader';
import AIReviewSummary from '../components/ai-review/AIReviewSummary';
import AIReviewFilters from '../components/ai-review/AIReviewFilters';
import AIReviewQueue from '../components/ai-review/AIReviewQueue';
import AIReviewDecisionPanel from '../components/ai-review/AIReviewDecisionPanel';

// Existing proven modular components from Stage 4
import AIAnalysis from '../components/ai/AIAnalysis';
import AIExplanation from '../components/ai/AIExplanation';
import SeverityAnalysis from '../components/ai/SeverityAnalysis';
import RoutingExplanation from '../components/ai/RoutingExplanation';
import DuplicateCluster from '../components/ai/DuplicateCluster';
import AuthenticityCard from '../components/ai/AuthenticityCard';
import ActionTimeline from '../components/audit/ActionTimeline';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

import { getComplaints, getComplaintById, getAIAnalysis } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AIReview() {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedAiAnalysis, setSelectedAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    reviewState: 'All',
    confidence: 'All',
    severity: 'All',
    authenticity: 'All',
    department: 'All',
    ward: 'All',
  });

  // Fetch all 20 authoritative municipal complaints
  const fetchAllComplaints = async () => {
    try {
      setLoading(true);
      const list = await getComplaints();
      setComplaints(list);

      // Select first complaint if none selected
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].complaintId);
      }
    } catch (err) {
      console.error('Failed to load complaints for AI review', err);
      showError('Failed to fetch grievance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  // Fetch details when selectedId changes
  useEffect(() => {
    if (!selectedId) return;

    const loadSelected = async () => {
      setDetailsLoading(true);
      try {
        const [comp, ai] = await Promise.all([
          getComplaintById(selectedId),
          getAIAnalysis(selectedId),
        ]);
        setSelectedComplaint(comp);
        setSelectedAiAnalysis(ai);
      } catch (err) {
        console.error(`Failed to load details for ${selectedId}`, err);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadSelected();
  }, [selectedId]);

  // Filter complaints list
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // 1. Review State
      if (filters.reviewState !== 'All') {
        const state = c.aiReviewState || 'PENDING REVIEW';
        if (state !== filters.reviewState) return false;
      }

      // 2. AI Confidence
      if (filters.confidence !== 'All') {
        const conf = c.aiConfidence || 0;
        if (filters.confidence === 'high' && conf < 90) return false;
        if (filters.confidence === 'med' && (conf < 75 || conf >= 90)) return false;
        if (filters.confidence === 'low' && conf >= 75) return false;
      }

      // 3. Severity
      if (filters.severity !== 'All' && c.priority !== filters.severity) {
        return false;
      }

      // 4. Authenticity
      if (filters.authenticity !== 'All' && c.authenticityStatus !== filters.authenticity) {
        return false;
      }

      // 5. Department
      if (filters.department !== 'All' && c.department !== filters.department) {
        return false;
      }

      // 6. Ward
      if (filters.ward !== 'All' && c.ward !== filters.ward) {
        return false;
      }

      return true;
    });
  }, [complaints, filters]);

  // Handle updates after an officer decision is saved
  const handleDecisionSaved = updatedComplaint => {
    setSelectedComplaint(updatedComplaint);
    setComplaints(prev =>
      prev.map(c => (c.complaintId === updatedComplaint.complaintId ? updatedComplaint : c))
    );
  };

  const handleResetFilters = () => {
    setFilters({
      reviewState: 'All',
      confidence: 'All',
      severity: 'All',
      authenticity: 'All',
      department: 'All',
      ward: 'All',
    });
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '1540px',
        margin: '0 auto',
        width: '100%',
        paddingBottom: '40px',
      }}
    >
      {/* 1. Header & Governance Notice */}
      <AIReviewHeader />

      {/* 2. Dynamically Derived KPI Summary Strip */}
      <AIReviewSummary complaints={complaints} />

      {/* 3. Filter Controls Bar */}
      <AIReviewFilters
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Main Two-Column Workbench (Left: 40% Queue | Right: 60% Selected Review) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 38%) 1fr',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: AI Review Queue */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Skeleton height={60} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
            </div>
          ) : (
            <AIReviewQueue
              complaints={filteredComplaints}
              selectedComplaintId={selectedId}
              onSelectComplaint={comp => setSelectedId(comp.complaintId)}
              onResetFilters={handleResetFilters}
            />
          )}
        </div>

        {/* Right Column: Selected AI Review Investigation Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {detailsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Skeleton height={80} />
              <Skeleton height={180} />
              <Skeleton height={220} />
              <Skeleton height={200} />
            </div>
          ) : selectedComplaint ? (
            <>
              {/* Top Context Strip with Navigate to Full Details */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {selectedComplaint.complaintId}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--color-surface-sunken)',
                        color: 'var(--color-ink-muted)',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      Status: {selectedComplaint.status}
                    </span>
                    {selectedComplaint.slaStatus && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor:
                            selectedComplaint.slaStatus === 'BREACHED'
                              ? 'var(--color-critical-bg)'
                              : 'var(--color-high-bg)',
                          color:
                            selectedComplaint.slaStatus === 'BREACHED'
                              ? 'var(--color-critical)'
                              : 'var(--color-high)',
                          border:
                            selectedComplaint.slaStatus === 'BREACHED'
                              ? '1px solid var(--color-critical-border)'
                              : '1px solid var(--color-high-border)',
                        }}
                      >
                        SLA: {selectedComplaint.slaStatus} ({selectedComplaint.slaRemainingHours > 0 ? `${selectedComplaint.slaRemainingHours}h remaining` : 'Breached'})
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
                    {selectedComplaint.title}
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                    Ward: <strong>{selectedComplaint.ward}</strong> &bull; Location: {selectedComplaint.location}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/complaints/${selectedComplaint.complaintId}`)}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary-tint)',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    border: '1px solid var(--color-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <span>View Full Complaint</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* AI Recommendation Card (4 Decision Pillars) */}
              <AIAnalysis analysis={selectedAiAnalysis || selectedComplaint} />

              {/* Severity Vector Analysis & Concrete XAI Explanation */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '16px',
                }}
              >
                <SeverityAnalysis
                  severityScore={selectedComplaint.severityScore}
                  priority={selectedComplaint.priority}
                  severityFactors={selectedComplaint.severityFactors || []}
                />

                <AIExplanation
                  xaiFactors={selectedComplaint.xaiFactors || []}
                  severityScore={selectedComplaint.severityScore}
                  priority={selectedComplaint.priority}
                  aiConfidence={selectedComplaint.aiConfidence}
                />
              </div>

              {/* Why This Department Routing Signals */}
              <RoutingExplanation
                recommendedDepartment={selectedComplaint.recommendedDepartment || selectedComplaint.department}
                routingConfidence={selectedComplaint.routingConfidence || 92}
                routingReasons={selectedComplaint.routingReasons || []}
              />

              {/* Duplicate Clustering & Authenticity Assessment */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '16px',
                }}
              >
                <DuplicateCluster complaint={selectedComplaint} />

                <AuthenticityCard
                  authenticityScore={selectedComplaint.authenticityScore}
                  authenticityStatus={selectedComplaint.authenticityStatus}
                  authenticityReasons={selectedComplaint.authenticityReasons || []}
                  onUpdateStatus={(newStatus, newScore) => {
                    setSelectedComplaint(prev => ({
                      ...prev,
                      authenticityStatus: newStatus,
                      authenticityScore: newScore,
                    }));
                  }}
                />
              </div>

              {/* Human-in-the-Loop Officer Statutory Decision Panel */}
              <AIReviewDecisionPanel
                complaint={selectedComplaint}
                onDecisionSaved={handleDecisionSaved}
              />

              {/* AI Review & Verification Audit Ledger */}
              <ActionTimeline auditHistory={selectedComplaint.auditHistory || []} />
            </>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <EmptyState
                title="Select a Grievance to Review"
                description="Select any pending grievance from the AI Review Queue on the left to inspect explainable AI recommendations and record your statutory triage decision."
                icon={Sparkles}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
