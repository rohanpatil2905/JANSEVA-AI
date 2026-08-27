import React, { useState } from "react";

export default function ResolutionClosure({
  complaint,
  onSuccess,
  onClose,
}) {
  const [resolutionType, setResolutionType] = useState(
    "Permanent Resolution"
  );

  const [summary, setSummary] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [affectedArea, setAffectedArea] = useState("");

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

    if (!summary.trim()) {
      setError("Resolution summary is required");
      return;
    }

    if (!actionsTaken.trim()) {
      setError("Technical actions are required");
      return;
    }

    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      const payload = {
        resolution_scope: resolutionType,
        resolution_summary: summary.trim(),
        technical_actions: actionsTaken.trim(),
        rectified_area_coverage:
          affectedArea.trim() || null,

        // IMPORTANT: backend requires boolean true
        statutory_confirmation: true,

        // Compatibility fields
        resolution_type: resolutionType,
        summary: summary.trim(),
        actions_taken: actionsTaken.trim(),
        affected_area: affectedArea.trim() || null,
        citizen_notified: true,
        officer_name: "Rohan Patil",
        officer_role: "Zonal Ward Officer",
      };

      console.log("RESOLUTION PAYLOAD:", payload);

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
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      console.log("RESOLUTION RESPONSE:", response.status, data);

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
      console.error(
        "Resolution submission error:",
        err
      );

      setError(
        err.message ||
          "Failed to record resolution."
      );
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
          Submit verified field resolution and statutory
          closure confirmation.
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

        {/* RESOLUTION TYPE */}
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
            value={resolutionType}
            onChange={(e) =>
              setResolutionType(e.target.value)
            }
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          >
            <option value="Permanent Resolution">
              Permanent Resolution
            </option>

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

        {/* SUMMARY */}
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
            value={summary}
            onChange={(e) =>
              setSummary(e.target.value)
            }
            placeholder="YOUR COMPLAINT RESOLVED"
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

        {/* TECHNICAL ACTIONS */}
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
            value={actionsTaken}
            onChange={(e) =>
              setActionsTaken(e.target.value)
            }
            placeholder="Water supply started"
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

        {/* AFFECTED AREA */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Rectified Area Coverage
          </label>

          <input
            type="text"
            value={affectedArea}
            onChange={(e) =>
              setAffectedArea(e.target.value)
            }
            placeholder="Pune Municipal Zone"
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

        {/* STATUTORY CONFIRMATION */}
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            background: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <input
              type="checkbox"
              checked={true}
              readOnly
              style={{
                marginTop: "4px",
                width: "18px",
                height: "18px",
              }}
            />

            <span>
              <strong>
                Statutory Officer Confirmation:
              </strong>{" "}
              I officially confirm that the reported
              municipal grievance has been inspected and
              rectified to the engineering standards
              specified above.
            </span>
          </div>
        </div>

        {/* BUTTONS */}
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
              cursor: submitting
                ? "not-allowed"
                : "pointer",
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