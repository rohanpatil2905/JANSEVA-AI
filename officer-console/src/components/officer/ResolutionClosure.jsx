import React, { useState } from "react";

export default function ResolutionClosure({
  complaint,
  onSuccess,
  onClose,
}) {
  const [resolutionScope, setResolutionScope] = useState(
    "Permanent Engineering Resolution"
  );
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [technicalActions, setTechnicalActions] = useState("");
  const [rectifiedAreaCoverage, setRectifiedAreaCoverage] = useState("");
  const [statutoryConfirmation, setStatutoryConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const complaintId = complaint?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!complaintId) {
      setError("Complaint ID is missing.");
      return;
    }

    if (!resolutionSummary.trim()) {
      setError("Resolution summary is required");
      return;
    }

    if (!technicalActions.trim()) {
      setError("Technical actions are required");
      return;
    }

    if (!statutoryConfirmation) {
      setError("Statutory officer confirmation is required");
      return;
    }

    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `/api/complaints/${complaintId}/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            resolution_scope: resolutionScope,
            resolution_summary: resolutionSummary.trim(),
            technical_actions: technicalActions.trim(),
            rectified_area_coverage:
              rectifiedAreaCoverage.trim() || null,
            statutory_confirmation: statutoryConfirmation,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to record resolution."
        );
      }

      alert("Resolution recorded successfully.");

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      console.error("Resolution submission error:", err);
      setError(err.message || "Failed to record resolution.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          RESOLUTION & CLOSURE
        </h2>

        <p
          style={{
            marginTop: "8px",
            color: "#6b7280",
          }}
        >
          Submit verified field resolution and statutory closure
          confirmation.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px 14px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Resolution Scope */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Resolution Scope & Nature *
          </label>

          <select
            value={resolutionScope}
            onChange={(e) => setResolutionScope(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          >
            <option value="Permanent Engineering Resolution">
              Permanent Engineering Resolution
            </option>

            <option value="Temporary Hazard Mitigation (Permanent work queued)">
              Temporary Hazard Mitigation (Permanent work queued)
            </option>

            <option value="Partial Zonal Restoration">
              Partial Zonal Restoration
            </option>
          </select>
        </div>

        {/* Resolution Summary */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Resolution Summary (Citizen-Facing) *
          </label>

          <textarea
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
            placeholder="Describe the resolution completed for the citizen..."
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Technical Actions */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Technical Actions Taken & Crew Protocols *
          </label>

          <textarea
            value={technicalActions}
            onChange={(e) => setTechnicalActions(e.target.value)}
            placeholder="Detail the specific technical/engineering actions taken..."
            rows={5}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Coverage */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Rectified Area Coverage (Optional)
          </label>

          <input
            type="text"
            value={rectifiedAreaCoverage}
            onChange={(e) =>
              setRectifiedAreaCoverage(e.target.value)
            }
            placeholder="Example: House No. 12 to House No. 30"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Statutory Confirmation */}
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            background: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <label
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={statutoryConfirmation}
              onChange={(e) =>
                setStatutoryConfirmation(e.target.checked)
              }
              style={{
                marginTop: "4px",
                width: "18px",
                height: "18px",
              }}
            />

            <span>
              <strong>Statutory Officer Confirmation:</strong>{" "}
              I officially confirm that the reported municipal
              grievance has been inspected and rectified to the
              engineering standards specified above.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#111827",
              color: "#fff",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 700,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? "Recording Resolution..."
              : "Record Resolution"}
          </button>
        </div>
      </form>
    </div>
  );
}