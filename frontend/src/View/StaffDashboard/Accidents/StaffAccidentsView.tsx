// File: src/View/StaffDashboard/Accidents/StaffAccidentsView.tsx
import React from 'react';
import { FolderOpen } from 'lucide-react';
import StatusBadge from '../../shared/StatusBadge';
import { COLORS } from '../../../Store/colors';

interface StaffAccidentsViewProps {
  accidents?: any[];
}

export default function StaffAccidentsView({ accidents = [] }: StaffAccidentsViewProps) {
  return (
    <div className={`rounded-3xl border shadow-sm p-6 space-y-4 ${COLORS.SURFACE_WHITE} ${COLORS.TEXT_MAIN}`}>
      <div>
        <h2 className={`text-lg font-extrabold inline-block pb-1 ${COLORS.SECTION_TITLE_UNDERLINE}`}>
          Danh sách Hồ sơ Tai nạn Xe máy
        </h2>
        <p className="text-xs mt-1">Xác minh hiện trường và ghi nhận biên bản giải quyết tai nạn.</p>
      </div>

      {accidents.length === 0 ? (
        <div className={`py-12 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
          <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
          <p className="text-xs font-bold">Chưa có hồ sơ tai nạn nào được ghi nhận</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                <th className="py-3 px-4">mã tai nạn</th>
                <th className="py-3 px-4">địa điểm</th>
                <th className="py-3 px-4">mô tả hiện trường</th>
                <th className="py-3 px-4">trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {accidents.map((acc, idx) => (
                <tr key={acc.accidentId || idx} className="hover:bg-neutral-50">
                  <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>
                    {acc.accidentCode || `#${acc.accidentId}`}
                  </td>
                  <td className="py-3.5 px-4">{acc.location || '—'}</td>
                  <td className="py-3.5 px-4">{acc.description || '—'}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={acc.status || 'REPORTED'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}