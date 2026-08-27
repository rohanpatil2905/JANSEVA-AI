import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  FaUserCircle,
  FaSignOutAlt,
  FaLanguage,
  FaShieldAlt,
  FaHandsHelping,
  FaPlusCircle,
  FaListAlt,
  FaSearch,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

export default function Navbar() {
  const { user, isAuthenticated, isCitizen, isOfficer, logout } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isOfficerRoute = location.pathname.startsWith('/officer');
  const isCitizenRoute = location.pathname.startsWith('/citizen');

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand Logo & Tag */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--saffron-500) 0%, var(--primary-600) 50%, var(--emerald-600) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0, 110, 230, 0.25)',
            }}
          >
            JS
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--primary-900)',
                }}
              >
                JanSeva <span style={{ color: 'var(--primary-600)' }}>AI</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isOfficerRoute ? 'var(--primary-100)' : 'var(--saffron-100)',
                  color: isOfficerRoute ? 'var(--primary-800)' : 'var(--saffron-600)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {isOfficerRoute ? 'Officer Console' : 'Citizen Portal'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>
              Govt. Civic Redressal & Triage
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Public / Citizen Links */}
          {!isOfficerRoute && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/track"
                className={`btn btn-ghost btn-sm ${location.pathname === '/track' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaSearch style={{ fontSize: '0.85rem' }} /> Track Grievance
              </Link>

              {isAuthenticated && isCitizen && (
                <>
                  <Link
                    to="/citizen/dashboard"
                    className="btn btn-ghost btn-sm"
                    style={{ fontWeight: 600 }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/citizen/my-complaints"
                    className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaListAlt /> My Grievances
                  </Link>
                  <Link
                    to="/citizen/submit"
                    className="btn btn-accent btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlusCircle /> File Grievance
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Officer Navigation Shortcut */}
          {isOfficerRoute && isAuthenticated && isOfficer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-subtle)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Officer: <strong style={{ color: 'var(--primary-800)' }}>{user.name}</strong>
              </span>
            </div>
          )}

          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }}
              title="Select Language"
            >
              <FaLanguage style={{ fontSize: '1rem', color: 'var(--primary-600)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {languages.find((l) => l.code === language)?.native || 'English'}
              </span>
            </button>

            {langDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '180px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '6px',
                  zIndex: 1100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: language === lang.code ? 'var(--primary-50)' : 'transparent',
                      color: language === lang.code ? 'var(--primary-700)' : 'var(--text-primary)',
                      fontWeight: language === lang.code ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>{lang.native}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Switcher / Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Logout"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* If on officer login/page, show citizen link, and vice versa */}
              {isOfficerRoute ? (
                <>
                  <Link to="/citizen/login" className="btn btn-ghost btn-sm">
                    <FaHandsHelping /> Citizen Portal
                  </Link>
                  <Link to="/officer/login" className="btn btn-primary btn-sm">
                    <FaShieldAlt /> Officer Login
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/officer/login" className="btn btn-ghost btn-sm">
                    <FaShieldAlt /> Officer Desk
                  </Link>
                  <Link to="/citizen/login" className="btn btn-secondary btn-sm">
                    Citizen Login
                  </Link>
                  <Link to="/citizen/register" className="btn btn-primary btn-sm">
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
