// File: src/View/UserDashBoard/History/UserHistoryTab.tsx
import React, { useState } from 'react';
import {
  FileText,
  CreditCard,
  AlertTriangle,
  FileWarning,
  ShieldAlert,
  FolderOpen,
  Search,
} from 'lucide-react';
import StatusBadge from '../../shared/StatusBadge';
import { UserHistoryResponse } from '../../../types';
import { COLORS } from '../../../Store/colors';

interface UserHistoryTabProps {
  history: UserHistoryResponse;
  isLoading: boolean;
}

const formatVND = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};

const formatDateVN = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const clean = dateStr.replace('T', ' ').substring(0, 16);
  const parts = clean.split(' ')[0].split('-');
  if (parts.length === 3) {
    const timePart = clean.split(' ')[1] ? ` ${clean.split(' ')[1]}` : '';
    return `${parts[2]}/${parts[1]}/${parts[0]}${timePart}`;
  }
  return dateStr;
};

export default function UserHistoryTab({ history, isLoading }: UserHistoryTabProps) {
  const [subTab, setSubTab] = useState<'contracts' | 'payments' | 'accidents' | 'punishments' | 'compensations'>('contracts');
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.toLowerCase().trim();

  const SUB_TABS = [
    { id: 'contracts' as const, label: `Lịch sử Hợp đồng (${history.contracts.length})`, icon: FileText },
    { id: 'payments' as const, label: `Lịch sử Thanh toán (${history.payments.length})`, icon: CreditCard },
    { id: 'accidents' as const, label: `Lịch sử Tai nạn (${history.accidents.length})`, icon: AlertTriangle },
    { id: 'punishments' as const, label: `Lịch sử Xử phạt (${history.punishments.length})`, icon: FileWarning },
    { id: 'compensations' as const, label: `Lịch sử Bồi thường (${history.compensations.length})`, icon: ShieldAlert },
  ];

  return (
    <div className={`space-y-5 ${COLORS.TEXT_MAIN}`}>
      {/* Thanh chuyển đổi 5 danh mục lịch sử */}
      <div className={`p-4 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 ${COLORS.SURFACE_WHITE}`}>
        <div className="flex flex-wrap items-center gap-2">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive ? `${COLORS.BTN_PRIMARY} shadow-sm` : COLORS.BTN_NEUTRAL
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã HĐ, biển số..."
            className={`w-full h-9 pl-9 pr-3 rounded-xl border text-xs font-semibold focus:outline-none ${COLORS.SURFACE_INPUT_STANDARD}`}
          />
        </div>
      </div>

      {/* Nội dung bảng lịch sử */}
      <div className={`rounded-3xl border shadow-sm p-6 ${COLORS.SURFACE_WHITE}`}>
        {isLoading ? (
          <div className="py-12 text-center text-xs font-bold">Đang tải dữ liệu lịch sử...</div>
        ) : (
          <>
            {/* 1. LỊCH SỬ HỢP ĐỒNG */}
            {subTab === 'contracts' && (
              <div className="overflow-x-auto">
                {history.contracts.length === 0 ? (
                  <div className={`py-10 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
                    <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
                    <p className="text-xs font-bold">Chưa có lịch sử hợp đồng</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                        <th className="py-3 px-4">mã hợp đồng</th>
                        <th className="py-3 px-4">phương tiện</th>
                        <th className="py-3 px-4">gói bảo hiểm</th>
                        <th className="py-3 px-4">thời hạn</th>
                        <th className="py-3 px-4">mức phí</th>
                        <th className="py-3 px-4">trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {history.contracts
                        .filter((c) => !q || c.contractCode.toLowerCase().includes(q) || c.plateNumber.toLowerCase().includes(q))
                        .map((c) => (
                          <tr key={c.contractId} className="hover:bg-neutral-50">
                            <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>{c.contractCode}</td>
                            <td className="py-3.5 px-4 font-bold">
                              {c.plateNumber} <span className="font-normal text-black/60">({c.vehicleName})</span>
                            </td>
                            <td className="py-3.5 px-4">{c.packageName}</td>
                            <td className="py-3.5 px-4 font-mono text-[11px]">
                              {formatDateVN(c.startDate)} → {formatDateVN(c.endDate)}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold">{formatVND(c.premiumAmount)}</td>
                            <td className="py-3.5 px-4">
                              <StatusBadge status={c.status} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* 2. LỊCH SỬ THANH TOÁN */}
            {subTab === 'payments' && (
              <div className="overflow-x-auto">
                {history.payments.length === 0 ? (
                  <div className={`py-10 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
                    <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
                    <p className="text-xs font-bold">Chưa có lịch sử giao dịch thanh toán</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                        <th className="py-3 px-4">mã giao dịch</th>
                        <th className="py-3 px-4">mã hợp đồng</th>
                        <th className="py-3 px-4">ngày thanh toán</th>
                        <th className="py-3 px-4">phương thức</th>
                        <th className="py-3 px-4">số tiền</th>
                        <th className="py-3 px-4">trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {history.payments
                        .filter((p) => !q || p.contractCode.toLowerCase().includes(q) || (p.transactionRef || '').toLowerCase().includes(q))
                        .map((p) => (
                          <tr key={p.paymentId} className="hover:bg-neutral-50">
                            <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>
                              {p.transactionRef || `PAY-${p.paymentId}`}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold">{p.contractCode}</td>
                            <td className="py-3.5 px-4 font-mono">{formatDateVN(p.paymentDate)}</td>
                            <td className="py-3.5 px-4 font-bold">{p.paymentMethod}</td>
                            <td className="py-3.5 px-4 font-mono font-bold">{formatVND(p.amount)}</td>
                            <td className="py-3.5 px-4">
                              <StatusBadge status={p.status} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* 3. LỊCH SỬ TAI NẠN */}
            {subTab === 'accidents' && (
              <div className="overflow-x-auto">
                {history.accidents.length === 0 ? (
                  <div className={`py-10 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
                    <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
                    <p className="text-xs font-bold">Chưa có lịch sử tai nạn nào</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                        <th className="py-3 px-4">mã sự vụ</th>
                        <th className="py-3 px-4">hợp đồng & biển số</th>
                        <th className="py-3 px-4">thời gian</th>
                        <th className="py-3 px-4">địa điểm</th>
                        <th className="py-3 px-4">mô tả</th>
                        <th className="py-3 px-4">trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {history.accidents
                        .filter((a) => !q || a.contractCode.toLowerCase().includes(q) || a.plateNumber.toLowerCase().includes(q))
                        .map((a) => (
                          <tr key={a.accidentId} className="hover:bg-neutral-50">
                            <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>#TN-{a.accidentId}</td>
                            <td className="py-3.5 px-4 font-mono font-bold">
                              {a.contractCode} ({a.plateNumber})
                            </td>
                            <td className="py-3.5 px-4 font-mono">{formatDateVN(a.accidentDate)}</td>
                            <td className="py-3.5 px-4">{a.location || '—'}</td>
                            <td className="py-3.5 px-4 max-w-xs">{a.description || '—'}</td>
                            <td className="py-3.5 px-4">
                              <StatusBadge status={a.status} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* 4. LỊCH SỬ XỬ PHẠT */}
            {subTab === 'punishments' && (
              <div className="overflow-x-auto">
                {history.punishments.length === 0 ? (
                  <div className={`py-10 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
                    <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
                    <p className="text-xs font-bold">Chưa có biên bản xử phạt / chế tài nào</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                        <th className="py-3 px-4">mã xử phạt</th>
                        <th className="py-3 px-4">mã hợp đồng</th>
                        <th className="py-3 px-4">ngày ghi nhận</th>
                        <th className="py-3 px-4">lý do chế tài</th>
                        <th className="py-3 px-4">mức phạt</th>
                        <th className="py-3 px-4">trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {history.punishments
                        .filter((pu) => !q || pu.contractCode.toLowerCase().includes(q) || pu.reason.toLowerCase().includes(q))
                        .map((pu) => (
                          <tr key={pu.punishmentId} className="hover:bg-neutral-50">
                            <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>#XP-{pu.punishmentId}</td>
                            <td className="py-3.5 px-4 font-mono font-bold">{pu.contractCode}</td>
                            <td className="py-3.5 px-4 font-mono">{formatDateVN(pu.punishmentDate)}</td>
                            <td className="py-3.5 px-4">{pu.reason}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-rose-700">{formatVND(pu.fineAmount)}</td>
                            <td className="py-3.5 px-4">
                              <StatusBadge status={pu.status} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* 5. LỊCH SỬ BỒI THƯỜNG */}
            {subTab === 'compensations' && (
              <div className="overflow-x-auto">
                {history.compensations.length === 0 ? (
                  <div className={`py-10 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
                    <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
                    <p className="text-xs font-bold">Chưa có lịch sử yêu cầu bồi thường</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                        <th className="py-3 px-4">mã hồ sơ</th>
                        <th className="py-3 px-4">mã hợp đồng</th>
                        <th className="py-3 px-4">ngày yêu cầu</th>
                        <th className="py-3 px-4">số tiền yêu cầu</th>
                        <th className="py-3 px-4">số tiền được duyệt</th>
                        <th className="py-3 px-4">mô tả</th>
                        <th className="py-3 px-4">trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {history.compensations
                        .filter((cm) => !q || cm.contractCode.toLowerCase().includes(q))
                        .map((cm) => (
                          <tr key={cm.compensationId} className="hover:bg-neutral-50">
                            <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>#BT-{cm.compensationId}</td>
                            <td className="py-3.5 px-4 font-mono font-bold">{cm.contractCode}</td>
                            <td className="py-3.5 px-4 font-mono">{formatDateVN(cm.requestDate)}</td>
                            <td className="py-3.5 px-4 font-mono font-bold">{formatVND(cm.requestedAmount)}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                              {cm.approvedAmount !== null ? formatVND(cm.approvedAmount) : '—'}
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">{cm.description || '—'}</td>
                            <td className="py-3.5 px-4">
                              <StatusBadge status={cm.status} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}