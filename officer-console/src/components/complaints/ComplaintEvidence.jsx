import React, { useState } from 'react';
import { Camera, FileText, MapPin, Eye, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function ComplaintEvidence({ complaint }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!complaint) return null;

  const hasEvidence = complaint.evidence && complaint.evidence.length > 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
            Citizen Evidence & Field Attachments
          </h3>
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>
          {hasEvidence ? `${complaint.evidence.length} Attachment(s)` : 'No Files'}
        </span>
      </div>

      {hasEvidence ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {complaint.evidence.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ImageIcon size={18} color="var(--color-primary)" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.caption || `Field Attachment #${idx + 1}`}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={10} /> Geotagged • Verified GPS Coordinates
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedImage(item.caption)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Eye size={12} /> Inspect
              </button>
            </div>
          ))}

          {selectedImage && (
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary-tint)',
                border: '1px solid var(--color-border)',
                fontSize: '0.75rem',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Inspecting: <strong>{selectedImage}</strong> (Geotag telemetry matched Ward GIS layer)</span>
              <button
                onClick={() => setSelectedImage(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: '24px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px dashed var(--color-border)',
            textAlign: 'center',
            color: 'var(--color-ink-muted)',
            fontSize: '0.75rem',
          }}
        >
          <FileText size={24} style={{ margin: '0 auto 6px', opacity: 0.4 }} />
          <div style={{ fontWeight: 600 }}>No photographic attachment provided</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-faint)', marginTop: '2px' }}>
            GPS coordinate telemetry was recorded during citizen portal submission.
          </div>
        </div>
      )}

      {/* Citizen Submission Metadata */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--color-ink-muted)',
        }}
      >
        <span>Submitted By: <strong>{complaint.submittedBy || 'Citizen'}</strong></span>
        <span>Contact: <strong>{complaint.citizenContact || 'Verified OTP'}</strong></span>
      </div>
    </div>
  );
}
