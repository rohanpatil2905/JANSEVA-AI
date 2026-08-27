import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  MapPin,
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

import {
  getComplaintById,
  getAIAnalysis,
  updateComplaintStatus,
} from '../services/api';

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
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      /*
       * IMPORTANT:
       * Complaint data and AI data are loaded separately.
       * If AI fails, the complaint page still loads.
       */
      const compRes = await getComplaintById(id);

      if (!compRes) {
        throw new Error(`Complaint ${id} was not found.`);
      }

      setComplaint(compRes);

      try {
        const aiRes = await getAIAnalysis(id);
        setAiAnalysis(aiRes || null);
      } catch (aiErr) {
        console.warn(
          `AI analysis unavailable for complaint ${id}:`,
          aiErr
        );

        // AI is optional. Do NOT break the complaint page.
        setAiAnalysis(null);
      }
    } catch (err) {
      console.error('Failed to load complaint details:', err);

      setError(
        err?.message ||
          `Unable to load complaint ${id}.`
      );

      showError(
        `Unable to fetch complaint ${id}.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleComplaintUpdated = updatedComplaint => {
    if (updatedComplaint) {
      setComplaint(updatedComplaint);
    }
  };

  const handleScrollToOperations = () => {
    const element = document.getElementById(
      'operations-action-section'
    );

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleStatusTransitionAction = async actionType => {
    if (!complaint) return;

    if (actionType === 'start_work') {
      try {
        const complaintId =
          complaint.complaintId ||
          complaint.id;

        const updated = await updateComplaintStatus(
          complaintId,
          {
            status: 'In Progress',
            reason:
              'Officer initiated field engineering and inspection operations.',
            officerName:
              user?.name || 'Municipal Officer',
            officerRole:
              user?.role || 'Municipal Officer',
          }
        );

        showSuccess(
          'Grievance status moved to IN PROGRESS.',
          'Work Commenced'
        );

        setComplaint(updated);
      } catch (err) {
        console.error(
          'Failed to transition complaint status:',
          err
        );

        showError(
          'Failed to transition complaint status.'
        );
      }
    } else {
      handleScrollToOperations();
    }
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Skeleton height={80} />
        <Skeleton height={100} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          <Skeleton height={200} />
          <Skeleton height={200} />
        </div>

        <Skeleton height={240} />
      </div>
    );
  }

  /*
   * Error state
   */
  if (error || !complaint) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <EmptyState
          title="Grievance Record Not Found"
          description={
            error ||
            `No citizen grievance matching ID "${id}" exists in the municipal registry.`
          }
          actionLabel="Return to Grievance Registry"
          onAction={() => navigate('/complaints')}
          icon={AlertTriangle}
        />
      </div>
    );
  }

  /*
   * Normalize fields because backend and prototype
   * data may use slightly different names.
   */
  const complaintId =
    complaint.complaintId ||
    complaint.id ||
    id;

  const description =
    complaint.description ||
    complaint.original_text ||
    complaint.transcript_text ||
    complaint.translated_text ||
    'No description available.';

  const location =
    complaint.location ||
    complaint.address ||
    'Location not provided';

  const coordinates =
    complaint.coordinates ||
    (
      complaint.latitude != null &&
      complaint.longitude != null
        ? {
            lat: complaint.latitude,
            lng: complaint.longitude,
          }
        : null
    );

  const severityScore =
    complaint.severityScore ??
    complaint.severity_score ??
    0;

  const priority =
    complaint.priority ||
    'Normal';

  const recommendedDepartment =
    complaint.recommendedDepartment ||
    complaint.department ||
    'Department not assigned';

  const routingConfidence =
    complaint.routingConfidence ??
    complaint.routing_confidence ??
    95;

  const status =
    complaint.status ||
    'Submitted';

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/complaints')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          width: 'fit-content',
          border: 'none',
          background: 'transparent',
          color: 'var(--color-primary)',
          cursor: 'pointer',
          fontWeight: 700,
          padding: 0,
        }}
      >
        <ArrowLeft size={17} />
        Back to Grievance Registry
      </button>

      {/* 1. Header */}
      <ComplaintHeader
        complaint={complaint}
        onQuickAction={handleScrollToOperations}
      />

      {/* 2. Overview */}
      <ComplaintOverview complaint={complaint} />

      {/* 3. Citizen narrative + evidence */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border:
              '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileText
              size={16}
              color="var(--color-primary)"
            />

            <h3
              style={{
                fontSize: '0.9375rem',
                fontWeight: 800,
                color: 'var(--color-ink)',
                margin: 0,
              }}
            >
              Citizen Grievance Narrative
            </h3>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor:
                'var(--color-surface-sunken)',
              border:
                '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              color: 'var(--color-ink)',
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--color-ink-muted)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MapPin
                size={13}
                color="var(--color-primary)"
              />

              <span>
                Location:{' '}
                <strong>{location}</strong>
              </span>
            </div>

            {coordinates && (
              <div
                className="mono"
                style={{
                  fontSize: '0.7rem',
                  color:
                    'var(--color-ink-faint)',
                  marginLeft: '19px',
                }}
              >
                GPS Telemetry: Lat{' '}
                {coordinates.lat}, Lng{' '}
                {coordinates.lng}
              </div>
            )}
          </div>
        </div>

        <ComplaintEvidence
          complaint={complaint}
        />
      </div>

      {/* 4. AI Analysis */}
      <AIAnalysis
        analysis={aiAnalysis || complaint}
      />

      {/* 5. Severity + XAI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        <SeverityAnalysis
          severityScore={severityScore}
          priority={priority}
          severityFactors={
            complaint.severityFactors ||
            complaint.severity_factors ||
            []
          }
        />

        <AIExplanation
          xaiFactors={
            complaint.xaiFactors ||
            complaint.xai_factors ||
            []
          }
          severityScore={severityScore}
          priority={priority}
          aiConfidence={
            complaint.aiConfidence ??
            complaint.ai_confidence
          }
        />
      </div>

      {/* 6. Routing */}
      <RoutingExplanation
        recommendedDepartment={
          recommendedDepartment
        }
        routingConfidence={
          routingConfidence
        }
        routingReasons={
          complaint.routingReasons ||
          complaint.routing_reasons ||
          []
        }
      />

      {/* 7. Duplicate + Authenticity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        <DuplicateCluster
          complaint={complaint}
        />

        <AuthenticityCard
          authenticityScore={
            complaint.authenticityScore ??
            complaint.authenticity_score
          }
          authenticityStatus={
            complaint.authenticityStatus ||
            complaint.authenticity_status
          }
          authenticityReasons={
            complaint.authenticityReasons ||
            complaint.authenticity_reasons ||
            []
          }
          onUpdateStatus={(
            newStatus,
            newScore
          ) => {
            setComplaint(prev => ({
              ...prev,
              authenticityStatus:
                newStatus,
              authenticityScore:
                newScore,
            }));
          }}
        />
      </div>

      {/* 8. Officer decision */}
      <OfficerDecisionCard
        complaint={complaint}
        onDecisionSaved={
          handleComplaintUpdated
        }
      />

      {/* 9. Status transition */}
      <StatusTransition
        currentStatus={status}
        onTriggerAction={
          handleStatusTransitionAction
        }
      />

      {/* 10. Operations */}
      <div id="operations-action-section">
        <OfficerActionPanel
          complaint={complaint}
          onComplaintUpdated={
            handleComplaintUpdated
          }
        />
      </div>

      {/* 11. Citizen confirmation */}
      {(status === 'Resolved' ||
        status === 'Citizen Confirmed') && (
        <CitizenConfirmation
          complaint={complaint}
          onConfirmationSaved={
            handleComplaintUpdated
          }
          onTriggerReopen={
            handleScrollToOperations
          }
        />
      )}

      {/* 12. SLA + Audit */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        <SLASummaryCard
          complaint={complaint}
        />

        <ActionTimeline
          auditHistory={
            complaint.auditHistory ||
            complaint.audit_history ||
            []
          }
        />
      </div>
    </div>
  );
}