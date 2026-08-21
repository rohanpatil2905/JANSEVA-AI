/**
 * JanSeva AI - 22-Language Multilingual Localization Engine (Bhashini AI Inspired)
 */

const JanSevaI18n = {
  // Complete 22 Scheduled Indian Languages Registry
  supportedLanguages: [
    { code: "en", name: "English", native: "English", script: "Latin" },
    { code: "hi", name: "Hindi", native: "हिन्दी", script: "Devanagari" },
    { code: "ta", name: "Tamil", native: "தமிழ்", script: "Tamil" },
    { code: "mr", name: "Marathi", native: "मराठी", script: "Devanagari" },
    { code: "bn", name: "Bengali", native: "বাংলা", script: "Bengali" },
    { code: "te", name: "Telugu", native: "తెలుగు", script: "Telugu" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી", script: "Gujarati" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", script: "Kannada" },
    { code: "ml", name: "Malayalam", native: "മലയാളം", script: "Malayalam" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", script: "Gurmukhi" },
    { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", script: "Odia" },
    { code: "as", name: "Assamese", native: "অসমীয়া", script: "Bengali-Assamese" },
    { code: "ur", name: "Urdu", native: "اردو", script: "Arabic-Persian" },
    { code: "sa", name: "Sanskrit", native: "संस्कृतम्", script: "Devanagari" },
    { code: "ks", name: "Kashmiri", native: "کٲشُر / कॉशुर", script: "Perso-Arabic" },
    { code: "ne", name: "Nepali", native: "नेपाली", script: "Devanagari" },
    { code: "sd", name: "Sindhi", native: "سنڌي / सिन्धी", script: "Arabic/Devanagari" },
    { code: "kok", name: "Konkani", native: "कोंकणी", script: "Devanagari" },
    { code: "doi", name: "Dogri", native: "डोगरी", script: "Devanagari" },
    { code: "mai", name: "Maithili", native: "मैथिली", script: "Devanagari" },
    { code: "brx", name: "Bodo", native: "बड़ो", script: "Devanagari" },
    { code: "sat", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", script: "Ol Chiki" }
  ],

  // Translation Strings
  translations: {
    en: {
      platformTitle: "JanSeva AI",
      platformTagline: "Smart Grievance Intelligence & Redressal System",
      navCitizen: "Citizen Portal",
      navOfficer: "Officer Command Center",
      navAnalytics: "National Intelligence",
      navXai: "Explainable AI (XAI) Lab",
      navVoiceDemo: "Live Voice Simulator",
      heroHeadline: "Empowering Citizens with Instant, AI-Driven Civic Redressal",
      heroSub: "Speak in any Indian language or upload photos. JanSeva AI automatically transcribes, de-duplicates, prioritizes, and routes complaints to the exact municipal ward officer.",
      searchPlaceholder: "Search schemes, categories, or enter Ticket ID (e.g. GRV-2026-8901)...",
      actionVoice: "Speak Your Grievance",
      actionVoiceSub: "Voice input in 22 Indian languages with automatic Indic translation",
      actionPhoto: "Photo Hazard Scanner",
      actionPhotoSub: "AI computer vision instantly detects road and sewer hazards",
      actionForm: "Structured Grievance Form",
      actionFormSub: "Step-by-step submission with automatic ward tagging",
      actionTrack: "Track Ticket Status",
      actionTrackSub: "Real-time transparent PNR-style milestone timeline",
      kpiTotal: "Total Grievances Filed",
      kpiPending: "Active in Progress",
      kpiResolved: "Successfully Resolved",
      kpiSlaRate: "Avg Resolution Time",
      activeGrievancesTitle: "Your Active Grievances",
      trackSectionTitle: "Live Redressal Stepper",
      slaNotice: "SLA Deadline",
      urgencyBadge: "Severity",
      saathiGreeting: "Namaste! I am JanSeva Saathi, your AI assistant. How can I help resolve your civic grievance today?"
    },
    hi: {
      platformTitle: "जनसेवा AI (JanSeva AI)",
      platformTagline: "स्मार्ट नागरिक शिकायत एवं त्वरित निवारण प्रणाली",
      navCitizen: "नागरिक पोर्टल",
      navOfficer: "अधिकारी कमान केंद्र",
      navAnalytics: "राष्ट्रीय डैशबोर्ड",
      navXai: "स्पष्टीकरणीय AI (XAI) लैब",
      navVoiceDemo: "लाइव वॉइस सिमुलेटर",
      heroHeadline: "AI-संचालित तकनीक से नागरिक समस्याओं का त्वरित समाधान",
      heroSub: "अपनी मातृभाषा में बोलें या फ़ोटो अपलोड करें। जनसेवा AI स्वचालित रूप से शिकायत का अनुवाद, डुप्लीकेट फ़िल्टरिंग, प्राथमिकता निर्धारण और संबंधित वार्ड अधिकारी को अग्रेषित करता है।",
      searchPlaceholder: "शिकायत का विषय या टिकट संख्या खोजें (जैसे GRV-2026-8901)...",
      actionVoice: "बोलकर शिकायत दर्ज करें",
      actionVoiceSub: "22 भारतीय भाषाओं में बोलें, AI स्वचालित अनुवाद करेगा",
      actionPhoto: "फ़ोटो / वीडियो स्कैन",
      actionPhotoSub: "AI कैमरा सड़क गड्ढों और जलभराव की पहचान करता है",
      actionForm: "विस्तृत ऑनलाइन फॉर्म",
      actionFormSub: "स्वचालित वार्ड और विभाग चयन के साथ आसान फॉर्म",
      actionTrack: "शिकायत की स्थिति जांचें",
      actionTrackSub: "पारदर्शी समयसीमा और अधिकारी की लाइव प्रगति देखें",
      kpiTotal: "कुल दर्ज शिकायतें",
      kpiPending: "प्रक्रियाधीन",
      kpiResolved: "सफलतापूर्वक हल",
      kpiSlaRate: "औसत समाधान समय",
      activeGrievancesTitle: "आपकी सक्रिय शिकायतें",
      trackSectionTitle: "निवारण स्थिति ट्रैकर",
      slaNotice: "निवारण समयसीमा",
      urgencyBadge: "प्राथमिकता",
      saathiGreeting: "नमस्ते! मैं आपका सहायक 'जनसेवा साथी' हूँ। आज आपकी किस नागरिक समस्या के समाधान में सहायता करूँ?"
    },
    ta: {
      platformTitle: "ஜன்சேவா AI (JanSeva AI)",
      platformTagline: "திறன்மிகு பொதுக் குறைதீர்ப்பு மற்றும் தீர்வு தளம்",
      navCitizen: "குடிமக்கள் தளம்",
      navOfficer: "அதிகாரிகள் கட்டுப்பாட்டு மையம்",
      navAnalytics: "தேசிய நுண்ணறிவு",
      navXai: "விளக்கக்கூடிய AI (XAI) ஆய்வகம்",
      navVoiceDemo: "நேரலை குரல் மாதிரி",
      heroHeadline: "மக்களுக்கு உடனடி, AI-வழி பொதுக் குறைதீர்ப்பு சேவை",
      heroSub: "தமிழில் பேசவும் அல்லது புகைப்படங்களை பதிவேற்றவும். ஜன்சேவா AI தானாகவே புகாரை மொழிபெயர்த்து, முன்னுரிமை அளித்து சரியான வார்டு அதிகாரிக்கு அனுப்புகிறது.",
      searchPlaceholder: "புகார் எண் அல்லது தலைப்பைத் தேடவும் (எ.கா. GRV-2026-8901)...",
      actionVoice: "குரல் வழி புகார் பதிவு",
      actionVoiceSub: "தமிழில் பேசி எளிதாக புகார் பதிவு செய்யலாம்",
      actionPhoto: "புகைப்பட ஆபத்து ஸ்கேனர்",
      actionPhotoSub: "AI கணினி பார்வை சாலை ஆபத்துகளை கண்டறியும்",
      actionForm: "படிவப் பதிவு",
      actionFormSub: "வார்டு விவரங்களுடன் முழுமையான பதிவு",
      actionTrack: "நிலை அறிய",
      actionTrackSub: "உடனடி நேரலை முன்னேற்றப் பாதை",
      kpiTotal: "மொத்த புகார்கள்",
      kpiPending: "செயலில் உள்ளது",
      kpiResolved: "தீர்க்கப்பட்டது",
      kpiSlaRate: "சராசரி தீர்வு நேரம்",
      activeGrievancesTitle: "உங்கள் புகார்கள்",
      trackSectionTitle: "நேரலை கண்காணிப்பு",
      slaNotice: "கடைசி நேரம்",
      urgencyBadge: "முன்னுரிமை",
      saathiGreeting: "வணக்கம்! நான் உங்கள் ஜன்சேவா சாதி AI உதவியாளர். உங்கள் புகாரை எவ்வாறு பதிவு செய்ய வேண்டும்?"
    },
    mr: {
      platformTitle: "जनसेवा AI (JanSeva AI)",
      platformTagline: "स्मार्ट नागरिक तक्रार निवारण व गुप्तचर प्रणाली",
      navCitizen: "नागरिक पोर्टल",
      navOfficer: "अधिकारी नियंत्रण कक्ष",
      navAnalytics: "राष्ट्रीय डॅशबोर्ड",
      navXai: "स्पष्टीकरणात्मक AI (XAI)",
      navVoiceDemo: "व्हॉइस सिमुलेटर",
      heroHeadline: "AI तंत्रज्ञानाद्वारे नागरिक तक्रारींचे जलद व पारदर्शक निवारण",
      heroSub: "मराठीत बोला किंवा फोटो अपलोड करा. जनसेवा AI तक्रार समजून, तात्काळ योग्य प्रभाग अधिकाऱ्याकडे पाठवते.",
      searchPlaceholder: "तक्रार क्रमांक किंवा विषय शोधा (उदा. GRV-2026-8901)...",
      actionVoice: "बोलून तक्रार नोंदवा",
      actionVoiceSub: "मराठी भाषेत थेट बोलून तक्रार नोंदवण्याची सुविधा",
      actionPhoto: "फोटो / व्हिडिओ स्कॅन",
      actionPhotoSub: "AI कॅमेऱ्याद्वारे रस्त्यांचे खड्डे व धोक्यांची तपासणी",
      actionForm: "सविस्तर अर्ज भरा",
      actionFormSub: "प्रभाग व विभागाची अचूक निवड",
      actionTrack: "तक्रारीची स्थिती तपासा",
      actionTrackSub: "अधिकाऱ्यांच्या कारवाईचा थेट मागोवा घ्या",
      kpiTotal: "एकूण तक्रारी",
      kpiPending: "प्रलंबित",
      kpiResolved: "निवारण झाले",
      kpiSlaRate: "सरासरी निवारण वेळ",
      activeGrievancesTitle: "आपल्या चालू तक्रारी",
      trackSectionTitle: "थेट निवारण ट्रॅकर",
      slaNotice: "निवारण कालमर्यादा",
      urgencyBadge: "तीव्रता",
      saathiGreeting: "नमस्कार! मी तुमचा जनसेवा साथी AI सहाय्यक आहे. आज मी तुम्हाला कोणती तक्रार सोडवण्यासाठी मदत करू?"
    },
    bn: {
      platformTitle: "জনসেবা AI (JanSeva AI)",
      platformTagline: "স্মার্ট নাগরিক অভিযোগ সমাধান প্ল্যাটফর্ম",
      navCitizen: "নাগরিক পোর্টাল",
      navOfficer: "অফিসার কমান্ড সেন্টার",
      navAnalytics: "জাতীয় বিশ্লেষণ",
      navXai: "ব্যাখ্যাযোগ্য AI ল্যাব",
      navVoiceDemo: "ভয়েস সিমুলেটর",
      heroHeadline: "AI প্রযুক্তির মাধ্যমে নাগরিক অভিযোগের দ্রুত সমাধান",
      heroSub: "বাংলায় কথা বলুন বা ছবি আপলোড করুন। জনসেবা AI স্বয়ংক্রিয়ভাবে অনুবাদ করে সঠিক ওয়ার্ড অফিসারের কাছে পাঠায়।",
      searchPlaceholder: "অভিযোগ আইডি বা বিষয় অনুসন্ধান করুন...",
      actionVoice: "কথা বলে অভিযোগ নথিভুক্ত করুন",
      actionVoiceSub: "বাংলা ভাষায় কথা বলুন, AI স্বয়ংক্রিয়ভাবে নথিভুক্ত করবে",
      actionPhoto: "ছবি স্ক্যান করুন",
      actionPhotoSub: "AI রাস্তার গর্ত ও বিপদ শনাক্ত করবে",
      actionForm: "অনলাইন ফর্ম",
      actionFormSub: "ওয়ার্ড ও বিভাগ ভিত্তিক ফর্ম",
      actionTrack: "অভিযোগের স্থিতি",
      actionTrackSub: "লাইভ অগ্রগতি ট্র্যাকার",
      kpiTotal: "মোট অভিযোগ",
      kpiPending: "চলমান",
      kpiResolved: "সমাধান হয়েছে",
      kpiSlaRate: "গড় সমাধান সময়",
      activeGrievancesTitle: "আপনার সক্রিয় অভিযোগ",
      trackSectionTitle: "সমাধান ট্র্যাকার",
      slaNotice: "সময়সীমা",
      urgencyBadge: "জরুরী অবস্থা",
      saathiGreeting: "নমস্কার! আমি জনসেবা সাথী AI। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?"
    },
    te: {
      platformTitle: "జనసేవ AI (JanSeva AI)",
      platformTagline: "స్మార్ట్ ప్రజా ఫిర్యాదుల పరిష్కార వ్యవస్థ",
      navCitizen: "పౌర పోర్టల్",
      navOfficer: "అధికారుల కమాండ్ సెంటర్",
      navAnalytics: "జాతీయ డ్యాష్‌బోర్డ్",
      navXai: "వివరణాత్మక AI ల్యాబ్",
      navVoiceDemo: "వాయిస్ సిమ్యులేటర్",
      heroHeadline: "AI సాంకేతికతతో ప్రజా సమస్యల తక్షణ పరిష్కారం",
      heroSub: "తెలుగులో మాట్లాడండి లేదా ఫోటోను అప్‌లోడ్ చేయండి. జనసేవ AI స్వయంచాలకంగా వార్డు అధికారికి పంపుతుంది.",
      searchPlaceholder: "ఫిర్యాదు ఐడీ లేదా వివరాలు వెతకండి...",
      actionVoice: "మాట్లాడి ఫిర్యాదు చేయండి",
      actionVoiceSub: "తెలుగులో మాట్లాడి సులభంగా ఫిర్యాదు చేయండి",
      actionPhoto: "ఫోటో స్కాన్ చేయండి",
      actionPhotoSub: "AI ప్రమాదాలను గుర్తిస్తుంది",
      actionForm: "ఆన్‌లైన్ ఫారం",
      actionFormSub: "వార్డు విభాగ వివరాలతో నమోదు చేయండి",
      actionTrack: "స్థితిని తనిఖీ చేయండి",
      actionTrackSub: "ప్రత్యక్ష పరిష్కార పురోగతి",
      kpiTotal: "మొత్తం ఫిర్యాదులు",
      kpiPending: "పురోగతిలో ఉంది",
      kpiResolved: "పరిష్కరించబడింది",
      kpiSlaRate: "సగటు పరిష్కార సమయం",
      activeGrievancesTitle: "మీ ప్రస్తుత ఫిర్యాదులు",
      trackSectionTitle: "లైవ్ ట్రాకర్",
      slaNotice: "పరిష్కార గడువు",
      urgencyBadge: "తీవ్రత",
      saathiGreeting: "నమస్కారం! నేను మీ జనసేవ సాథీ AI సహాయకుడిని. ఈ రోజు మీకు ఎలా సహాయపడగలను?"
    }
  },

  currentLang: "en",

  setLanguage(langCode) {
    if (this.translations[langCode]) {
      this.currentLang = langCode;
      this.applyTranslations();
    }
  },

  t(key) {
    const langObj = this.translations[this.currentLang] || this.translations.en;
    return langObj[key] || this.translations.en[key] || key;
  },

  applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const trans = this.t(key);
      if (trans) {
        if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
          el.placeholder = trans;
        } else {
          el.textContent = trans;
        }
      }
    });
  }
};
