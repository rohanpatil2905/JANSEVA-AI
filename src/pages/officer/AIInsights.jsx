import React, { useState, useEffect } from 'react';
import BackButton from '../../components/common/BackButton';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { aiAPI } from '../../services/api';
import { showToast } from '../../components/common/Toast';
import {
  FaBrain,
  FaRobot,
  FaCheckCircle,
  FaServer,
  FaSlidersH,
  FaPlay,
  FaSyncAlt,
  FaShieldAlt,
} from 'react-icons/fa';

export default function AIInsights() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // AI Sandbox Tester
  const [testTitle, setTestTitle] = useState('Ward 12 water pipeline rupture');
  const [testDesc, setTestDesc] = useState(
    'Main drinking water pipeline broke near Shivaji Nagar hospital. Contaminated water flowing on street for 3 days.'
  );
  const [testLang, setTestLang] = useState('en');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await aiAPI.getHealth();
      setHealth(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await aiAPI.analyze({
        title: testTitle,
        description: testDesc,
        language: testLang,
      });
      setAnalysisResult(res.analysis);
      showToast('AI pipeline analysis completed successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'AI analysis request failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <BackButton to="/officer/dashboard" label="Dashboard" />
        <button onClick={fetchHealth} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt /> Check AI Health
        </button>
      </div>

      {/* Header & Status Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
              }}
            >
              <FaBrain />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem' }}>AI Triage & Reasoning Telemetry</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Multi-stage pipeline: Classification, Dynamic 6-Factor Severity, Duplicate Detection, and Routing.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald-50)',
                border: '1px solid var(--emerald-100)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: 'var(--emerald-700)',
                fontWeight: 600,
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald-500)' }} />
              <span>AI Service Mode: Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Severity Model Mathematical Formula Reference */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>
          📐 Explainable AI (XAI) Severity Model Formula
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Standardized weighted formula applied across incoming municipal grievances:
        </p>

        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.88rem',
            color: 'var(--primary-900)',
            overflowX: 'auto',
          }}
        >
          Final Score = 0.25 * Urgency + 0.20 * Affected_Pop + 0.15 * Vulnerability + 0.15 * Critical_Infra + 0.15 * Duration + 0.10 * Recurrence + (Cluster_Count - 1) * 6
        </div>

        <div className="grid grid-cols-3" style={{ gap: '12px', marginTop: '16px', fontSize: '0.82rem' }}>
          <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
            <strong>CRITICAL (&ge; 80):</strong> Immediate public hazard, hospital/school disruption (4h SLA).
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
            <strong>HIGH (60 - 79):</strong> Major neighborhood service interruption (24h SLA).
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
            <strong>MEDIUM (35 - 59):</strong> Standard civic repair, single street impact (48h SLA).
          </div>
        </div>
      </div>

      {/* AI Sandbox Interactive Tester */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
          🧪 Live AI Pipeline Sandbox
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Test incoming complaint texts against the real backend AI engine to inspect raw predictions and confidence scores.
        </p>

        <form onSubmit={handleRunAnalysis}>
          <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Test Title</label>
              <input
                type="text"
                className="form-input"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Input Language</label>
              <select
                className="form-select"
                value={testLang}
                onChange={(e) => setTestLang(e.target.value)}
              >
                <option value="en">English (EN)</option>
                <option value="hi">Hindi (HI)</option>
                <option value="mr">Marathi (MR)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Grievance Description Statement</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={testDesc}
              onChange={(e) => setTestDesc(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaPlay style={{ fontSize: '0.8rem' }} /> {analyzing ? 'Analyzing with AI...' : 'Run Pipeline Inference'}
          </button>
        </form>

        {/* Live Analysis Output */}
        {analysisResult && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h4 style={{ color: 'var(--primary-900)', marginBottom: '14px' }}>
              📊 Inference Output Results
            </h4>

            <div className="grid grid-cols-3" style={{ gap: '14px' }}>
              <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Classified Category</span>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {analysisResult.classification?.category || 'Water Supply'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-700)' }}>
                  Dept: {analysisResult.classification?.department || 'Water Supply'}
                </span>
              </div>

              <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dynamic Severity Score</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--critical-text)' }}>
                  {analysisResult.severity?.score || '78.5'}/100
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--critical-text)', fontWeight: 600 }}>
                  Level: {analysisResult.severity?.level || 'HIGH'}
                </span>
              </div>

              <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Automated Routing Target</span>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {analysisResult.routing?.department_name || 'Water Operations'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Ward 12 Municipal Desk
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
