/**
 * JanSeva AI - Comprehensive Civic Grievance Seed Data
 * Tailored for Smart India Hackathon (SIH) & National Governance Standards
 */

const JanSevaData = {
  // Master List of Realistic Grievances
  tickets: [
    {
      id: "GRV-2026-8901",
      title: "Broken 14-inch Potable Water Main Flooding Main Market Road",
      citizenName: "Rajeshwar Sharma",
      citizenPhone: "+91 98765-XXXX1",
      inputLanguage: "Hindi (हिन्दी)",
      submissionMode: "voice",
      category: "Water Supply & Sewerage",
      department: "Delhi Jal Board (DJB)",
      division: "Central Division - Ward 14",
      ward: "Ward 14 - Karol Bagh, New Delhi",
      coordinates: [28.6517, 77.1906],
      timestamp: "2026-08-16 09:15 AM",
      slaHoursTotal: 4,
      slaHoursLeft: 1.8,
      status: "In Progress", // 'New', 'In Progress', 'Resolved', 'Escalated'
      urgencyScore: 9.4,
      severity: "Critical",
      isMasterCluster: true,
      clusterCount: 42,
      rawCitizenInput: "हमारे करोल बाग मार्केट के मुख्य चौराहे पर बड़ी पानी की पाइपलाइन फट गई है। सड़क पर 2 फीट पानी भर गया है और दुकानों में घुस रहा है। ट्रैफिक पूरी तरह जाम है।",
      aiSummary: "14-inch water main burst at Karol Bagh main intersection; 2ft road flooding impacting 40+ commercial shops and causing severe vehicular gridlock. Contamination risk high.",
      photoEvidence: "assets/urban_gis_photo.jpg",
      audioSampleId: "hi_water_burst",
      cvDetection: {
        detected: "Severe Pipe Rupture & Road Waterlogging",
        confidence: 0.96,
        hazardLevel: "Critical"
      },
      xaiRubric: {
        totalScore: 94,
        rationale: "Triggered CRITICAL severity due to mass citizen volume (42 duplicate reports within 90 mins), blockage of arterial transit corridor, and potential contamination of municipal drinking supply.",
        factors: [
          { name: "Affected Population (42+ households/shops)", weight: 35, max: 35, impact: "+35" },
          { name: "Public Infrastructure & Transit Paralysis", weight: 30, max: 30, impact: "+30" },
          { name: "Drinking Water Contamination Risk", weight: 20, max: 25, impact: "+20" },
          { name: "Repeat Failure History in Ward 14", weight: 9, max: 10, impact: "+9" }
        ]
      },
      routingAudit: {
        routedTo: "Executive Engineer - Water Works (Zone 4)",
        officerInCharge: "Er. Ramesh Verma",
        humanVerified: true,
        escalationLevel: "Level 1 (Ward Officer)"
      },
      timeline: [
        { time: "09:15 AM", event: "Grievance filed via Voice Assistant (Hindi)", status: "done" },
        { time: "09:16 AM", event: "AI Semantic Deduplication: Linked 42 incoming reports to Master Issue MST-8901", status: "done" },
        { time: "09:18 AM", event: "AI XAI Priority Engine scored 9.4 (Critical) & Auto-routed to DJB Ward 14", status: "done" },
        { time: "09:30 AM", event: "Er. Ramesh Verma acknowledged ticket; Rapid Repair Crew #4 dispatched", status: "active" },
        { time: "11:00 AM (Target)", event: "SLA Deadline for Valve Isolation & Pumping", status: "pending" }
      ]
    },
    {
      id: "GRV-2026-8902",
      title: "11kV High Tension Wire Snapped & Dangling Near Govt School Gate",
      citizenName: "Sunita G. Kadam",
      citizenPhone: "+91 94231-XXXX8",
      inputLanguage: "Marathi (मराठी)",
      submissionMode: "photo",
      category: "Electricity & Power Distribution",
      department: "MSEDCL / State Power Utility",
      division: "West Division - Andheri",
      ward: "Ward K-East (Andheri East), Mumbai",
      coordinates: [19.1136, 72.8697],
      timestamp: "2026-08-16 11:40 AM",
      slaHoursTotal: 2,
      slaHoursLeft: 0.7,
      status: "New",
      urgencyScore: 9.8,
      severity: "Critical",
      isMasterCluster: true,
      clusterCount: 16,
      rawCitizenInput: "अंधेरी पूर्व मधील मनपा शाळेच्या प्रवेशद्वाराजवळ हाय-व्होल्टेज विजेची तार तुटून लटकत आहे. शाळेत मुले आहेत, तात्काळ वीजप्रवाह बंद करा.",
      aiSummary: "Snapped 11kV live power cable dangling within 1.5m of Municipal Primary School entry gate. Imminent electrocution hazard to students and pedestrians.",
      photoEvidence: "assets/urban_gis_photo.jpg",
      audioSampleId: "mr_wire_danger",
      cvDetection: {
        detected: "High Tension Exposed Conductor Arc Risk",
        confidence: 0.98,
        hazardLevel: "Critical Threat"
      },
      xaiRubric: {
        totalScore: 98,
        rationale: "MAXIMUM CRITICALITY score assigned due to acute life-safety risk in immediate proximity to child-occupied school facility during active hours.",
        factors: [
          { name: "Direct Threat to Human Life / High-Risk Area", weight: 40, max: 40, impact: "+40" },
          { name: "School Zone Proximity (< 10 meters)", weight: 30, max: 30, impact: "+30" },
          { name: "High Voltage Equipment Hazard (11kV)", weight: 20, max: 20, impact: "+20" },
          { name: "Weather / Moisture Risk Index", weight: 8, max: 10, impact: "+8" }
        ]
      },
      routingAudit: {
        routedTo: "Sub-Station Incharge (Marol Grid)",
        officerInCharge: "S. K. Deshmukh",
        humanVerified: false,
        escalationLevel: "Level 1 (Urgent Safety Alert)"
      },
      timeline: [
        { time: "11:40 AM", event: "Grievance submitted with geotagged photo", status: "done" },
        { time: "11:41 AM", event: "Computer Vision detected 11kV snapped wire hazard; Flagged Priority 9.8", status: "done" },
        { time: "11:42 AM", event: "Automated Grid Safety Alert sent to Marol Power Sub-station", status: "active" }
      ]
    },
    {
      id: "GRV-2026-8903",
      title: "Severe Road Cave-In & Deep Pothole on 100ft Transit Arterial",
      citizenName: "Karthik Subramanian",
      citizenPhone: "+91 97410-XXXX3",
      inputLanguage: "English / Kannada",
      submissionMode: "photo",
      category: "Roads & Infrastructure (PWD)",
      department: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
      division: "East Zone - Indiranagar",
      ward: "Ward 80 - Indiranagar, Bengaluru",
      coordinates: [12.9784, 77.6408],
      timestamp: "2026-08-16 08:30 AM",
      slaHoursTotal: 24,
      slaHoursLeft: 18.2,
      status: "In Progress",
      urgencyScore: 8.2,
      severity: "High",
      isMasterCluster: false,
      clusterCount: 9,
      rawCitizenInput: "Massive 2-foot deep sinkhole opened up near 12th Main Indiranagar. Two bikers already slipped this morning. Barricading and asphalt patching needed urgently.",
      aiSummary: "Sub-surface sinkhole (depth ~55cm) formed on arterial roadway causing recurring two-wheeler accidents and severe bottleneck during peak hours.",
      photoEvidence: "assets/urban_gis_photo.jpg",
      cvDetection: {
        detected: "Structural Asphalt Cave-In (Depth > 50cm)",
        confidence: 0.93,
        hazardLevel: "High"
      },
      xaiRubric: {
        totalScore: 82,
        rationale: "Assigned HIGH severity because of active vehicular collision risk, high traffic volume on 100ft road corridor, and confirmed injuries.",
        factors: [
          { name: "Traffic Volume & Road Hierarchy Index", weight: 30, max: 35, impact: "+30" },
          { name: "Physical Hazard Severity (>50cm sinkhole)", weight: 28, max: 30, impact: "+28" },
          { name: "Reported Injury Precedent", weight: 15, max: 20, impact: "+15" },
          { name: "Public Transit Route Disruption", weight: 9, max: 15, impact: "+9" }
        ]
      },
      routingAudit: {
        routedTo: "Assistant Executive Engineer - Road Infrastructure",
        officerInCharge: "K. Venkatesh",
        humanVerified: true,
        escalationLevel: "Level 1"
      },
      timeline: [
        { time: "08:30 AM", event: "Complaint registered with damage photo", status: "done" },
        { time: "08:45 AM", event: "Traffic Police alerted; Temporary safety drums deployed", status: "done" },
        { time: "09:30 AM", event: "Road Restoration Work Order #BBMP/RD/26/410 Issued", status: "active" }
      ]
    },
    {
      id: "GRV-2026-8904",
      title: "Bio-Waste Dump & Blocked Stormwater Sullage at Primary Health Center",
      citizenName: "Anandhan Murugesan",
      citizenPhone: "+91 94441-XXXX7",
      inputLanguage: "Tamil (தமிழ்)",
      submissionMode: "voice",
      category: "Public Health & Sanitation",
      department: "Greater Chennai Corporation (GCC)",
      division: "Zone 14 - South Chennai",
      ward: "Ward 177 - Velachery, Chennai",
      coordinates: [12.9750, 80.2206],
      timestamp: "2026-08-16 10:10 AM",
      slaHoursTotal: 24,
      slaHoursLeft: 19.5,
      status: "In Progress",
      urgencyScore: 8.0,
      severity: "High",
      isMasterCluster: true,
      clusterCount: 18,
      rawCitizenInput: "வேளச்சேரி ஆரம்ப சுகாதார நிலையத்தின் பின்புறம் குப்பைக் கழிவுகள் மற்றும் சாக்கடை நீர் தேங்கி கொசுக்கள் உற்பத்தியாகி வருகின்றன. நோயாளிகள் சிரமப்படுகின்றனர்.",
      aiSummary: "Stagnant untreated wastewater and municipal solid waste accumulation adjacent to Velachery Primary Health Center posing epidemic and vector-borne dengue threat.",
      photoEvidence: "assets/urban_gis_photo.jpg",
      audioSampleId: "ta_sanitation_phc",
      cvDetection: {
        detected: "Hazardous Organic Waste & Stagnant Sullage",
        confidence: 0.91,
        hazardLevel: "High"
      },
      xaiRubric: {
        totalScore: 80,
        rationale: "Assigned HIGH severity because stagnant bio-waste is situated directly adjacent to a government public health dispensary serving immunocompromised patients.",
        factors: [
          { name: "Sensitive Facility Proximity (Healthcare Clinic)", weight: 35, max: 35, impact: "+35" },
          { name: "Vector-Borne Disease Outbreak Potential", weight: 25, max: 30, impact: "+25" },
          { name: "Sanitation SLA Standard Compliance", weight: 12, max: 20, impact: "+12" },
          { name: "Repeat Zone Complaint Density", weight: 8, max: 15, impact: "+8" }
        ]
      },
      routingAudit: {
        routedTo: "Zonal Sanitary Officer - Zone 14",
        officerInCharge: "Dr. S. Meenakshi",
        humanVerified: true,
        escalationLevel: "Level 1"
      },
      timeline: [
        { time: "10:10 AM", event: "Voice grievance submitted in Tamil", status: "done" },
        { time: "10:12 AM", event: "Bhashini Transcribed & Auto-categorized to Solid Waste Management", status: "done" },
        { time: "10:45 AM", event: "Sanitation Super-Sucker vehicle deployed to site", status: "active" }
      ]
    },
    {
      id: "GRV-2026-8905",
      title: "Malfunctioning Street Lights Causing Dark Corridor in Sector 9",
      citizenName: "Pooja Malhotra",
      citizenPhone: "+91 98110-XXXX4",
      inputLanguage: "English / Hindi",
      submissionMode: "form",
      category: "Municipal Street Lighting",
      department: "Municipal Corporation of Delhi (MCD)",
      division: "North Zone - Rohini",
      ward: "Ward 52 - Rohini Sector 9, New Delhi",
      coordinates: [28.7159, 77.1189],
      timestamp: "2026-08-15 07:20 PM",
      slaHoursTotal: 48,
      slaHoursLeft: 31.0,
      status: "In Progress",
      urgencyScore: 5.8,
      severity: "Medium",
      isMasterCluster: false,
      clusterCount: 4,
      rawCitizenInput: "Street lights across 5 consecutive poles in Sector 9 Pocket B are non-functional for past 3 days. Women and elderly feel unsafe during night hours.",
      aiSummary: "Cluster of 5 consecutive streetlights non-operational on Rohini Sector 9 secondary residential stretch. Public safety concern during evening hours.",
      photoEvidence: "assets/urban_gis_photo.jpg",
      cvDetection: {
        detected: "Unlit Street Illumination Grid",
        confidence: 0.88,
        hazardLevel: "Medium"
      },
      xaiRubric: {
        totalScore: 58,
        rationale: "Assigned MEDIUM severity; standard 48-hour lighting SLA applies as main arterial lighting is functional and no immediate high-voltage hazard exists.",
        factors: [
          { name: "Night Pedestrian Safety Score", weight: 25, max: 35, impact: "+25" },
          { name: "Cluster Defect Count (5 poles)", weight: 18, max: 25, impact: "+18" },
          { name: "Non-Arterial Road Status", weight: 10, max: 20, impact: "+10" },
          { name: "Weather Safety Factor", weight: 5, max: 20, impact: "+5" }
        ]
      },
      routingAudit: {
        routedTo: "Junior Engineer (Electrical Maintenance)",
        officerInCharge: "Sh. Vikram Singh",
        humanVerified: true,
        escalationLevel: "Level 1"
      },
      timeline: [
        { time: "Yesterday 07:20 PM", event: "Citizen submitted form online", status: "done" },
        { time: "Today 09:00 AM", event: "Automated Ticket assigned to Rohini Electrical Depot", status: "done" },
        { time: "Today 02:00 PM", event: "LED fixture replacement scheduled for evening run", status: "active" }
      ]
    },
    {
      id: "GRV-2026-8906",
      title: "Unauthorized Construction Encroachment Blocking Pedestrian Footpath",
      citizenName: "Debashis Banerjee",
      citizenPhone: "+91 98300-XXXX5",
      inputLanguage: "Bengali (বাংলা)",
      submissionMode: "form",
      category: "Urban Planning & Encroachment",
      department: "Bidhannagar Municipal Corporation (BMC)",
      division: "Sector V - Salt Lake",
      ward: "Ward 31 - Salt Lake, Kolkata",
      coordinates: [22.5868, 88.4178],
      timestamp: "2026-08-14 02:15 PM",
      slaHoursTotal: 72,
      slaHoursLeft: 26.5,
      status: "In Progress",
      urgencyScore: 4.5,
      severity: "Medium",
      isMasterCluster: false,
      clusterCount: 2,
      rawCitizenInput: "সল্টলেক সেক্টর ৫-এ ফুটপাথের ওপর অবৈধভাবে নির্মাণ সামগ্রী ফেলে রাখা হয়েছে, যার ফলে পথচারীদের রাস্তায় হাঁটতে হচ্ছে।",
      aiSummary: "Construction debris and unauthorized steel scaffolding encroaching 80% of sidewalk width forcing pedestrians into motorized traffic lanes.",
      photoEvidence: "assets/urban_gis_photo.jpg",
      cvDetection: {
        detected: "Sidewalk Obstruction & Material Encroachment",
        confidence: 0.89,
        hazardLevel: "Medium"
      },
      xaiRubric: {
        totalScore: 45,
        rationale: "Assigned STANDARD MEDIUM severity as obstruction is non-structural, requiring administrative enforcement notice rather than emergency technical dispatch.",
        factors: [
          { name: "Pedestrian Right-of-Way Impact", weight: 22, max: 35, impact: "+22" },
          { name: "Obstruction Reversibility Score", weight: 12, max: 25, impact: "+12" },
          { name: "Commercial Zone Regulation Index", weight: 7, max: 20, impact: "+7" },
          { name: "First-time Offender Address", weight: 4, max: 20, impact: "+4" }
        ]
      },
      routingAudit: {
        routedTo: "Encroachment Removal Inspector",
        officerInCharge: "Sh. Soumen Ghosh",
        humanVerified: true,
        escalationLevel: "Level 1"
      },
      timeline: [
        { time: "14 Aug 02:15 PM", event: "Complaint registered with photo evidence", status: "done" },
        { time: "15 Aug 11:30 AM", event: "Notice issued to builder under BMC Act Section 240", status: "done" },
        { time: "Today 10:00 AM", event: "Follow-up site inspection scheduled for 4:00 PM", status: "active" }
      ]
    },
    {
      id: "GRV-2026-8907",
      title: "Contaminated Muddy Water Supply with Chemical Odor in Residential Colony",
      citizenName: "Manisha Pawar",
      citizenPhone: "+91 98200-XXXX9",
      inputLanguage: "Marathi (मराठी)",
      submissionMode: "voice",
      category: "Water Supply & Sewerage",
      department: "Brihanmumbai Municipal Corporation (BMC)",
      division: "G-North Ward - Dadar",
      ward: "Ward G-North - Dadar West, Mumbai",
      coordinates: [19.0178, 72.8478],
      timestamp: "2026-08-16 06:45 AM",
      slaHoursTotal: 6,
      slaHoursLeft: 0.9,
      status: "In Progress",
      urgencyScore: 9.1,
      severity: "Critical",
      isMasterCluster: true,
      clusterCount: 31,
      rawCitizenInput: "दादर पश्चिम लेन क्र. 4 मध्ये नळाला अत्यंत घाण, काळे पाणी येत आहे. विषारी वास येत असून लहान मुले आजारी पडत आहेत.",
      aiSummary: "Severe sewage ingress into municipal drinking water pipeline in Dadar West; black contaminated water with chemical odor affecting 31+ residential households.",
      photoEvidence: "assets/urban_gis_photo.jpg",
      audioSampleId: "mr_water_poison",
      cvDetection: {
        detected: "Potable Water Contamination & Sewage Ingress",
        confidence: 0.95,
        hazardLevel: "Critical Health Emergency"
      },
      xaiRubric: {
        totalScore: 91,
        rationale: "Assigned CRITICAL severity due to cross-contamination of domestic drinking pipelines resulting in reported gastrointestinal illness among vulnerable residents.",
        factors: [
          { name: "Public Health Risk & Waterborne Illness", weight: 35, max: 35, impact: "+35" },
          { name: "Rapid Cluster Spread (31 reports in 2 hours)", weight: 30, max: 30, impact: "+30" },
          { name: "Vulnerable Demographics (Children & Elderly)", weight: 18, max: 20, impact: "+18" },
          { name: "Underground Cross-Connection Severity", weight: 8, max: 15, impact: "+8" }
        ]
      },
      routingAudit: {
        routedTo: "Hydraulic Engineer's Department (G-North)",
        officerInCharge: "Er. Nitin Shinde",
        humanVerified: true,
        escalationLevel: "Level 1 (Critical Escalation)"
      },
      timeline: [
        { time: "06:45 AM", event: "First voice complaint received in Marathi", status: "done" },
        { time: "07:15 AM", event: "AI Cluster Engine linked 31 identical complaints; Triggered Emergency Alert", status: "done" },
        { time: "07:45 AM", event: "Water supply isolated; Alternative clean water tanker dispatched to Lane 4", status: "active" }
      ]
    }
  ],

  // Voice Simulation Presets (for live prototype audio demonstration)
  voicePresets: [
    {
      id: "hi_water_burst",
      language: "Hindi (हिन्दी)",
      label: "Water Main Rupture - Karol Bagh (Hindi)",
      transcript: "हमारे करोल बाग मार्केट के मुख्य चौराहे पर बड़ी पानी की पाइपलाइन फट गई है। सड़क पर 2 फीट पानी भर गया है और दुकानों में घुस रहा है। ट्रैफिक पूरी तरह जाम है।",
      englishTranslation: "A major water pipeline has burst at the main intersection of Karol Bagh Market. 2 feet of water has flooded the street and is entering shops. Traffic is completely jammed.",
      extractedCategory: "Water Supply & Sewerage",
      extractedLocation: "Karol Bagh Market, New Delhi",
      extractedSeverity: "Critical (9.4 / 10)",
      targetDepartment: "Delhi Jal Board (DJB)"
    },
    {
      id: "ta_sanitation_phc",
      language: "Tamil (தமிழ்)",
      label: "Health Hazard & Bio-Waste - Velachery (Tamil)",
      transcript: "வேளச்சேரி ஆரம்ப சுகாதார நிலையத்தின் பின்புறம் குப்பைக் கழிவுகள் மற்றும் சாக்கடை நீர் தேங்கி கொசுக்கள் உற்பத்தியாகி வருகின்றன. நோயாளிகள் சிரமப்படுகின்றனர்.",
      englishTranslation: "Behind the Velachery Primary Health Center, garbage waste and sewage water have stagnated, causing mosquitoes to breed. Patients are suffering.",
      extractedCategory: "Public Health & Sanitation",
      extractedLocation: "Velachery Ward 177, Chennai",
      extractedSeverity: "High (8.0 / 10)",
      targetDepartment: "Greater Chennai Corporation (GCC)"
    },
    {
      id: "mr_wire_danger",
      language: "Marathi (मराठी)",
      label: "11kV Live Snapped Wire - Andheri (Marathi)",
      transcript: "अंधेरी पूर्व मधील मनपा शाळेच्या प्रवेशद्वाराजवळ हाय-व्होल्टेज विजेची तार तुटून लटकत आहे. शाळेत मुले आहेत, तात्काळ वीजप्रवाह बंद करा.",
      englishTranslation: "A high-voltage electrical wire has snapped and is dangling near the municipal school gate in Andheri East. Children are in school, cut the power immediately.",
      extractedCategory: "Electricity & Power Distribution",
      extractedLocation: "Andheri East Ward K-East, Mumbai",
      extractedSeverity: "Critical (9.8 / 10)",
      targetDepartment: "MSEDCL Power Utility"
    },
    {
      id: "bn_road_block",
      language: "Bengali (বাংলা)",
      label: "Pedestrian Sidewalk Obstruction - Salt Lake (Bengali)",
      transcript: "সল্টলেক সেক্টর ৫-এ ফুটপাথের ওপর অবৈধভাবে নির্মাণ সামগ্রী ফেলে রাখা হয়েছে, যার ফলে পথচারীদের রাস্তায় হাঁটতে হচ্ছে।",
      englishTranslation: "Construction materials have been illegally dumped on the sidewalk in Salt Lake Sector 5, forcing pedestrians to walk on the main vehicular road.",
      extractedCategory: "Urban Planning & Encroachment",
      extractedLocation: "Salt Lake Sector V, Kolkata",
      extractedSeverity: "Medium (4.5 / 10)",
      targetDepartment: "Bidhannagar Municipal Corporation"
    }
  ],

  // Semantic Duplicate Clusters summary data
  semanticClusters: [
    {
      clusterId: "CLUST-DEL-8901",
      masterTicketId: "GRV-2026-8901",
      topic: "Broken 14-inch Water Main at Karol Bagh Crossroads",
      duplicateTicketsCount: 42,
      firstReportTime: "07:45 AM",
      latestReportTime: "09:15 AM",
      timeSpanMins: 90,
      similarityConfidence: "97.4% (IndicBERT Semantic Distance: 0.08)",
      department: "Delhi Jal Board",
      ward: "Ward 14 - Karol Bagh",
      workloadHoursSaved: 38.5,
      bulkStatus: "Repair Team Active on Site"
    },
    {
      clusterId: "CLUST-MUM-8907",
      masterTicketId: "GRV-2026-8907",
      topic: "Contaminated Muddy Water Ingress in Dadar West Lane 4",
      duplicateTicketsCount: 31,
      firstReportTime: "05:30 AM",
      latestReportTime: "06:45 AM",
      timeSpanMins: 75,
      similarityConfidence: "98.1% (IndicBERT Semantic Distance: 0.05)",
      department: "BMC Hydraulic Engineering",
      ward: "Ward G-North - Dadar",
      workloadHoursSaved: 28.0,
      bulkStatus: "Water Tanker Dispatched & Supply Isolated"
    },
    {
      clusterId: "CLUST-CHN-8904",
      masterTicketId: "GRV-2026-8904",
      topic: "Bio-Waste Accumulation at Velachery PHC Clinic",
      duplicateTicketsCount: 18,
      firstReportTime: "08:10 AM",
      latestReportTime: "10:10 AM",
      timeSpanMins: 120,
      similarityConfidence: "94.6% (IndicBERT Semantic Distance: 0.12)",
      department: "GCC Solid Waste",
      ward: "Ward 177 - Velachery",
      workloadHoursSaved: 16.2,
      bulkStatus: "Super-Sucker Deployed"
    }
  ],

  // Platform Metrics
  platformKPIs: {
    totalGrievancesLodged: 14892,
    activeResolutionInProgress: 1420,
    criticalSlaBreachRisk: 3,
    clusteredDuplicatesCount: 4120,
    masterTicketsCreated: 86,
    duplicateReductionPercent: "72.3%",
    averageResolutionDays: 3.2,
    baselineOldDays: 18.4,
    citizenSatisfactionRating: 4.7,
    aiRoutingAccuracy: "96.8%"
  }
};
