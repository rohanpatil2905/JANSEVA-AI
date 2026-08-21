/**
 * JanSeva AI - Master Application Controller
 * Wires up Citizen UI, Officer Command Center, Voice Engine, GIS, XAI, and Chatbot
 */

const App = {
  activeView: "citizen",
  activeFilter: "all",
  activeTicketId: null,
  currentTrackingId: "GRV-2026-8901",
  fontSizeIndex: 1, // 0: A-, 1: A, 2: A+

  init() {
    this.bindGlobalEvents();
    this.renderCitizenView();
    this.renderOfficerTable();
    this.populateLanguageDropdown();
    this.startLiveSlaTick();

    // Init canvas for voice waveform
    const canvas = document.getElementById("voiceWaveCanvas");
    if (canvas) {
      VoiceEngine.initCanvas(canvas);
    }
  },

  // =========================================================================
  // Navigation & View Switching
  // =========================================================================
  switchView(viewName) {
    this.activeView = viewName;

    // Update Nav buttons
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
    });

    // Update Section containers
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.toggle("active", sec.id === `view-${viewName}`);
    });

    // If switching to officer command center or GIS, initialize or resize map
    if (viewName === "officer" || viewName === "analytics") {
      setTimeout(() => {
        GisMapEngine.initMap();
        if (GisMapEngine.map) {
          GisMapEngine.map.invalidateSize();
        }
      }, 150);
    }

    if (viewName === "voice-demo") {
      setTimeout(() => {
        const demoCanvas = document.getElementById("demoWaveCanvas");
        if (demoCanvas) VoiceEngine.initCanvas(demoCanvas);
      }, 150);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // =========================================================================
  // Citizen Portal Rendering & Logic
  // =========================================================================
  renderCitizenView() {
    this.renderCitizenTickets();
    this.renderTrackingStepper(this.currentTrackingId);
  },

  renderCitizenTickets() {
    const listContainer = document.getElementById("citizenTicketList");
    if (!listContainer) return;

    listContainer.innerHTML = JanSevaData.tickets.map(ticket => {
      const isCrit = ticket.severity === "Critical";
      const isHigh = ticket.severity === "High";
      const badgeClass = isCrit ? "badge-critical" : isHigh ? "badge-high" : "badge-medium";
      const statusBadge = ticket.status === "Resolved" ? "badge-resolved" : ticket.status === "In Progress" ? "badge-progress" : "badge-pending";

      return `
        <div class="ticket-item-card" onclick="App.selectTrackingTicket('${ticket.id}')" style="cursor:pointer;">
          <div class="ticket-item-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="ticket-id-tag">${ticket.id}</span>
              <span class="badge ${badgeClass}"><span class="pulse-dot ${isCrit ? 'critical' : ''}"></span> ${ticket.severity}</span>
              ${ticket.isMasterCluster ? `<span class="badge badge-cluster">🔥 ${ticket.clusterCount} Linked Reports</span>` : ''}
            </div>
            <span class="badge ${statusBadge}">${ticket.status}</span>
          </div>

          <div class="ticket-item-body">
            <h4>${ticket.title}</h4>
            <p>${ticket.aiSummary}</p>
          </div>

          <div class="ticket-meta-pills">
            <div class="meta-pill-item">🏛️ <strong>Dept:</strong> ${ticket.department}</div>
            <div class="meta-pill-item">📍 <strong>Ward:</strong> ${ticket.ward.split(',')[0]}</div>
            <div class="meta-pill-item">⏱️ <strong>SLA Left:</strong> ${ticket.slaHoursLeft.toFixed(1)}h</div>
            <div class="meta-pill-item" style="margin-left:auto; color:var(--tiranga-saffron-dark); font-weight:700;">
              🔍 Click to Track Timeline &rarr;
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  selectTrackingTicket(ticketId) {
    this.currentTrackingId = ticketId;
    this.renderTrackingStepper(ticketId);
    this.showToast(`Tracking updated for Ticket #${ticketId}`);
  },

  renderTrackingStepper(ticketId) {
    const ticket = JanSevaData.tickets.find(t => t.id === ticketId) || JanSevaData.tickets[0];
    const headerTitle = document.getElementById("stepperTicketId");
    const headerDept = document.getElementById("stepperDeptName");
    const timelineContainer = document.getElementById("stepperTimelineList");

    if (headerTitle) headerTitle.textContent = `${ticket.id} - ${ticket.category}`;
    if (headerDept) headerDept.textContent = `${ticket.department} (${ticket.ward})`;

    if (timelineContainer) {
      timelineContainer.innerHTML = ticket.timeline.map((step, idx) => `
        <div class="step-node ${step.status === 'done' ? 'completed' : step.status === 'active' ? 'active' : ''}">
          <div class="step-dot">${step.status === 'done' ? '✓' : idx + 1}</div>
          <div class="step-title">${step.event}</div>
          <div class="step-desc">Assigned to: ${ticket.routingAudit.officerInCharge}</div>
          <div class="step-timestamp">${step.time}</div>
        </div>
      `).join("");
    }
  },

  // =========================================================================
  // Officer Command Center Rendering & Logic
  // =========================================================================
  renderOfficerTable() {
    const tbody = document.getElementById("triageTableBody");
    if (!tbody) return;

    const searchTerm = (document.getElementById("triageSearch")?.value || "").toLowerCase();

    const filtered = JanSevaData.tickets.filter(t => {
      if (this.activeFilter === "critical" && t.severity !== "Critical") return false;
      if (this.activeFilter === "high" && t.severity !== "High") return false;
      if (this.activeFilter === "clustered" && !t.isMasterCluster) return false;
      if (this.activeFilter === "progress" && t.status !== "In Progress") return false;
      if (searchTerm && !t.title.toLowerCase().includes(searchTerm) && !t.id.toLowerCase().includes(searchTerm) && !t.ward.toLowerCase().includes(searchTerm)) {
        return false;
      }
      return true;
    });

    tbody.innerHTML = filtered.map(t => {
      const isCrit = t.severity === "Critical";
      const isBreaching = t.slaHoursLeft < 2.0;

      return `
        <tr onclick="App.openTicketDrawer('${t.id}')">
          <td>
            <div class="ticket-cell-id">${t.id}</div>
            <div style="font-size:0.7rem; color:#64748b;">${t.timestamp}</div>
          </td>
          <td>
            <div style="font-weight:600; color:#0f172a;">${t.citizenName}</div>
            <div style="font-size:0.72rem; color:#64748b;">🗣️ ${t.inputLanguage} (${t.submissionMode})</div>
          </td>
          <td>
            <span class="ticket-cell-title">${t.title}</span>
            <span class="ticket-cell-sub">📍 ${t.ward}</span>
          </td>
          <td>
            <div style="font-weight:600; color:#091e3a; font-size:0.78rem;">${t.department}</div>
            <div style="font-size:0.72rem; color:#64748b;">Officer: ${t.routingAudit.officerInCharge}</div>
          </td>
          <td>
            <span class="badge ${isCrit ? 'badge-critical' : 'badge-high'}">
              <span class="pulse-dot ${isCrit ? 'critical' : ''}"></span>
              ${t.urgencyScore} / 10
            </span>
          </td>
          <td>
            <span class="sla-countdown-tag ${isBreaching ? 'breaching' : 'normal'}">
              ⏱️ ${t.slaHoursLeft.toFixed(1)}h left
            </span>
          </td>
          <td>
            ${t.isMasterCluster ? `<span class="badge badge-cluster">🔥 ${t.clusterCount} linked</span>` : `<span style="color:#94a3b8; font-size:0.75rem;">Single</span>`}
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); App.openTicketDrawer('${t.id}')">
              Inspect XAI
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  setTableFilter(filterKey) {
    this.activeFilter = filterKey;
    document.querySelectorAll(".filter-pill-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-filter") === filterKey);
    });
    this.renderOfficerTable();
  },

  // =========================================================================
  // Ticket Inspection Drawer & XAI Actions
  // =========================================================================
  openTicketDrawer(ticketId) {
    const ticket = JanSevaData.tickets.find(t => t.id === ticketId) || JanSevaData.tickets[0];
    this.activeTicketId = ticket.id;

    const drawer = document.getElementById("ticketDetailDrawer");
    const drawerTitle = document.getElementById("drawerTicketHeader");
    const drawerBody = document.getElementById("drawerBodyContent");

    if (drawerTitle) {
      drawerTitle.innerHTML = `
        <div>
          <span style="font-family:monospace; font-size:1.1rem; color:#f97316;">${ticket.id}</span>
          <span style="font-size:0.85rem; opacity:0.8; margin-left:8px;">${ticket.department}</span>
        </div>
      `;
    }

    if (drawerBody) {
      const responseDraft = XaiEngine.generateCitizenResponse(ticket);
      const clusterHtml = ticket.isMasterCluster ? ClusteringEngine.renderClusterDetails(ticket.id === "GRV-2026-8901" ? "CLUST-DEL-8901" : "CLUST-MUM-8907") : "";

      drawerBody.innerHTML = `
        <!-- AI Executive Summary Card -->
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:#166534;">
              🤖 AI-Synthesized Executive Summary
            </span>
            <span style="font-size:0.72rem; background:#dcfce7; color:#15803d; font-weight:700; padding:2px 8px; border-radius:999px;">
              Confidence: 96.8%
            </span>
          </div>
          <p style="font-size:0.88rem; font-weight:600; color:#14532d; line-height:1.5;">
            ${ticket.aiSummary}
          </p>
          <div style="font-size:0.76rem; color:#166534; margin-top:6px; font-style:italic;">
            Original Citizen Input (${ticket.inputLanguage}): "${ticket.rawCitizenInput}"
          </div>
        </div>

        <!-- Semantic Cluster Section if applicable -->
        ${clusterHtml}

        <!-- Explainable AI (XAI) Attribution Module -->
        ${XaiEngine.renderTicketXai(ticket)}

        <!-- Multimodal Evidence & CV Analysis -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem;">
          <h4 style="font-size:0.9rem; font-weight:700; color:#091e3a; margin-bottom:0.75rem;">
            📸 Multimodal Hazard Evidence & CV Detection
          </h4>
          <div class="photo-scan-view" style="margin-bottom:0.75rem;">
            <img src="${ticket.photoEvidence}" alt="Grievance Evidence" class="photo-scan-image" />
            <div class="cv-bounding-box">
              <span class="cv-tag">🚨 ${ticket.cvDetection.detected} (${(ticket.cvDetection.confidence * 100).toFixed(0)}%)</span>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:#64748b;">
            <span>📍 Geotag: ${ticket.coordinates[0]}, ${ticket.coordinates[1]}</span>
            <span>🏛️ Assigned: ${ticket.ward}</span>
          </div>
        </div>

        <!-- AI-Assisted Citizen Response Generator -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem;">
          <h4 style="font-size:0.9rem; font-weight:700; color:#091e3a; margin-bottom:0.5rem; display:flex; align-items:center; gap:6px;">
            <span>📝 AI-Assisted Multilingual Citizen Response Generator</span>
          </h4>
          <p style="font-size:0.78rem; color:#64748b; margin-bottom:0.75rem;">
            Officer drafts key action notes in English; JanSeva AI automatically translates back into the citizen's native language (${ticket.inputLanguage}).
          </p>

          <div style="margin-bottom:0.75rem;">
            <label style="font-size:0.72rem; font-weight:700; text-transform:uppercase; color:#475569; display:block; margin-bottom:4px;">
              Officer Action Remarks (English):
            </label>
            <textarea id="officerNoteInput" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px; font-size:0.82rem; font-family:sans-serif; height:65px;">${responseDraft.englishDraft}</textarea>
          </div>

          <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:10px; margin-bottom:0.75rem;">
            <div style="font-size:0.72rem; font-weight:700; color:#c2410c; margin-bottom:4px;">
              🌐 Auto-Translated Citizen SMS / WhatsApp (${ticket.inputLanguage}):
            </div>
            <div id="translatedResponsePreview" style="font-size:0.82rem; color:#9a3412; font-weight:600; line-height:1.4;">
              ${responseDraft.nativeDraft}
            </div>
          </div>

          <button class="btn btn-saffron btn-sm" onclick="App.sendCitizenResponse('${ticket.id}')" style="width:100%;">
            📲 Approve & Dispatch Notice to Citizen (+91 ${ticket.citizenPhone.slice(-6)})
          </button>
        </div>

        <!-- Human-in-the-Loop Override & Hierarchy Escalation -->
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="App.dispatchCrew('${ticket.id}')" style="flex:1;">
            🚨 Dispatch Rapid Action Crew
          </button>
          <button class="btn btn-outline" onclick="App.markResolved('${ticket.id}')" style="flex:1;">
            ✓ Mark Resolved with Verification
          </button>
        </div>
      `;
    }

    if (drawer) drawer.classList.add("open");
  },

  closeTicketDrawer() {
    const drawer = document.getElementById("ticketDetailDrawer");
    if (drawer) drawer.classList.remove("open");
  },

  // Officer Actions
  dispatchCrew(ticketId) {
    const ticket = JanSevaData.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = "In Progress";
      ticket.timeline.unshift({
        time: "Just now",
        event: "Rapid Action Field Team #4 dispatched with GPS tracking",
        status: "active"
      });
      this.renderCitizenTickets();
      this.renderOfficerTable();
      this.closeTicketDrawer();
      this.showToast(`Crew dispatched for ${ticket.id} (${ticket.ward.split(',')[0]})`);
    }
  },

  markResolved(ticketId) {
    const ticket = JanSevaData.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = "Resolved";
      ticket.timeline.unshift({
        time: "Just now",
        event: "Issue verified resolved by Zonal Engineer; Closure report generated",
        status: "done"
      });
      this.renderCitizenTickets();
      this.renderOfficerTable();
      this.closeTicketDrawer();
      this.showToast(`Ticket #${ticket.id} marked as Resolved!`);
    }
  },

  sendCitizenResponse(ticketId) {
    this.showToast(`SMS & WhatsApp update successfully delivered in citizen's native language!`);
  },

  broadcastClusterUpdate(clusterId) {
    const cluster = JanSevaData.semanticClusters.find(c => c.clusterId === clusterId);
    if (cluster) {
      this.showToast(`Broadcast sent to all ${cluster.duplicateTicketsCount} citizens in ${cluster.ward}!`);
    }
  },

  // =========================================================================
  // Voice Modal Controls & Simulation
  // =========================================================================
  openVoiceModal() {
    const modal = document.getElementById("voiceGrievanceModal");
    if (modal) {
      modal.classList.add("open");
      const canvas = document.getElementById("voiceWaveCanvas");
      if (canvas) VoiceEngine.initCanvas(canvas);
    }
  },

  closeVoiceModal() {
    const modal = document.getElementById("voiceGrievanceModal");
    if (modal) {
      modal.classList.remove("open");
      VoiceEngine.stopRecording();
    }
  },

  triggerVoiceMic() {
    VoiceEngine.toggleRecording((preset) => {
      this.displayVoiceResult(preset);
    });
  },

  selectVoicePreset(presetId) {
    VoiceEngine.processPreset(presetId, (preset) => {
      this.displayVoiceResult(preset);
    });
  },

  displayVoiceResult(preset) {
    const resultBox = document.getElementById("voiceResultSection");
    const transcriptEl = document.getElementById("voiceTranscriptText");
    const translationEl = document.getElementById("voiceTranslationText");
    const catEl = document.getElementById("voiceExtractedCat");
    const locEl = document.getElementById("voiceExtractedLoc");
    const sevEl = document.getElementById("voiceExtractedSev");
    const deptEl = document.getElementById("voiceExtractedDept");

    if (transcriptEl) transcriptEl.textContent = `"${preset.transcript}"`;
    if (translationEl) translationEl.textContent = `"${preset.englishTranslation}"`;
    if (catEl) catEl.textContent = preset.extractedCategory;
    if (locEl) locEl.textContent = preset.extractedLocation;
    if (sevEl) sevEl.textContent = preset.extractedSeverity;
    if (deptEl) deptEl.textContent = preset.targetDepartment;

    if (resultBox) resultBox.style.display = "block";
  },

  submitVoiceGrievance() {
    const transcriptEl = document.getElementById("voiceTranscriptText");
    const translationEl = document.getElementById("voiceTranslationText");
    const catEl = document.getElementById("voiceExtractedCat");
    const locEl = document.getElementById("voiceExtractedLoc");
    const sevEl = document.getElementById("voiceExtractedSev");
    const deptEl = document.getElementById("voiceExtractedDept");

    const preset = {
      language: "Auto-Detected Indic",
      transcript: transcriptEl ? transcriptEl.textContent.replace(/"/g, '') : "Water pipe burst",
      englishTranslation: translationEl ? translationEl.textContent.replace(/"/g, '') : "Water pipeline burst at main intersection",
      extractedCategory: catEl ? catEl.textContent : "Water Supply",
      extractedLocation: locEl ? locEl.textContent : "Karol Bagh, Delhi",
      extractedSeverity: sevEl ? sevEl.textContent : "Critical (9.4 / 10)",
      targetDepartment: deptEl ? deptEl.textContent : "Delhi Jal Board"
    };

    const newTicket = VoiceEngine.createTicketFromVoice(preset);
    this.closeVoiceModal();
    this.renderCitizenTickets();
    this.renderOfficerTable();
    this.selectTrackingTicket(newTicket.id);
    this.showToast(`🎉 Grievance registered successfully! Tracking ID: ${newTicket.id}`);
  },

  // =========================================================================
  // Photo Hazard Scan Modal
  // =========================================================================
  openPhotoModal() {
    const modal = document.getElementById("photoHazardModal");
    if (modal) modal.classList.add("open");
  },

  closePhotoModal() {
    const modal = document.getElementById("photoHazardModal");
    if (modal) modal.classList.remove("open");
  },

  submitPhotoHazard() {
    const newTicket = {
      id: `GRV-2026-${Math.floor(8920 + Math.random() * 80)}`,
      title: "Deep Pothole & Asphalt Rupture Detected via AI Camera",
      citizenName: "Mobile Scanner User",
      citizenPhone: "+91 97110-XXXX2",
      inputLanguage: "English / Hindi",
      submissionMode: "photo",
      category: "Roads & Infrastructure (PWD)",
      department: "PWD Road Safety Division",
      division: "Zonal Field Unit",
      ward: "Ward 12 - Connaught Place, New Delhi",
      coordinates: [28.6315, 77.2167],
      timestamp: "Just now",
      slaHoursTotal: 24,
      slaHoursLeft: 24.0,
      status: "New",
      urgencyScore: 8.4,
      severity: "High",
      isMasterCluster: false,
      clusterCount: 1,
      rawCitizenInput: "Geotagged hazard snapshot uploaded via mobile camera scanner.",
      aiSummary: "Computer vision identified deep structural asphalt pothole (depth 18cm) on active vehicular lane. Barricade recommended.",
      photoEvidence: "assets/urban_gis_photo.jpg",
      cvDetection: {
        detected: "Severe Road Cavity (Depth 18cm)",
        confidence: 0.95,
        hazardLevel: "High Risk"
      },
      xaiRubric: {
        totalScore: 84,
        rationale: "High priority assigned based on AI depth estimation and arterial traffic risk factor.",
        factors: [
          { name: "Pothole Depth Metric (>15cm)", weight: 32, max: 35, impact: "+32" },
          { name: "Traffic Flow Hazard Index", weight: 28, max: 30, impact: "+28" },
          { name: "Two-Wheeler Skid Probability", weight: 15, max: 20, impact: "+15" },
          { name: "Weather Deterioration Metric", weight: 9, max: 15, impact: "+9" }
        ]
      },
      routingAudit: {
        routedTo: "Executive Engineer (PWD Roads)",
        officerInCharge: "Sh. A. K. Gupta",
        humanVerified: false,
        escalationLevel: "Level 1"
      },
      timeline: [
        { time: "Just now", event: "Photo analyzed by Computer Vision AI", status: "done" },
        { time: "Just now", event: "Auto-routed to PWD Road Safety Division", status: "active" }
      ]
    };

    JanSevaData.tickets.unshift(newTicket);
    this.closePhotoModal();
    this.renderCitizenTickets();
    this.renderOfficerTable();
    this.selectTrackingTicket(newTicket.id);
    this.showToast(`📸 Photo Hazard scanned & registered! ID: ${newTicket.id}`);
  },

  // =========================================================================
  // JanSeva Saathi AI Chatbot
  // =========================================================================
  toggleSaathiChat() {
    const chatWin = document.getElementById("saathiChatWindow");
    if (chatWin) chatWin.classList.toggle("open");
  },

  sendSaathiMessage() {
    const input = document.getElementById("saathiInput");
    const container = document.getElementById("saathiMessagesContainer");
    if (!input || !container) return;

    const userText = input.value.trim();
    if (!userText) return;

    // Append User Message
    container.innerHTML += `
      <div class="chat-bubble user">
        ${userText}
      </div>
    `;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    // Simulate AI thinking and reply
    setTimeout(() => {
      let botReply = "";
      const lower = userText.toLowerCase();

      if (lower.includes("water") || lower.includes("पानी") || lower.includes("pipe")) {
        botReply = "I noticed you are mentioning a water supply or pipeline issue. Would you like me to speak and file a voice grievance directly with Delhi Jal Board / Municipal Water Works?";
      } else if (lower.includes("track") || lower.includes("status") || lower.includes("8901")) {
        botReply = "Grievance #GRV-2026-8901 (Karol Bagh Water Main) is currently **In Progress**. Rapid Response Team #4 is on-site with 1.8h remaining before SLA resolution.";
      } else if (lower.includes("pothole") || lower.includes("road") || lower.includes("सड़क")) {
        botReply = "For road potholes and cave-ins, you can use our **Photo Hazard Scanner** to upload a quick picture. The AI will calculate the depth and auto-dispatch PWD road crews.";
      } else {
        botReply = "I understand! You can speak your grievance in any of 22 Indian languages by clicking 'बोलकर शिकायत दर्ज करें', or give me your Ticket ID to track live progress.";
      }

      container.innerHTML += `
        <div class="chat-bubble bot">
          <strong>🤖 JanSeva Saathi:</strong><br/>
          ${botReply}
        </div>
      `;
      container.scrollTop = container.scrollHeight;
    }, 600);
  },

  // =========================================================================
  // Accessibility & Localization Controls
  // =========================================================================
  populateLanguageDropdown() {
    const select = document.getElementById("headerLangSelect");
    if (!select) return;

    select.innerHTML = JanSevaI18n.supportedLanguages.map(l => `
      <option value="${l.code}">${l.native} (${l.name})</option>
    `).join("");

    select.addEventListener("change", (e) => {
      JanSevaI18n.setLanguage(e.target.value);
      this.showToast(`Language switched to ${e.target.options[e.target.selectedIndex].text}`);
    });
  },

  toggleHighContrast() {
    document.body.classList.toggle("high-contrast");
    const isHc = document.body.classList.contains("high-contrast");
    this.showToast(isHc ? "High Contrast Mode Enabled (WCAG AAA)" : "Standard Contrast Mode");
  },

  adjustFontSize(direction) {
    const sizes = ["14px", "16px", "18px"];
    if (direction === "increase" && this.fontSizeIndex < 2) this.fontSizeIndex++;
    if (direction === "decrease" && this.fontSizeIndex > 0) this.fontSizeIndex--;
    if (direction === "reset") this.fontSizeIndex = 1;

    document.documentElement.style.setProperty("--base-font-size", sizes[this.fontSizeIndex]);
  },

  // =========================================================================
  // Live SLA Clock Tick & Toast System
  // =========================================================================
  startLiveSlaTick() {
    setInterval(() => {
      JanSevaData.tickets.forEach(ticket => {
        if (ticket.status === "In Progress" || ticket.status === "New") {
          ticket.slaHoursLeft = Math.max(0.1, ticket.slaHoursLeft - 0.01);
        }
      });
      if (this.activeView === "officer") {
        this.renderOfficerTable();
      }
    }, 15000);
  },

  showToast(message) {
    let container = document.getElementById("globalToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "globalToastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>🇮🇳</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Global Event Listeners
  bindGlobalEvents() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeVoiceModal();
        this.closePhotoModal();
        this.closeTicketDrawer();
      }
    });
  }
};

// Auto boot on load
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
