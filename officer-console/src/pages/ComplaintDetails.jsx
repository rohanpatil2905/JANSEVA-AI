import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  User,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import ComplaintHeader from '../components/complaints/ComplaintHeader';
import ComplaintOverview from '../components/complaints/ComplaintOverview';
import ComplaintEvidence from '../components/complaints/ComplaintEvidence';
import AIAnalysis from '../components/ai/AIAnalysis';
import AIExplanation from '../components/ai/AIExplanation';
import SeverityAnalysis from '../components/ai/SeverityAnalysis';
import RoutingExplanation from '../components/ai/RoutingExplanation';
import DuplicateCluster from '../components/ai/DuplicateCluster';
import AuthenticityCard from '../components/ai/AuthenticityCard';
import OfficerDecisionCard from '../components/complaints/OfficerDecisionCard';
import StatusTransition from '../components/officer/StatusTransition';
import OfficerActionPanel from '../components/officer/OfficerActionPanel';
import CitizenConfirmation from '../components/officer/CitizenConfirmation';
import SLASummaryCard from '../components/complaints/SLASummaryCard';
import ActionTimeline from '../components/audit/ActionTimeline';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { getComplaintById, getAIAnalysis, updateComplaintStatus } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, aiRes] = await Promise.all([
        getComplaintById(id),
        getAIAnalysis(id),
      ]);
      setComplaint(compRes);
      setAiAnalysis(aiRes);
    } catch (err) {
      console.error('Failed to load complaint details', err);
      setError(`Complaint ${id} was not found or failed to load.`);
      showError(`Unable to fetch records for ${id}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleComplaintUpdated = updatedComplaint => {
    setComplaint(updatedComplaint);
  };

  const handleScrollToOperations = () => {
    const el = document.getElementById('operations-action-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStatusTransitionAction = async actionType => {
    if (actionType === 'start_work') {
      try {
        const updated = await updateComplaintStatus(complaint.complaintId, {
          status: 'In Progress',
          reason: 'Officer initiated field engineering and inspection operations.',
          officerName: user?.name || 'Rohan Patil',
          officerRole: user?.role || 'Municipal Officer',
        });
        showSuccess('Grievance status moved to IN PROGRESS.', 'Work Commenced');
        setComplaint(updated);
      } catch (err) {
        showError('Failed to transition status.');
      }
    } else {
      handleScrollToOperations();
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height={80} />
        <Skeleton height={100} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Skeleton height={200} />
          <Skeleton height={200} />
        </div>
        <Skeleton height={240} />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <EmptyState
          title="Grievance Record Not Found"
          description={error || `No citizen grievance matching ID "${id}" exists in the municipal registry.`}
          actionLabel="Return to Grievance Registry"
          onAction={() => navigate('/complaints')}
          icon={AlertTriangle}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* 1. Header with Title, ID, Priority, Status, SLA and Stepper */}
      <ComplaintHeader complaint={complaint} onQuickAction={handleScrollToOperations} />

      {/* 2. Overview Quick Metrics Card */}
      <ComplaintOverview complaint={complaint} />

      {/* 3. Citizen Report Narrative & Evidence Attachments */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left: Citizen Narrative & Geo Coordinates */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--color-primary)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Citizen Grievance Narrative
            </h3>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              color: 'var(--color-ink)',
              lineHeight: 1.5,
            }}
          >
            {complaint.description}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={13} color="var(--color-primary)" />
              <span>Location: <strong>{complaint.location}</strong></span>
            </div>
            {complaint.coordinates && (
              <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-ink-faint)', marginLeft: '19px' }}>
                GPS Telemetry: Lat {complaint.coordinates.lat}, Lng {complaint.coordinates.lng} (Verified PMC Geo-Fence)
              </div>
            )}
          </div>
        </div>

        {/* Right: Field Evidence / Photo Attachments */}
        <ComplaintEvidence complaint={complaint} />
      </div>

      {/* 4. AI Inference Engine Analysis */}
      <AIAnalysis analysis={aiAnalysis || complaint} />

      {/* 5. Severity Analysis & Explainable AI (XAI) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        <SeverityAnalysis
          severityScore={complaint.severityScore}
          priority={complaint.priority}
          severityFactors={complaint.severityFactors || []}
        />

        <AIExplanation
          xaiFactors={complaint.xaiFactors || []}
          severityScore={complaint.severityScore}
          priority={complaint.priority}
          aiConfidence={complaint.aiConfidence}
        />
      </div>

      {/* 6. Explainable Department Routing */}
      <RoutingExplanation
        recommendedDepartment={complaint.recommendedDepartment || complaint.department}
        routingConfidence={complaint.routingConfidence || 95}
        routingReasons={complaint.routingReasons || []}
      />

      {/* 7. Duplicate Intelligence & Authenticity Anti-Abuse */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        <DuplicateCluster complaint={complaint} />

        <AuthenticityCard
          authenticityScore={complaint.authenticityScore}
          authenticityStatus={complaint.authenticityStatus}
          authenticityReasons={complaint.authenticityReasons || []}
          onUpdateStatus={(newStatus, newScore) => {
            setComplaint(prev => ({
              ...prev,
              authenticityStatus: newStatus,
              authenticityScore: newScore,
            }));
          }}
        />
      </div>

      {/* 8. Human-in-the-Loop Officer Statutory Decision Panel */}
      <OfficerDecisionCard
        complaint={complaint}
        onDecisionSaved={handleComplaintUpdated}
      />

      {/* 9. Status Transition Stepper & Fast Action Router */}
      <StatusTransition
        currentStatus={complaint.status}
        onTriggerAction={handleStatusTransitionAction}
      />

      {/* 10. Operational Action Panel (Assignment, Log Action, Upload Proof, Resolve, Escalate) */}
      <div id="operations-action-section">
        <OfficerActionPanel
          complaint={complaint}
          onComplaintUpdated={handleComplaintUpdated}
        />
      </div>

      {/* 11. Citizen Confirmation Protocol (If in Resolved / Confirmed state) */}
      {(complaint.status === 'Resolved' || complaint.status === 'Citizen Confirmed') && (
        <CitizenConfirmation
          complaint={complaint}
          onConfirmationSaved={handleComplaintUpdated}
          onTriggerReopen={handleScrollToOperations}
        />
      )}

      {/* 12. SLA Status & Full Chronological Action Audit Trail */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        <SLASummaryCard complaint={complaint} />
        <ActionTimeline auditHistory={complaint.auditHistory || []} />
      </div>
    </div>
  );
}
