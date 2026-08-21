/**
 * JanSeva AI - Multilingual Voice & Multimodal Grievance Ingestion Engine
 * Simulates Bhashini ASR, IndicBERT Translation & Entity Extraction
 */

const VoiceEngine = {
  isRecording: false,
  animationFrameId: null,
  canvas: null,
  ctx: null,
  currentPresetIndex: 0,

  initCanvas(canvasElement) {
    this.canvas = canvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      this.drawIdleWaveform();
    }
  },

  drawIdleWaveform() {
    if (!this.ctx || !this.canvas) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.clearRect(0, 0, width, height);

    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2);
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin(x * 0.05) * 4;
      this.ctx.lineTo(x, y);
    }
    this.ctx.strokeStyle = "rgba(249, 115, 22, 0.4)";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  },

  startWaveformAnimation() {
    if (!this.ctx || !this.canvas) return;
    let step = 0;
    const animate = () => {
      if (!this.isRecording) return;
      const width = this.canvas.width;
      const height = this.canvas.height;
      this.ctx.clearRect(0, 0, width, height);

      // Draw multi-layered voice wave
      for (let layer = 1; layer <= 3; layer++) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x++) {
          const frequency = 0.04 * layer;
          const amplitude = (Math.sin(step * 0.1 + layer) * 15 + 10) * (Math.sin(x * 0.02) + 0.5);
          const y = height / 2 + Math.sin(x * frequency + step * 0.15) * amplitude;
          this.ctx.lineTo(x, y);
        }
        this.ctx.strokeStyle = layer === 1 ? "#f97316" : layer === 2 ? "#38bdf8" : "#22c55e";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      step++;
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  },

  stopWaveformAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.drawIdleWaveform();
  },

  // Toggle live voice recording simulation
  toggleRecording(onCompleteCallback) {
    const micBtn = document.getElementById("modalMicBtn");
    const statusText = document.getElementById("voiceRecordStatus");

    if (!this.isRecording) {
      this.isRecording = true;
      if (micBtn) micBtn.classList.add("recording");
      if (statusText) statusText.textContent = "Listening... Speak in Hindi, Tamil, Marathi, Bengali, etc.";
      this.startWaveformAnimation();

      // Automatically simulate user speaking for 3.5 seconds
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
          const preset = JanSevaData.voicePresets[this.currentPresetIndex % JanSevaData.voicePresets.length];
          this.currentPresetIndex++;
          if (onCompleteCallback) onCompleteCallback(preset);
        }
      }, 3500);
    } else {
      this.stopRecording();
    }
  },

  stopRecording() {
    this.isRecording = false;
    const micBtn = document.getElementById("modalMicBtn");
    const statusText = document.getElementById("voiceRecordStatus");
    if (micBtn) micBtn.classList.remove("recording");
    if (statusText) statusText.textContent = "Audio captured. Processing Bhashini ASR Pipeline...";
    this.stopWaveformAnimation();
  },

  // Process a chosen voice preset
  processPreset(presetId, onCompleteCallback) {
    const preset = JanSevaData.voicePresets.find(p => p.id === presetId) || JanSevaData.voicePresets[0];
    const statusText = document.getElementById("voiceRecordStatus");
    if (statusText) statusText.textContent = `Streaming ASR for [${preset.language}]...`;

    this.isRecording = true;
    this.startWaveformAnimation();

    setTimeout(() => {
      this.stopRecording();
      if (onCompleteCallback) onCompleteCallback(preset);
    }, 1800);
  },

  // Convert preset output to a new registered ticket
  createTicketFromVoice(preset) {
    const newId = `GRV-2026-${Math.floor(8910 + Math.random() * 90)}`;
    const newTicket = {
      id: newId,
      title: `${preset.extractedCategory} - ${preset.extractedLocation.split(',')[0]}`,
      citizenName: "Aadhaar Verified Citizen",
      citizenPhone: "+91 98XXX-XXXXX",
      inputLanguage: preset.language,
      submissionMode: "voice",
      category: preset.extractedCategory,
      department: preset.targetDepartment,
      division: "Zonal Field Unit",
      ward: preset.extractedLocation,
      coordinates: [28.6139 + (Math.random() - 0.5) * 0.1, 77.2090 + (Math.random() - 0.5) * 0.1],
      timestamp: "Just now",
      slaHoursTotal: 24,
      slaHoursLeft: 23.9,
      status: "New",
      urgencyScore: preset.extractedSeverity.includes("Critical") ? 9.2 : 7.8,
      severity: preset.extractedSeverity.includes("Critical") ? "Critical" : "High",
      isMasterCluster: false,
      clusterCount: 1,
      rawCitizenInput: preset.transcript,
      aiSummary: preset.englishTranslation,
      photoEvidence: "assets/urban_gis_photo.jpg",
      cvDetection: {
        detected: preset.extractedCategory,
        confidence: 0.94,
        hazardLevel: preset.extractedSeverity
      },
      xaiRubric: {
        totalScore: preset.extractedSeverity.includes("Critical") ? 92 : 78,
        rationale: `Automatically triaged to ${preset.targetDepartment} with priority derived from voice tone analysis, urgent hazard keywords, and location vulnerability.`,
        factors: [
          { name: "Voice Acoustic Urgency Metric", weight: 32, max: 35, impact: "+32" },
          { name: "Hazard Classification Severity", weight: 28, max: 30, impact: "+28" },
          { name: "Public Transit Impact", weight: 18, max: 20, impact: "+18" },
          { name: "Geographic Vulnerability Index", weight: 14, max: 15, impact: "+14" }
        ]
      },
      routingAudit: {
        routedTo: `Zonal Engineer (${preset.targetDepartment})`,
        officerInCharge: "On-Duty Nodal Officer",
        humanVerified: false,
        escalationLevel: "Level 1"
      },
      timeline: [
        { time: "Just now", event: `Grievance filed via Voice AI in ${preset.language}`, status: "done" },
        { time: "Just now", event: `Deep-routed to ${preset.targetDepartment}`, status: "active" }
      ]
    };

    JanSevaData.tickets.unshift(newTicket);
    return newTicket;
  }
};
