import React from 'react';

interface ProductSpecsTableProps {
  specifications: Record<string, string>;
}

export const ProductSpecsTable: React.FC<ProductSpecsTableProps> = ({ specifications }) => {
  const entries = Object.entries(specifications);

  if (entries.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-industrial-dark font-heading uppercase tracking-wider text-slate-500">
          Engineering Specifications
        </h3>
        <span className="text-[11px] font-mono text-slate-400">Standard Calibration Data • Authentic PPT Data</span>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-subtle">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-industrial-dark uppercase tracking-wider">
                Parameter
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-industrial-dark uppercase tracking-wider">
                Specification
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 text-xs">
            {entries.map(([key, val], idx) => (
              <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-4 py-2.5 font-semibold text-industrial-dark w-2/5">
                  {key}
                </td>
                <td className="px-4 py-2.5 text-slate-700 font-mono">
                  {val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
