# JanSeva AI — Municipal Officer Console API Contract Specification
**Version:** 1.0.0-SIH2026  
**Status:** Integrated / Integration-Ready  
**Consumers:** JanSeva AI Officer Console (Frontend) & Citizen Portal  
**Target Backend:** Fastify / Express / Django / FastAPI Municipal Backend Gateway  

---

## Table of Contents
1. [Architectural Overview & Global Standards](#1-architectural-overview--global-standards)
2. [Authentication & RBAC (`/auth`)](#2-authentication--rbac-auth)
3. [Grievances & Complaint Lifecycle (`/complaints`)](#3-grievances--complaint-lifecycle-complaints)
4. [Explainable AI (XAI) & Advisory Triage (`/ai`)](#4-explainable-ai-xai--advisory-triage-ai)
5. [Geospatial Intelligence & Ward GIS (`/gis`)](#5-geospatial-intelligence--ward-gis-gis)
6. [SLA Monitoring & Escalation Engine (`/sla`)](#6-sla-monitoring--escalation-engine-sla)
7. [Operational Analytics & AI Evaluation (`/analytics`)](#7-operational-analytics--ai-evaluation-analytics)
8. [Audit Ledger & Statutory Compliance (`/audit`)](#8-audit-ledger--statutory-compliance-audit)
9. [Standard Error Envelopes & HTTP Codes](#9-standard-error-envelopes--http-codes)

---

## 1. Architectural Overview & Global Standards

### Base URL
All API paths documented herein are relative to the configured `VITE_API_BASE_URL` (e.g. `http://localhost:8000/api` or `https://api.pmc.janseva.gov.in/api/v1`).

### Authentication Header
Every authenticated endpoint requires a standard Bearer Token:
```http
Authorization: Bearer <accessToken>
```

### Content Types
- Standard requests & responses: `application/json; charset=utf-8`
- Evidence upload endpoint: `multipart/form-data`

### Statutory Governance Rule
> **IMPORTANT:** AI outputs (`/ai/*`) are strictly **advisory decision support signals**. No AI endpoint possesses autonomous statutory authority. All state transitions, assignments, and resolution closures must be executed by authenticated human municipal officers and logged to the immutable audit ledger.

---

## 2. Authentication & RBAC (`/auth`)

### 2.1 Officer Login
Authenticates municipal officer and issues a short-lived JWT access token.

- **METHOD:** `POST`
- **PATH:** `/auth/login`
- **AUTHORIZATION:** None (Public)
- **REQUEST BODY:**
```json
{
  "username": "rohan.patil@gov.in",
  "password": "SecurePassword123"
}
```
- **RESPONSE (200 OK):**
```json
{
  "user": {
    "id": "OFF-PMC-W12-001",
    "name": "Rohan Patil",
    "email": "rohan.patil@gov.in",
    "role": "Zonal Ward Officer",
    "department": "Municipal Administration",
    "ward": "Ward 12",
    "authorityLevel": "Level 2 — Zonal Ward Executive",
    "authorityLevelNumber": 2,
    "permissions": [
      "VIEW_DASHBOARD",
      "VIEW_COMPLAINTS",
      "ASSIGN_COMPLAINT",
      "REASSIGN_COMPLAINT",
      "PERFORM_OPERATIONAL_ACTION",
      "UPLOAD_EVIDENCE",
      "REVIEW_AI",
      "MODIFY_AI_RECOMMENDATION",
      "ESCALATE_COMPLAINT",
      "RESOLVE_COMPLAINT",
      "CONFIRM_RESOLUTION",
      "REOPEN_COMPLAINT",
      "VIEW_GIS",
      "VIEW_SLA",
      "VIEW_ANALYTICS",
      "VIEW_AUDIT_LOGS",
      "MANAGE_SETTINGS"
    ]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-08-24T08:00:00.000Z"
}
```
- **ERRORS:**
  - `400 Bad Request`: Missing username or password.
  - `401 Unauthorized`: Invalid credentials or deactivated municipal account.
  - `429 Too Many Requests`: Brute-force rate limiting triggered.

---

### 2.2 Get Current Officer Profile (`/auth/me`)
Returns the authenticated profile of the officer holding the active Bearer token.

- **METHOD:** `GET`
- **PATH:** `/auth/me`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST:** None
- **RESPONSE (200 OK):**
```json
{
  "user": {
    "id": "OFF-PMC-W12-001",
    "name": "Rohan Patil",
    "email": "rohan.patil@gov.in",
    "role": "Zonal Ward Officer",
    "department": "Municipal Administration",
    "ward": "Ward 12",
    "authorityLevel": "Level 2 — Zonal Ward Executive",
    "authorityLevelNumber": 2,
    "permissions": ["VIEW_DASHBOARD", "VIEW_COMPLAINTS", "..."]
  }
}
```
- **ERRORS:**
  - `401 Unauthorized`: Token missing, expired, or invalid.

---

### 2.3 Officer Logout (`/auth/logout`)
Invalidates the current session token on the server-side revocation list.

- **METHOD:** `POST`
- **PATH:** `/auth/logout`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST:** None
- **RESPONSE (200 OK):**
```json
{
  "success": true,
  "message": "Officer session successfully terminated."
}
```
- **ERRORS:**
  - `401 Unauthorized`: Invalid token.

---

## 3. Grievances & Complaint Lifecycle (`/complaints`)

### 3.1 List Filtered Complaints
- **METHOD:** `GET`
- **PATH:** `/complaints`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **QUERY PARAMETERS:**
  - `q` (string): Full-text search across ID, title, description, location, ward, officer.
  - `category` (string): Filter by municipal category (e.g. `Water Supply`, `Roads & Infrastructure`).
  - `ward` (string): Filter by ward (e.g. `Ward 12`, `Ward 08`).
  - `priority` (string): `Critical` | `High` | `Medium` | `Low`.
  - `status` (string): `Submitted` | `AI Classified` | `Assigned` | `In Progress` | `Resolved` | `Citizen Confirmed` | `Reopened` | `Escalated`.
  - `sla_status` (string): `ON TRACK` | `AT RISK` | `BREACHED`.
  - `limit` (number): Pagination limit (default: 50).
  - `page` (number): Page number (default: 1).
- **RESPONSE (200 OK):**
```json
[
  {
    "complaintId": "GRV-2026-0142",
    "title": "Complete water supply outage in Ward 12 residential cluster",
    "description": "No municipal water supply in Sector 4 and 5...",
    "category": "Water Supply",
    "location": "Hadapsar Sector 4 & 5, Near Noble Hospital",
    "ward": "Ward 12",
    "coordinates": { "lat": 18.5089, "lng": 73.9260 },
    "priority": "Critical",
    "severityScore": 94,
    "aiConfidence": 92,
    "authenticityScore": 96,
    "authenticityStatus": "Likely Genuine",
    "duplicateCount": 38,
    "masterIssueId": "ISSUE-2026-0092",
    "department": "Water Supply & Operations Department",
    "assignedOfficer": "Suresh Patil (Water Operations Head)",
    "status": "In Progress",
    "slaStatus": "AT RISK",
    "slaDeadline": "2026-08-22T18:00:00Z",
    "slaRemainingHours": 2.2,
    "createdAt": "2026-08-20T08:15:00Z",
    "submittedBy": "Anil Deshmukh",
    "citizenContact": "+91 98220-41829",
    "aiReviewState": "APPROVED",
    "evidence": [
      {
        "type": "image",
        "url": "/assets/evidence/water_dry_tap.jpg",
        "caption": "Dry community standpost and empty overhead tank",
        "uploadedAt": "2026-08-20T08:15:00Z",
        "uploadedBy": "Citizen"
      }
    ],
    "auditHistory": [
      {
        "timestamp": "2026-08-20T08:15:00Z",
        "actor": "Citizen (Anil Deshmukh)",
        "role": "Citizen",
        "action": "Complaint Submitted via JanSeva Web Portal"
      }
    ]
  }
]
```

---

### 3.2 Get Complaint by ID
- **METHOD:** `GET`
- **PATH:** `/complaints/:id`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):** Full Complaint Object (as above).
- **ERRORS:** `404 Not Found` if `complaintId` does not exist.

---

### 3.3 Update Status (Lifecycle Transition)
- **METHOD:** `PATCH`
- **PATH:** `/complaints/:id/status`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST BODY:**
```json
{
  "status": "In Progress",
  "reason": "Excavation team arrived at site",
  "officer_name": "Rohan Patil",
  "officer_role": "Zonal Ward Officer"
}
```
- **RESPONSE (200 OK):** Updated Complaint Object.
- **ERRORS:**
  - `400 Bad Request`: Invalid status transition or missing mandatory reason.
  - `403 Forbidden`: Officer lacks permission to transition this status.
  - `404 Not Found`: Complaint not found.

---

### 3.4 Assign / Reassign Complaint
- **METHOD:** `POST`
- **PATH:** `/complaints/:id/assign`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST BODY:**
```json
{
  "department": "Water Supply & Operations Department",
  "assigned_officer": "Suresh Patil (Water Operations Head)",
  "note": "Immediate valve inspection required",
  "officer_name": "Rohan Patil",
  "officer_role": "Zonal Ward Officer"
}
```
- **RESPONSE (200 OK):** Updated Complaint Object with updated status (`Assigned`) and audit entry.

---

### 3.5 Record Operational Action
- **METHOD:** `POST`
- **PATH:** `/complaints/:id/actions`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST BODY:**
```json
{
  "action_type": "Field Inspection",
  "description": "Inspected valve junction #4 and found pressure drop at feeder main",
  "internal_note": "Replaced worn gasket; valve reopened",
  "officer_name": "Rohan Patil",
  "officer_role": "Zonal Ward Officer"
}
```
- **RESPONSE (200 OK):** Updated Complaint Object with new audit entry.

---

### 3.6 Upload Evidence (`multipart/form-data`)
- **METHOD:** `POST`
- **PATH:** `/complaints/:id/evidence`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST HEADERS:** `Content-Type: multipart/form-data`
- **FORM FIELDS:**
  - `file`: Binary file (image/png, image/jpeg, application/pdf).
  - `evidenceType`: `"photo"` | `"inspection_report"` | `"lab_certificate"`.
  - `caption`: Descriptive text explaining the remediation evidence.
  - `metadata`: Optional JSON string containing GPS or device metadata.
  - `officer_name`: Name of uploading officer.
  - `officer_role`: Role of uploading officer.
- **RESPONSE (201 Created):** Updated Complaint Object with evidence item appended.

---

### 3.7 Submit Statutory Resolution
- **METHOD:** `POST`
- **PATH:** `/complaints/:id/resolve`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST BODY:**
```json
{
  "resolution_type": "Permanent Repair",
  "summary": "Main 600mm distribution feeder valve chamber replaced and pressure restored.",
  "actions_taken": "Replaced damaged gasket and flushed feeder pipeline for 45 minutes.",
  "affected_area": "Hadapsar Sector 4 & 5 (450 households)",
  "citizen_notified": true,
  "officer_name": "Rohan Patil",
  "officer_role": "Zonal Ward Officer"
}
```
- **RESPONSE (200 OK):** Updated Complaint Object with status set to `Resolved` and timestamp recorded.

---

### 3.8 Record Citizen Resolution Confirmation / Dispute
- **METHOD:** `POST`
- **PATH:** `/complaints/:id/confirm-resolution`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST BODY:**
```json
{
  "confirmed": true,
  "reason": "Water supply restored with normal pressure.",
  "officer_name": "Citizen (Portal OTP)",
  "officer_role": "Citizen"
}
```
- **RESPONSE (200 OK):** Updated Complaint Object with status `Citizen Confirmed` (if true) or `Reopened` (if false).

---

### 3.9 Reopen Complaint
- **METHOD:** `POST`
- **PATH:** `/complaints/:id/reopen`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST BODY:**
```json
{
  "reason": "Leakage resumed following evening pressure surge",
  "details": "Water pressure dropped again within 6 hours of initial fix",
  "officer_name": "Rohan Patil",
  "officer_role": "Zonal Ward Officer"
}
```
- **RESPONSE (200 OK):** Updated Complaint Object with status `Reopened`.

---

### 3.10 Escalate Complaint (Tier 1 $\rightarrow$ Tier 2 $\rightarrow$ Tier 3)
- **METHOD:** `POST`
- **PATH:** `/complaints/:id/escalate`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST BODY:**
```json
{
  "target_level": 2,
  "target_role": "Municipal Department Head",
  "reason": "SLA risk threshold exceeded (<4h remaining); requires inter-department coordination",
  "note": "Urgent intervention needed",
  "officer_name": "Rohan Patil",
  "officer_role": "Zonal Ward Officer"
}
```
- **RESPONSE (200 OK):** Updated Complaint Object with status `Escalated` and `escalationLevel` updated.

---

## 4. Explainable AI (XAI) & Advisory Triage (`/ai`)

### 4.1 Get AI Triage Recommendation
- **METHOD:** `GET`
- **PATH:** `/ai/recommendations/:complaintId`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):**
```json
{
  "complaintId": "GRV-2026-0142",
  "predictedCategory": "Water Supply",
  "recommendedDepartment": "Water Supply & Operations Department",
  "severityScore": 94,
  "authenticityTrustIndex": 96,
  "confidence": 92,
  "routingConfidence": 95,
  "aiSummary": "Critical multi-day potable water outage affecting 450+ residential families.",
  "xaiFactors": [
    { "name": "High Urgency & Basic Utility Outage", "contribution": 35, "explanation": "Complete interruption >72 hours" },
    { "name": "Large Population Impact (>400 families)", "contribution": 25, "explanation": "Density cluster indicates pipeline failure" },
    { "name": "Vulnerable Facility Nearby (Noble Hospital)", "contribution": 15, "explanation": "Healthcare facility within 400m radius" },
    { "name": "38 Corroborating Submissions in Cluster", "contribution": 14, "explanation": "High spatial and temporal correlation" },
    { "name": "Repeated Unresolved History in Ward", "contribution": 5, "explanation": "Previous ticket logged 14 days ago" }
  ],
  "routingReasons": [
    "Keyword detection: \"water supply\", \"pipeline failure\"",
    "Location coordinate matches Hadapsar 600mm feeder",
    "Historical precedence: Managed by Water Operations"
  ],
  "authenticityReasons": [
    "GPS coordinates match citizen verified tower location",
    "Distinct citizen identities with verified mobile OTPs"
  ],
  "duplicateCluster": {
    "clusterId": "ISSUE-2026-0092",
    "duplicateCount": 38
  }
}
```

---

### 4.2 Submit AI Review Decision (Human-in-the-Loop)
- **METHOD:** `POST`
- **PATH:** `/ai/review-decision/:complaintId`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST BODY:**
```json
{
  "review_action": "APPROVED",
  "category": "Water Supply",
  "department": "Water Supply & Operations Department",
  "severity_score": 94,
  "reason": "Advisory accepted with high confidence",
  "officer_name": "Rohan Patil",
  "officer_role": "Zonal Ward Officer"
}
```
- **RESPONSE (200 OK):** Updated Complaint Object with `aiReviewState` (`APPROVED` or `MODIFIED`).

---

### 4.3 Request On-Ground Human Verification
- **METHOD:** `POST`
- **PATH:** `/ai/request-verification/:complaintId`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **REQUEST BODY:**
```json
{
  "reason": "Conflicting citizen photo requires physical on-ground engineer validation",
  "officer_name": "Rohan Patil",
  "officer_role": "Zonal Ward Officer"
}
```
- **RESPONSE (200 OK):** Updated Complaint Object with `aiReviewState: "HUMAN VERIFICATION REQUIRED"`.

---

## 5. Geospatial Intelligence & Ward GIS (`/gis`)

### 5.1 Ward Boundaries & Polygon Geometries
- **METHOD:** `GET`
- **PATH:** `/gis/wards`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):**
```json
{
  "bounds": {
    "Ward 12": {
      "name": "Hadapsar & Swargate Zone",
      "path": "M 480,260 L 680,230 L 720,380 L 590,460 L 460,370 Z",
      "center": { "x": 580, "y": 330 },
      "color": "#0284c7"
    }
  },
  "wards": [
    { "wardId": "Ward 12", "name": "Hadapsar & Swargate Zone", "areaKm2": 4.8, "totalPopulation": 145000 }
  ]
}
```

---

### 5.2 Dynamic Ward Hotspots
- **METHOD:** `GET`
- **PATH:** `/gis/hotspots`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):**
```json
[
  {
    "wardId": "Ward 12",
    "name": "Hadapsar & Swargate Zone",
    "totalComplaints": 6,
    "criticalCount": 2,
    "highCount": 2,
    "slaRiskCount": 2,
    "slaBreachedCount": 1,
    "hotspotScore": 92,
    "riskTier": "CRITICAL",
    "dominantCategory": "Water Supply"
  }
]
```

---

### 5.3 Corroborating Spatial / Semantic Clusters
- **METHOD:** `GET`
- **PATH:** `/gis/clusters`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):**
```json
[
  {
    "clusterId": "ISSUE-2026-0092",
    "primaryTitle": "Complete water supply outage in Ward 12 residential cluster",
    "ward": "Ward 12",
    "category": "Water Supply",
    "totalReports": 38,
    "primaryLocation": "Hadapsar Sector 4 & 5",
    "coordinates": { "lat": 18.5089, "lng": 73.9260 },
    "confidence": 92
  }
]
```

---

## 6. SLA Monitoring & Escalation Engine (`/sla`)

### 6.1 SLA Priority Queue
- **METHOD:** `GET`
- **PATH:** `/sla/queue`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):** Array of grievances with `slaStatus` of `AT RISK` or `BREACHED`.

---

### 6.2 Department SLA Compliance Stats
- **METHOD:** `GET`
- **PATH:** `/sla/departments`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):**
```json
[
  {
    "department": "Water Supply & Operations Department",
    "totalActive": 6,
    "onTrack": 3,
    "atRisk": 2,
    "breached": 1,
    "criticalCount": 2,
    "complianceRate": 50
  }
]
```

---

### 6.3 Officer SLA Workload Distribution
- **METHOD:** `GET`
- **PATH:** `/sla/officers`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):**
```json
[
  {
    "id": "OFF-PMC-W12-001",
    "name": "Rohan Patil",
    "role": "Zonal Ward Officer",
    "department": "Municipal Administration",
    "assignedCount": 7,
    "atRiskCount": 2,
    "breachedCount": 1,
    "criticalCount": 3,
    "escalatedCount": 2
  }
]
```

---

## 7. Operational Analytics & AI Evaluation (`/analytics`)

### 7.1 Macro City KPIs
- **METHOD:** `GET`
- **PATH:** `/analytics/kpis`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):**
```json
{
  "totalComplaints": 20,
  "criticalRate": "25%",
  "slaComplianceRate": "60%",
  "resolutionRate": "15%",
  "aiReviewRate": "85%",
  "humanReviewRate": "15%",
  "authenticityFlagRate": "10%",
  "duplicateRate": "40%"
}
```

