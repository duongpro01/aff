interface ProductParamsProps {
  params: {
    brand?: string;
    origin?: string;
    supplier?: string;
    material?: string;
    warranty?: string;
    shipping?: string;
  };
}

export default function ProductParams({ params }: ProductParamsProps) {
  const rows = [
    { label: 'Thương hiệu', value: params.brand },
    { label: 'Xuất xứ', value: params.origin },
    { label: 'Nhà cung cấp', value: params.supplier },
    { label: 'Chất liệu', value: params.material },
    { label: 'Bảo hành', value: params.warranty },
    { label: 'Vận chuyển', value: params.shipping },
  ].filter(row => row.value);

  if (rows.length === 0) return null;

  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 14,
    }}>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.label} style={{
            backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff',
          }}>
            <td style={{
              padding: '10px 14px',
              fontWeight: 500,
              color: '#6b7280',
              width: '40%',
              borderBottom: '1px solid #f3f4f6',
            }}>
              {row.label}
            </td>
            <td style={{
              padding: '10px 14px',
              color: '#111827',
              borderBottom: '1px solid #f3f4f6',
            }}>
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
