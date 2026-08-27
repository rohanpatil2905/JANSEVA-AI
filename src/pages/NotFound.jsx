import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <div>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary-700)', marginBottom: '12px' }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Page Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            The page you are looking for does not exist or has moved.
          </p>
          <Link to="/" className="btn btn-primary">
            Return to JanSeva AI Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}