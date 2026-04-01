interface ProductSpecsProps {
  specs: {
    surface?: string;
    core?: string;
    thickness?: string;
    control?: number;
    power?: number;
    weight?: string;
    usapaApproved?: boolean;
  };
}

export default function ProductSpecs({ specs }: ProductSpecsProps) {
  const gridItems = [
    { label: 'Bề mặt', value: specs.surface },
    { label: 'Lõi', value: specs.core },
    { label: 'Độ dày', value: specs.thickness },
    { label: 'Trọng lượng', value: specs.weight },
  ].filter(item => item.value);

  return (
    <div className="product-specs">
      {gridItems.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}>
          {gridItems.map(item => (
            <div key={item.label} style={{
              padding: '10px 14px',
              backgroundColor: '#f9fafb',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {specs.control !== undefined && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Control</span>
            <span style={{ fontSize: 14, color: '#6b7280' }}>{specs.control}/100</span>
          </div>
          <div className="spec-bar" style={{
            height: 8,
            backgroundColor: '#e5e7eb',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div className="spec-bar-fill" style={{
              width: `${specs.control}%`,
              height: '100%',
              borderRadius: 4,
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      )}

      {specs.power !== undefined && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Power</span>
            <span style={{ fontSize: 14, color: '#6b7280' }}>{specs.power}/100</span>
          </div>
          <div className="spec-bar" style={{
            height: 8,
            backgroundColor: '#e5e7eb',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div className="spec-bar-fill" style={{
              width: `${specs.power}%`,
              height: '100%',
              borderRadius: 4,
              background: 'linear-gradient(90deg, #f97316, #ea580c)',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      )}

      {specs.usapaApproved && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 8,
          padding: '6px 12px',
          backgroundColor: '#ecfdf5',
          color: '#059669',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          border: '1px solid #a7f3d0',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          USAPA Approved
        </div>
      )}
    </div>
  );
}
