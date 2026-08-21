/**
 * JanSeva AI - Explainable AI (XAI) & Dynamic Priority Scoring Engine
 * Provides transparent, auditable justification for AI priority and routing
 */

const XaiEngine = {
  // Render full XAI audit drawer content for a given ticket
  renderTicketXai(ticket) {
    const rubric = ticket.xaiRubric;
    const badgeClass = ticket.severity === 'Critical' ? 'badge-critical' : ticket.severity === 'High' ? 'badge-high' : 'badge-medium';

    let factorsHtml = '';
    rubric.factors.forEach(f => {
      const pct = Math.min(100, Math.round((f.weight / f.max) * 100));
      factorsHtml += `
        <div class="xai-factor-row">
          <span class="factor-name">${f.name}</span>
          <div class="factor-bar-wrapper">
            <div class="factor-bar-fill" style="width: ${pct}%; background:${ticket.severity === 'Critical' ? '#ef4444' : '#f97316'};"></div>
          </div>
          <span class="factor-impact">${f.impact}</span>
        </div>
      `;
    });

    return `
      <div class="xai-audit-card">
        <div class="xai-header">
          <div class="xai-title">
            <span>🔍 Explainable AI (XAI) Priority Attribution</span>
          </div>
          <span class="badge ${badgeClass}">
            Score: ${ticket.urgencyScore} / 10 (${ticket.severity})
          </span>
        </div>

        <div class="xai-reason-summary">
          <strong>AI Reasoning:</strong> ${rubric.rationale}
        </div>

        <div class="xai-factor-list">
          ${factorsHtml}
        </div>
      </div>
    `;
  },

  // Generates AI-assisted officer response in English & Citizen's Native Language
  generateCitizenResponse(ticket, officerNotes = "Rapid response crew has isolated the issue and replacement work is currently underway on-site.") {
    const lang = ticket.inputLanguage.split(' ')[0];
    let nativeTranslation = "";

    if (lang.includes("Hindi")) {
      nativeTranslation = "नमस्ते श्री " + ticket.citizenName + ", आपकी शिकायत (आईडी: " + ticket.id + ") पर त्वरित कार्रवाई करते हुए टीम को मौके पर भेज दिया गया है। मरम्मत कार्य प्रगति पर है।";
    } else if (lang.includes("Tamil")) {
      nativeTranslation = "வணக்கம் திரு " + ticket.citizenName + ", உங்கள் புகார் (எண்: " + ticket.id + ") மீது உடனடியாக நடவடிக்கை எடுக்கப்பட்டு பணிக்குழு அனுப்பப்பட்டுள்ளது.";
    } else if (lang.includes("Marathi")) {
      nativeTranslation = "नमस्कार श्री/श्रीमती " + ticket.citizenName + ", आपल्या तक्रारीवर (आयडी: " + ticket.id + ") तातडीने कारवाई करून दुरुस्ती पथक घटनास्थळी दाखल झाले आहे.";
    } else if (lang.includes("Bengali")) {
      nativeTranslation = "নমস্কার, আপনার অভিযোগ (আইডি: " + ticket.id + ") অনুযায়ী দ্রুত পদক্ষেপ গ্রহণ করা হয়েছে এবং মেরামতকারী দল কাজ শুরু করেছে।";
    } else {
      nativeTranslation = "Dear " + ticket.citizenName + ", action has been initiated on your grievance (ID: " + ticket.id + "). Repair team is currently deployed on-site.";
    }

    return {
      englishDraft: `Action has been initiated on Grievance #${ticket.id} (${ticket.category}). ${officerNotes} Expected resolution within SLA deadline.`,
      nativeDraft: nativeTranslation,
      targetLanguage: ticket.inputLanguage,
      channel: "SMS & WhatsApp Citizen Gateway"
    };
  }
};
