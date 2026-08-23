import React, { useState } from 'react';
import { Camera, FileText, Upload, Check, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { addComplaintEvidence } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const EVIDENCE_TYPES = [
  'Completion Photo',
  'Field Inspection Report',
  'Contractor Work Order',
  'Material Requisition Receipt',
  'Citizen Signed Satisfaction Slip',
  'Other Document',
];

export default function EvidenceUpload({
  isOpen,
  onClose,
  complaint,
  onEvidenceAdded,
}) {
  const { user } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();

  const [evidenceType, setEvidenceType] = useState('Completion Photo');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!complaint) return null;

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showWarning('File size exceeds 15MB limit.', 'File Too Large');
        return;
      }
      setFileName(file.name);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!fileName) {
      showWarning('Please select a photo or PDF file attachment.', 'File Required');
      return;
    }

    if (!description.trim()) {
      showWarning('Please enter a description for the evidence.', 'Description Required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await addComplaintEvidence(complaint.complaintId, {
        evidenceType,
        description: description.trim(),
        filename: fileName,
        officerName: user?.name || 'Rohan Patil',
        officerRole: user?.role || 'Municipal Officer',
      });

      showSuccess(`Evidence attachment "${fileName}" uploaded successfully.`, 'Evidence Attached');
      onEvidenceAdded?.(updated);
      setFileName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
      showError('Failed to attach evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ATTACH RESOLUTION EVIDENCE"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--color-primary-tint)',
            border: '1px solid var(--color-border)',
            fontSize: '0.72rem',
            color: 'var(--color-primary)',
          }}
        >
          <strong>Prototype Notice:</strong> Proof attachments are linked to the session audit trail. Real uploads connect directly to secure municipal cloud storage upon backend integration.
        </div>

        {/* Evidence Category */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Evidence Type *
          </label>
          <select
            value={evidenceType}
            onChange={e => setEvidenceType(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
            }}
          >
            {EVIDENCE_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* File Picker */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Select Proof Document / Geotagged Photo *
          </label>
          <div
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: 'var(--color-surface-sunken)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
            <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--color-primary)' }} />
            <div style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--color-ink)' }}>
              {fileName ? fileName : 'Click or Drag file to attach completion proof'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-faint)', marginTop: '4px' }}>
              PNG, JPG, PDF up to 15MB
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '4px' }}>
            Caption / Visual Inspection Notes *
          </label>
          <input
            type="text"
            placeholder="e.g. Geotagged photograph of sealed valve chamber and restored water pressure"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              padding: '0 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78125rem',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
            }}
          />
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '14px',
            borderTop: '1px solid var(--color-border)',
            marginTop: '4px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '40px',
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              height: '40px',
              padding: '0 18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Upload size={14} />
            <span>{isSubmitting ? 'Uploading...' : 'Attach Proof'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
