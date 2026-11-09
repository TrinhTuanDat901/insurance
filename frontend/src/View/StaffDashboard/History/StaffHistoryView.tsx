// File: src/View/StaffDashboard/History/StaffHistoryView.tsx
import React from 'react';
import { X } from 'lucide-react';
import { AuditLogEntry } from '../../../types';
import { COLORS } from '../../../Store/colors';

interface StaffHistoryViewProps {
  logs: AuditLogEntry[];
  onClose?: () => void;
}

export default function StaffHistoryView({ logs, onClose }: StaffHistoryViewProps) {
  return (
    <div className={`w-full max-w-lg h-full flex flex-col shadow-2xl p-6 space-y-4 ${COLORS.SURFACE_WHITE} ${COLORS.TEXT_MAIN}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase font-bold text-black/60">nhật ký kiểm toán</span>
          <h3 className={`text-lg font-extrabold ${COLORS.TEXT_PRIMARY}`}>Lịch Sử Thao Tác Nghiệp Vụ</h3>
        </div>
        {onClose && (
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {logs.length === 0 ? (
          <p className="text-xs text-black/60 text-center py-10">Chưa có thao tác nào trong phiên làm việc này.</p>
        ) : (
          logs.map((log) => (
            <div key={log.logId} className={`p-3.5 rounded-2xl border space-y-1 text-xs ${COLORS.SURFACE_SUBTLE}`}>
              <div className="flex justify-between">
                <span className={`font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>{log.logId}</span>
                <span className="text-[11px] text-black/60 font-mono">{log.timestamp}</span>
              </div>
              <p className="font-bold">
                {log.entityType}: {log.entityId} ({log.transition})
              </p>
              <p className="leading-relaxed">{log.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}