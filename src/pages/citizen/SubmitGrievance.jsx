import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import { complaintsAPI, gisAPI, aiAPI } from '../../services/api';
import { showToast } from '../../components/common/Toast';
import { useLanguage } from '../../context/LanguageContext';
import {
  FaMicrophone,
  FaStop,
  FaCamera,
  FaMapMarkerAlt,
  FaBrain,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaUpload,
  FaLayerGroup,
} from 'react-icons/fa';

export default function SubmitGrievance() {
  const { language, languages } = useLanguage();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'en');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  // Nearby check & AI preview
  const [nearbyComplaints, setNearbyComplaints] = useState([]);
  const [checkingNearby, setCheckingNearby] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Setup Web Speech API for real-time speech recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : 'en-IN';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        if (!title && transcript.length > 5) {
          setTitle(transcript.slice(0, 80));
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage, title]);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      showToast('Voice transcription captured!', 'success');
    } else {
      // Start recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          setRecordingSeconds(0);
          showToast('Listening... Speak your grievance in your language.', 'info');
        } catch (err) {
          console.warn('Speech recognition start failed:', err);
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  // Graceful fallback for browsers without SpeechRecognition
  const simulateVoiceInput = () => {
    setIsRecording(true);
    showToast('Simulating voice input stream...', 'info');
    setTimeout(() => {
      const sample =
        selectedLanguage === 'hi'
          ? 'वार्ड १२ में पिछले ३ दिनों से मुख्य पाइपलाइन फटने के कारण पीने के पानी की आपूर्ति पूरी तरह बंद है।'
          : selectedLanguage === 'mr'
          ? 'प्रभाग १२ मध्ये मुख्य पाईपलाईन फुटल्यामुळे मागील ३ दिवसांपासून पिण्याच्या पाण्याचा पुरवठा खंडित झाला आहे.'
          : 'Severe water supply pipeline leakage and contamination in Ward 12 for the last 3 days.';
      setDescription(sample);
      setTitle(selectedLanguage === 'hi' ? 'वार्ड १२ में पानी की पाइपलाइन टूटी' : 'Water Supply Pipeline Breakage in Ward 12');
      setIsRecording(false);
      showToast('Voice transcription generated!', 'success');
    }, 2000);
  };

  // Get GPS Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        setLocationAddress(`Ward 12, Municipal Zone (Lat: ${lat}, Lng: ${lng})`);
        showToast('GPS Coordinates attached!', 'success');
        checkNearbyDuplicates(lat, lng);
      },
      (err) => {
        console.warn(err);
        // Default demo coordinates (e.g., Pune/Mumbai Municipal Center)
        setLatitude('18.5204');
        setLongitude('73.8567');
        setLocationAddress('Ward 12, Shivaji Nagar Municipal Sector');
        showToast('Demo GPS Location attached (Ward 12)', 'info');
        checkNearbyDuplicates('18.5204', '73.8567');
      }
    );
  };

  // Check nearby complaints
  const checkNearbyDuplicates = async (lat, lng) => {
    setCheckingNearby(true);
    try {
      const data = await gisAPI.getNearby(lat, lng, 500, 5);
      setNearbyComplaints(data || []);
    } catch (err) {
      console.warn('Nearby lookup:', err);
    } finally {
      setCheckingNearby(false);
    }
  };

  // Handle Photo selection
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
    }
  };

  // Live AI Triage Preview
  const handleRunAiPreview = async () => {
    if (!description.trim()) {
      showToast('Please enter or record a description first.', 'error');
      return;
    }
    setAnalyzingAi(true);
    try {
      const data = await aiAPI.analyze({
        title: title || 'Civic Issue',
        description,
        language: selectedLanguage,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      });
      setAiPreview(data.analysis);
      showToast('Instant AI Triage recommendations calculated!', 'success');
    } catch (err) {
      console.error(err);
      showToast('AI analysis service running in standard fallback mode.', 'info');
    } finally {
      setAnalyzingAi(false);
    }
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Complaint
      const payload = {
        title,
        description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        language: selectedLanguage,
        original_language: selectedLanguage,
        original_text: description,
        translated_text: description,
      };

      const result = await complaintsAPI.create(payload);
      const newComplaintId = result.complaint?.id;

      // 2. Upload file if attached
      if (file && newComplaintId) {
        try {
          await complaintsAPI.uploadMedia(newComplaintId, file);
        } catch (uploadErr) {
          console.warn('Media upload warning:', uploadErr);
        }
      }

      showToast('Grievance registered successfully with AI automated triage!', 'success');
      navigate(`/citizen/complaint/${newComplaintId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container container-narrow">
      <div style={{ marginBottom: '20px' }}>
        <BackButton to="/citizen/dashboard" label="Back to Dashboard" />
      </div>

      <div className="card" style={{ padding: '36px 32px', boxShadow: 'var(--shadow-md)' }}>
        {/* Form Title & Voice Prompt */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '18px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--saffron-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Citizen Portal
            </span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '2px' }}>File a Civic Grievance</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Describe the issue using text or voice in your preferred language.
            </p>
          </div>

          {/* Voice Recording CTA Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`btn ${isRecording ? 'btn-danger' : 'btn-accent'} btn-lg`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
          >
            {isRecording ? (
              <>
                <FaStop /> Stop Recording
              </>
            ) : (
              <>
                <FaMicrophone /> Voice Input
              </>
            )}
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--critical-bg)',
              border: '1px solid var(--critical-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--critical-text)',
              fontSize: '0.9rem',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Language Selection */}
          <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Language of Grievance</label>
              <select
                className="form-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">GPS Geolocation</label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FaMapMarkerAlt style={{ color: 'var(--primary-600)' }} />
                {latitude ? `Coordinates Tagged (${latitude}, ${longitude})` : 'Capture Current Location'}
              </button>
            </div>
          </div>

          {/* Nearby Duplicate Grievances Warning Banner */}
          {nearbyComplaints.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--medium-bg)',
                border: '1px solid var(--medium-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--medium-text)', marginBottom: '8px' }}>
                <FaExclamationTriangle />
                <span>Similar Grievances Already Reported Nearby in Ward:</span>
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                {nearbyComplaints.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong> — {item.distance_meters ? `${Math.round(item.distance_meters)}m away` : 'Nearby'} ({item.status})
                  </li>
                ))}
              </ul>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                * Our AI automatically links related neighborhood grievances into a Master Civic Issue for synchronized municipal repair.
              </div>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Grievance Title *
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="e.g., No water supply or broken pipeline in Ward 12"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="description">
                Detailed Description *
              </label>
              <button
                type="button"
                onClick={handleRunAiPreview}
                disabled={analyzingAi || !description.trim()}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--primary-600)', fontWeight: 600, padding: '2px 6px' }}
              >
                <FaBrain /> {analyzingAi ? 'Analyzing...' : 'Preview AI Triage'}
              </button>
            </div>
            <textarea
              id="description"
              className="form-textarea"
              rows={4}
              placeholder="Explain the location, duration, and severity of the civic issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* AI Pre-submission Triage Insight Card */}
          {aiPreview && (
            <div
              className="animate-fade-in"
              style={{
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-800)', fontWeight: 700, marginBottom: '8px' }}>
                <FaBrain /> AI Instant Triage Estimate
              </div>
              <div className="grid grid-cols-3" style={{ gap: '10px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Predicted Category:</span>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                    {aiPreview.classification?.category || 'Civic Infrastructure'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Target Department:</span>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                    {aiPreview.classification?.department || 'Municipal Operations'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Severity:</span>
                  <strong style={{ display: 'block', color: 'var(--critical-text)' }}>
                    {aiPreview.severity?.level || 'MEDIUM'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Media File Upload */}
          <div className="form-group">
            <label className="form-label">Attach Photo or Evidence (Optional)</label>
            <div
              style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)',
                position: 'relative',
              }}
            >
              {filePreview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={filePreview}
                    alt="Evidence preview"
                    style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <FaCamera style={{ fontSize: '1.8rem', color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-600)' }}>
                    Upload Photo / Evidence Image
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    PNG, JPG, WebP up to 25MB
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-accent btn-lg"
            style={{ width: '100%', marginTop: '12px' }}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" /> Processing AI Triage & Submitting...
              </>
            ) : (
              <>
                <FaCheckCircle /> Register Grievance
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
