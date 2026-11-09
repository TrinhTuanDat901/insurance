// File: src/View/StaffDashboard/Punishments/StaffPunishmentsView.tsx
import React from 'react';
import { FolderOpen } from 'lucide-react';
import StatusBadge from '../../shared/StatusBadge';
import { COLORS } from '../../../Store/colors';

interface StaffPunishmentsViewProps {
  punishments?: any[];
}

export default function StaffPunishmentsView({ punishments = [] }: StaffPunishmentsViewProps) {
  return (
    <div className={`rounded-3xl border shadow-sm p-6 space-y-4 ${COLORS.SURFACE_WHITE} ${COLORS.TEXT_MAIN}`}>
      <div>
        <h2 className={`text-lg font-extrabold inline-block pb-1 ${COLORS.SECTION_TITLE_UNDERLINE}`}>
          Danh sách Biên bản Vi phạm & Xử phạt Chế tài
        </h2>
        <p className="text-xs mt-1">Theo dõi việc thực hiện nghĩa vụ chế tài theo điều khoản quy tắc bảo hiểm.</p>
      </div>

      {punishments.length === 0 ? (
        <div className={`py-12 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
          <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
          <p className="text-xs font-bold">Chưa có biên bản xử phạt nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                <th className="py-3 px-4">mã xử phạt</th>
                <th className="py-3 px-4">lý do vi phạm</th>
                <th className="py-3 px-4">trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {punishments.map((pun, idx) => (
                <tr key={pun.punishmentId || idx} className="hover:bg-neutral-50">
                  <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>
                    {pun.punishmentCode || `#${pun.punishmentId}`}
                  </td>
                  <td className="py-3.5 px-4">{pun.reason}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={pun.status || 'OPEN'} />
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