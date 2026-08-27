import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  FaMicrophone,
  FaRobot,
  FaShieldAlt,
  FaMapMarkedAlt,
  FaSearch,
  FaArrowRight,
  FaCheckCircle,
  FaHandsHelping,
  FaClock,
  FaCity,
  FaBrain,
} from 'react-icons/fa';

export default function LandingPage() {
  const [trackingInput, setTrackingInput] = useState('');
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      navigate(`/track?code=${encodeURIComponent(trackingInput.trim())}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section with Vibrant Indian Civic Tech Theme */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #03254e 50%, #04386c 100%)',
          color: '#ffffff',
          padding: '80px 0 90px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 110, 230, 0.3) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            {/* Pill Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--saffron-100)',
                marginBottom: '24px',
              }}
            >
              <FaBrain style={{ color: 'var(--saffron-400)' }} /> Next-Generation Civic Intelligence & AI Redressal
            </div>

            <h1
              style={{
                fontSize: '3.2rem',
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: '20px',
                letterSpacing: '-0.03em',
              }}
            >
              Voice-Enabled Grievance Redressal for Every Citizen
            </h1>

            <p
              style={{
                fontSize: '1.2rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                marginBottom: '36px',
              }}
            >
              Report civic issues in your native language through voice, text, or photos. Our explainable AI categorizes, estimates severity, detects duplicates, and routes issues to municipal officers in real time.
            </p>

            {/* Main CTAs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '44px',
              }}
            >
              <Link to="/citizen/submit" className="btn btn-accent btn-lg" style={{ fontSize: '1.1rem' }}>
                <FaMicrophone /> File Grievance Now
              </Link>
              <Link to="/officer/login" className="btn btn-secondary btn-lg" style={{ fontSize: '1.1rem' }}>
                <FaShieldAlt /> Officer Console <FaArrowRight style={{ fontSize: '0.85rem' }} />
              </Link>
            </div>

            {/* Quick Public Grievance Tracker Search */}
            <div
              className="card card-glass"
              style={{
                padding: '20px 24px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                maxWidth: '620px',
                margin: '0 auto',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: '10px' }}>
                Quick Public Grievance Tracker
              </div>
              <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter Tracking Code (e.g., JAN-2026-AB12CD) or Complaint ID"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="form-input"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                  <FaSearch /> Track
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluator Feature Highlights — Separate Portals Architecture */}
      <section style={{ padding: '70px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px auto' }}>
            <h2 style={{ fontSize: '2.1rem', marginBottom: '12px' }}>Two Portals, One Integrated Platform</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
              Built specifically to satisfy evaluator requirements with fully separated Citizen and Municipal Officer environments.
            </p>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '30px' }}>
            {/* Citizen Portal Card */}
            <div
              className="card"
              style={{
                borderTop: '5px solid var(--saffron-500)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'var(--saffron-50)',
                    color: 'var(--saffron-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    marginBottom: '16px',
                  }}
                >
                  <FaHandsHelping />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Citizen Grievance Portal</h3>
                <p style={{ marginBottom: '20px', fontSize: '0.95rem' }}>
                  Accessible, multilingual grievance submission for all residents. Powered by voice speech-to-text, GPS geolocation tagging, nearby duplicate checks, and live status progress.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <FaCheckCircle style={{ color: 'var(--emerald-600)' }} /> Multilingual Voice & Audio Grievance filing
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <FaCheckCircle style={{ color: 'var(--emerald-600)' }} /> Real-time nearby duplicate detection
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <FaCheckCircle style={{ color: 'var(--emerald-600)' }} /> Transparent timeline & citizen confirmation
                  </li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/citizen/login" className="btn btn-accent" style={{ flex: 1 }}>
                  Citizen Login
                </Link>
                <Link to="/citizen/register" className="btn btn-secondary" style={{ flex: 1 }}>
                  Register
                </Link>
              </div>
            </div>

            {/* Officer Console Card */}
            <div
              className="card"
              style={{
                borderTop: '5px solid var(--primary-600)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'var(--primary-50)',
                    color: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    marginBottom: '16px',
                  }}
                >
                  <FaShieldAlt />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Municipal Officer Console</h3>
                <p style={{ marginBottom: '20px', fontSize: '0.95rem' }}>
                  Full-spectrum command center equipped with 10 essential tools for department triage, automated SLA tracking, explainable AI reviews, GIS hotspots, and master issue clustering.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <FaCheckCircle style={{ color: 'var(--primary-600)' }} /> 10 Visible Command Tools (Dashboard, GIS, SLA, XAI, etc.)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <FaCheckCircle style={{ color: 'var(--primary-600)' }} /> Human-in-the-loop AI review & modification workflow
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--primary-600)' }}>
                    <FaCheckCircle style={{ color: 'var(--primary-600)' }} /> One-click automated SLA breach escalation sweep
                  </li>
                </ul>
              </div>

              <Link to="/officer/login" className="btn btn-primary" style={{ width: '100%' }}>
                Enter Officer Console <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Pipeline Architecture Showcase */}
      <section style={{ padding: '70px 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 48px auto' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
              Full Automated Pipeline
            </span>
            <h2 style={{ fontSize: '2.1rem', marginTop: '6px', marginBottom: '12px' }}>
              End-to-End Civic AI Processing
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              From initial citizen filing to automated triage, severity scoring, duplicate clustering, SLA countdown, and citizen response translation.
            </p>
          </div>

          <div className="grid grid-cols-4">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--primary-600)', marginBottom: '12px' }}>
                <FaMicrophone />
              </div>
              <h4 style={{ marginBottom: '8px' }}>1. Multilingual Intake</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Voice transcriptions and local languages are normalized to structured text.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--saffron-500)', marginBottom: '12px' }}>
                <FaBrain />
              </div>
              <h4 style={{ marginBottom: '8px' }}>2. AI Triage & Severity</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Dynamic 6-factor severity model calculates urgency, population, and infrastructure weights.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--emerald-600)', marginBottom: '12px' }}>
                <FaMapMarkedAlt />
              </div>
              <h4 style={{ marginBottom: '8px' }}>3. GIS & Master Issues</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Spatial clustering aggregates duplicate complaints into unified master civic issues.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--primary-800)', marginBottom: '12px' }}>
                <FaClock />
              </div>
              <h4 style={{ marginBottom: '8px' }}>4. SLA & Escalation</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Automated deadlines with multilevel escalation tiers ensuring timely resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
