import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  Building2,
  Layers,
  Flame,
  Info,
  ShieldAlert,
} from 'lucide-react';
import Badge from '../ui/Badge';

export default function AIAnalysis({ analysis }) {
  if (!analysis) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-ai-border)',
        borderRadius: 'var(--radius-md)',
        padding: '22px 24px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top AI Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-ai-tint)',
              color: 'var(--color-ai)',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            <BrainCircuit size={14} /> JANSEVA AI INFERENCE ENGINE
          </div>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-surface-sunken)',
              color: 'var(--color-ink-muted)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              border: '1px solid var(--color-border)',
            }}
          >
            AI RECOMMENDATION &bull; ADVISORY ONLY
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-ai)', fontWeight: 700 }}>
          <Sparkles size={14} />
          <span>Overall Confidence: {analysis.aiConfidence}%</span>
        </div>
      </div>

      {/* AI Summary Banner */}
      <div
        style={{
          padding: '14px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-ai-tint)',
          border: '1px solid var(--color-ai-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-ai)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          AI Executive Summary & Triage Assessment
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink)', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
          {analysis.aiSummary || 'AI analysis completed based on citizen report context, geo-spatial density, and departmental historical jurisdiction.'}
        </p>
      </div>

      {/* 4 Classification Pillars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Pillar 1: Predicted Category */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            <Layers size={13} color="var(--color-primary)" /> Predicted Category
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-ink)', marginTop: '4px' }}>
            {analysis.predictedCategory || analysis.category}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ai)', fontWeight: 600, marginTop: '2px' }}>
            {analysis.aiConfidence}% Category Match
          </div>
        </div>

        {/* Pillar 2: Recommended Department */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            <Building2 size={13} color="var(--color-primary)" /> Recommended Dept.
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-ink)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {(analysis.recommendedDepartment || analysis.department || '').split('&')[0]}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ai)', fontWeight: 600, marginTop: '2px' }}>
            {analysis.routingConfidence || 92}% Routing Confidence
          </div>
        </div>

        {/* Pillar 3: AI Severity Assessment */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: analysis.priority === 'Critical' ? 'rgba(220, 38, 38, 0.04)' : 'var(--color-surface-sunken)',
            border: analysis.priority === 'Critical' ? '1px solid var(--color-critical-border)' : '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            <Flame size={13} color={analysis.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-high)'} /> Assessed Severity
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: analysis.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-ink)' }}>
              {analysis.severityScore} / 100
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: analysis.priority === 'Critical' ? 'var(--color-critical)' : 'var(--color-high)',
                textTransform: 'uppercase',
              }}
            >
              ({analysis.priority})
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            AI-assessed Urgency & Risk
          </div>
        </div>

        {/* Pillar 4: Authenticity & Trust */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            <ShieldAlert size={13} color={analysis.authenticityStatus === 'Suspicious' ? 'var(--color-critical)' : 'var(--color-healthy)'} /> Authenticity State
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: analysis.authenticityStatus === 'Suspicious' ? 'var(--color-critical)' : 'var(--color-healthy)', marginTop: '4px' }}>
            {analysis.authenticityStatus || 'Likely Genuine'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
            Trust Index: {analysis.authenticityScore || 95}%
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Advisory Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--color-surface-sunken)',
          border: '1px solid var(--color-border)',
          fontSize: '0.72rem',
          color: 'var(--color-ink-muted)',
        }}
      >
        <Info size={14} color="var(--color-ai)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Statutory Governance Note:</strong> AI recommendations are advisory and designed to assist municipal officers. The officer retains full decision authority to approve or override.
        </span>
      </div>
    </div>
  );
}
