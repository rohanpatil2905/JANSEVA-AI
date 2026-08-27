import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastContainer from '../common/Toast';
import { FaHome, FaPlusCircle, FaListUl, FaSearch } from 'react-icons/fa';

export default function CitizenLayout() {
  const location = useLocation();

  const citizenNavItems = [
    { to: '/citizen/dashboard', label: 'My Dashboard', icon: <FaHome /> },
    { to: '/citizen/submit', label: 'File Grievance', icon: <FaPlusCircle /> },
    { to: '/citizen/my-complaints', label: 'My Complaints', icon: <FaListUl /> },
    { to: '/track', label: 'Public Tracker', icon: <FaSearch /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Citizen Sub-Navbar / Breadcrumbs Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '10px 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {citizenNavItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald-500)' }} />
            <span>Citizen Portal Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px 0', backgroundColor: 'var(--bg-main)' }}>
        <Outlet />
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}
