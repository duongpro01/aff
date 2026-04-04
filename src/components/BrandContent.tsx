'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface BrandContentProps {
  content: string;
  brandName: string;
}

export default function BrandContent({ content, brandName }: BrandContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  const contentStyles: React.CSSProperties = !isExpanded ? {
    maxHeight: '208px',
    maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
  } : {};

  return (
    <section style={{ marginTop: '4rem' }}>
      {/* Section Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #d1d5db, transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f3e8ff', borderRadius: '9999px' }}>
          <Sparkles size={18} style={{ color: '#a855f7' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#7e22ce' }}>Brand Story</span>
        </div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #d1d5db, transparent)' }} />
      </div>

      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        {/* Title */}
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.5rem', textAlign: 'center' }}>
          About <span style={{ color: '#9333ea' }}>{brandName}</span>
        </h2>

        {/* Content Container */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(to bottom right, #f9fafb, rgba(243, 232, 255, 0.3))',
          borderRadius: '1rem',
          padding: '1.5rem 2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6'
        }}>
          {/* Content */}
          <div
            style={{
              overflow: 'hidden',
              transition: 'all 0.5s ease-in-out',
              ...contentStyles
            }}
          >
            <div
              style={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: '#4b5563'
              }}
              dangerouslySetInnerHTML={{ __html: formatContent(content) }}
            />
          </div>

          {/* Gradient Overlay when collapsed */}
          {!isExpanded && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '6rem',
              background: 'linear-gradient(to top, #f9fafb, transparent)',
              borderRadius: '0 0 1rem 1rem',
              pointerEvents: 'none'
            }} />
          )}
        </div>

        {/* Show More/Less Button */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              background: '#fff',
              color: '#9333ea',
              fontWeight: 600,
              borderRadius: '9999px',
              border: '2px solid #9333ea',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#9333ea';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = '#9333ea';
            }}
          >
            {isExpanded ? (
              <>Show Less <ChevronUp size={20} /></>
            ) : (
              <>Show More <ChevronDown size={20} /></>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

// Format content with styled headings
function formatContent(html: string): string {
  // Style h3 tags
  return html.replace(
    /<h3>/g,
    '<h3 style="font-size:1.25rem;font-weight:700;color:#7c3aed;margin-top:1.5rem;margin-bottom:0.75rem;padding-left:1rem;padding-top:0.25rem;padding-bottom:0.25rem;border-left:4px solid #8b5cf6;background:rgba(139,92,246,0.1);border-radius:0 0.5rem 0.5rem 0;">'
  ).replace(
    /<p>/g,
    '<p style="margin-bottom:1rem;">'
  );
}
