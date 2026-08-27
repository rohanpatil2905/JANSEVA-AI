import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        padding: '36px 0 20px 0',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '28px',
          }}
        >
          {/* Brand & Purpose */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                JS
              </div>
              <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>JanSeva AI</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Intelligent citizen grievance management platform empowering residents with voice-enabled reporting and officers with automated AI triage.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Citizen Services</strong>
            <Link to="/citizen/submit" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              File New Grievance
            </Link>
            <Link to="/track" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Track Grievance Status
            </Link>
            <Link to="/citizen/login" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Citizen Dashboard
            </Link>
          </div>

          {/* Officer Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Municipal Operations</strong>
            <Link to="/officer/login" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Officer Console Login
            </Link>
            <Link to="/officer/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Triage Dashboard
            </Link>
            <Link to="/officer/gis" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              GIS Hotspots Explorer
            </Link>
          </div>

          {/* Emergency & Helpline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Helpline & Support</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <FaPhoneAlt style={{ color: 'var(--emerald-600)' }} />
              <span>Toll Free: 1800-JAN-SEVA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <FaEnvelope style={{ color: 'var(--primary-600)' }} />
              <span>support@janseva.ai</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <FaShieldAlt style={{ color: 'var(--saffron-500)' }} />
              <span>Government of India Civic Initiative</span>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>&copy; 2026 JanSeva AI — National Civic Intelligence Platform. All rights reserved.</span>
          <span>PostgreSQL Live Backend Connected • JWT Secure Auth</span>
        </div>
      </div>
    </footer>
  );
}