---

### 7.2 AI Decision Support Evaluation Metrics
- **METHOD:** `GET`
- **PATH:** `/analytics/ai-reviews`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):**
```json
{
  "total": 20,
  "approvedCount": 14,
  "modifiedCount": 3,
  "verificationReqCount": 3,
  "pendingCount": 0,
  "totalReviewed": 17,
  "overrideRate": "18%",
  "confidenceTiers": {
    "high": { "count": 12, "percent": 60 },
    "medium": { "count": 5, "percent": 25 },
    "low": { "count": 3, "percent": 15 }
  }
}
```

---

## 8. Audit Ledger & Statutory Compliance (`/audit`)

### 8.1 Filtered Audit Events
- **METHOD:** `GET`
- **PATH:** `/audit/events`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **QUERY PARAMS:** `complaint_id`, `actor`, `event_type`, `ward`, `date_from`, `date_to`.
- **RESPONSE (200 OK):**
```json
[
  {
    "eventId": "AUD-GRV-2026-0142-3",
    "complaintId": "GRV-2026-0142",
    "complaintTitle": "Complete water supply outage in Ward 12 residential cluster",
    "timestamp": "2026-08-20T09:30:00Z",
    "actor": "Rohan Patil",
    "role": "Zonal Ward Officer",
    "action": "Officer Reviewed & Approved AI Severity Recommendation",
    "department": "Water Supply & Operations Department",
    "ward": "Ward 12",
    "status": "Assigned",
    "eventType": "AI Reviewed",
    "actorType": "Officer",
    "authorityBadge": "OFFICER AUTHORITY"
  }
]
```

---

### 8.2 Statutory Governance & Compliance Checks
- **METHOD:** `GET`
- **PATH:** `/audit/compliance`
- **AUTHORIZATION:** `Bearer <accessToken>`
- **RESPONSE (200 OK):**
```json
{
  "traceabilityScore": 94,
  "checks": [
    {
      "id": "ai_review",
      "label": "AI Recommendation Reviewed by Authorized Officer",
      "status": "COMPLIANT",
      "passedCount": 20,
      "totalCount": 20
    }
  ],
  "alerts": []
}
```

---

## 9. Standard Error Envelopes & HTTP Codes

Every non-2xx error response from the backend MUST return the following JSON envelope:

```json
{
  "code": "VALIDATION_FAILED",
  "message": "Mandatory field 'reason' missing for operational escalation.",
  "status": 422,
  "details": [
    {
      "field": "reason",
      "issue": "Reason must be at least 10 characters long."
    }
  ]
}
```

### Supported HTTP Status Codes

| Code | Municipal Meaning | Frontend Handling |
| :--- | :--- | :--- |
| **200 OK** | Request succeeded | Renders view / returns data |
| **201 Created** | Record or file created | Displays success toast |
| **204 No Content** | Action completed with no payload | Updates UI state |
| **400 Bad Request** | Malformed parameters | Shows inline warning |
| **401 Unauthorized** | Token expired or invalid | Redirects officer to `/login` |
| **403 Forbidden** | Insufficient statutory authority | Toast: "Insufficient municipal authority" |
| **404 Not Found** | Grievance or record not found | Displays municipal empty state |
| **409 Conflict** | Concurrency conflict on record | Alerts officer to reload grievance |
| **422 Unprocessable**| Statutory validation failed | Highlights offending fields |
| **429 Rate Limited** | Request threshold exceeded | Suggests retry after cooling period |
| **500 Server Error** | Backend service unavailable | Graceful fallback / Retry button |

---

*Authored for PMC JanSeva AI Operations Console Team & Backend Integration Engineers.*
