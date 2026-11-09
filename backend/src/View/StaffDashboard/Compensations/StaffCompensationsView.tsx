// File: motobike_insurance/frontend/src/View/StaffDashboard/Compensations/StaffCompensationsView.tsx
import React, { useState, useMemo } from 'react';
import { Search, FolderOpen, X, RefreshCw } from 'lucide-react';
import StatusBadge from '../../shared/StatusBadge';
import { compensationApi, CompensationResponse } from '../../../Store/apiClient';
import { COLORS } from '../../../Store/colors';

interface StaffCompensationsViewProps {
  compensations: CompensationResponse[];
  isLoading: boolean;
  onRefresh: (statusFilter?: string) => Promise<void>;
  onRecordAudit: (action: string, entityType: string, entityId: string, transition: string, note: string) => void;
  onShowToast: (message: string, type?: 'success' | 'warning') => void;
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

export default function StaffCompensationsView({
  compensations,
  isLoading,
  onRefresh,
  onRecordAudit,
  onShowToast,
}: StaffCompensationsViewProps) {
  const [claimSearch, setClaimSearch] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState<CompensationResponse | null>(null);
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCompensations = useMemo(() => {
    return compensations.filter((cl) => {
      const q = claimSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        (cl.claimCode || '').toLowerCase().includes(q) ||
        (cl.customerFullName || '').toLowerCase().includes(q) ||
        (cl.contractCode || '').toLowerCase().includes(q) ||
        (cl.plateNumber || '').toLowerCase().includes(q);
      const matchStatus = claimStatusFilter === 'ALL' || cl.status === claimStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [compensations, claimSearch, claimStatusFilter]);

  const handleStatusFilterChange = async (newStatus: string) => {
    setClaimStatusFilter(newStatus);
    await onRefresh(newStatus);
  };

  const openClaimModal = async (claim: CompensationResponse) => {
    setActionError('');
    setDecisionMode('APPROVE');
    setApprovedAmount(
      claim.approvedAmount !== null && claim.approvedAmount !== undefined
        ? String(claim.approvedAmount)
        : String(claim.requestedAmount)
    );
    setDecisionReason(claim.description || '');

    try {
      const fresh = await compensationApi.viewCompensationDetail(claim.compensationId);
      setSelectedClaim(fresh);
    } catch {
      setSelectedClaim(claim);
    }
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setActionError('');

    if (selectedClaim.status !== 'PENDING') {
      setActionError('Chỉ có thể ra quyết định cho hồ sơ đang ở trạng thái Chờ xử lý (PENDING).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (decisionMode === 'APPROVE') {
        const numericAmount = Number(approvedAmount);
        if (approvedAmount === '' || isNaN(numericAmount) || numericAmount < 0) {
          setActionError('Số tiền phê duyệt phải là số hợp lệ lớn hơn hoặc bằng 0.');
          setIsSubmitting(false);
          return;
        }

        const resolved = await compensationApi.resolveCompensation(selectedClaim.compensationId, {
          userId: selectedClaim.userId,
          contractId: selectedClaim.contractId,
          approvedAmount: numericAmount,
          description: decisionReason.trim() || selectedClaim.description || '',
        });

        onRecordAudit(
          'APPROVE_COMPENSATION',
          'CompensationRequest',
          resolved.claimCode,
          'PENDING → APPROVED',
          `Phê duyệt bồi thường ${formatVND(numericAmount)} và tự động tạo phiếu chi Payment`
        );
        onShowToast(`Đã duyệt bồi thường ${resolved.claimCode} (${formatVND(numericAmount)})!`);
      } else {
        const rejected = await compensationApi.rejectCompensation(selectedClaim.compensationId, {
          userId: selectedClaim.userId,
          contractId: selectedClaim.contractId,
          description: decisionReason.trim() || 'Từ chối bồi thường theo kết quả thẩm định',
        });

        onRecordAudit(
          'REJECT_COMPENSATION',
          'CompensationRequest',
          rejected.claimCode,
          'PENDING → REJECTED',
          `Từ chối yêu cầu bồi thường: ${decisionReason.trim()}`
        );
        onShowToast(`Đã từ chối hồ sơ bồi thường ${rejected.claimCode}.`, 'warning');
      }

      setSelectedClaim(null);
      await onRefresh(claimStatusFilter);
    } catch (err: any) {
      setActionError(err.message || 'Không thể lưu quyết định bồi thường.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-3xl border shadow-sm p-6 space-y-4 ${COLORS.SURFACE_WHITE} ${COLORS.TEXT_MAIN}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
        <div>
          <h2 className={`text-lg font-extrabold inline-block pb-1 ${COLORS.SECTION_TITLE_UNDERLINE}`}>
            Quản lý & Thẩm định Hồ sơ Bồi thường
          </h2>
          <p className="text-xs mt-1">
            Kết nối trực tiếp với CompensationController (/compensations/*) và tự động sinh giao dịch Payment khi duyệt.
          </p>
        </div>
        <button
          onClick={() => onRefresh(claimStatusFilter)}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${COLORS.BTN_OUTLINE}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? `animate-spin ${COLORS.TEXT_PRIMARY}` : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={claimSearch}
            onChange={(e) => setClaimSearch(e.target.value)}
            placeholder="Tìm theo Mã bồi thường (BT-...), Mã hợp đồng, Biển số hoặc Tên KH..."
            className={`w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border focus:outline-none ${COLORS.SURFACE_INPUT_STANDARD}`}
          />
        </div>
        <select
          value={claimStatusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border ${COLORS.SURFACE_WHITE}`}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý (PENDING)</option>
          <option value="APPROVED">Đã phê duyệt (APPROVED)</option>
          <option value="REJECTED">Từ chối (REJECTED)</option>
          <option value="PAID">Đã chi trả (PAID)</option>
        </select>
      </div>

      {isLoading ? (
        <div className={`py-12 text-center rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
          <RefreshCw className={`w-7 h-7 animate-spin mx-auto mb-2 ${COLORS.TEXT_PRIMARY}`} />
          <p className="text-xs font-bold">Đang tải danh sách yêu cầu bồi thường...</p>
        </div>
      ) : filteredCompensations.length === 0 ? (
        <div className={`py-12 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
          <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
          <p className="text-xs font-bold">Không có hồ sơ bồi thường nào khớp bộ lọc</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                <th className="py-3 px-4">mã hồ sơ</th>
                <th className="py-3 px-4">khách hàng & hợp đồng</th>
                <th className="py-3 px-4">xe máy</th>
                <th className="py-3 px-4">ngày yêu cầu</th>
                <th className="py-3 px-4">mức yêu cầu</th>
                <th className="py-3 px-4">mức phê duyệt</th>
                <th className="py-3 px-4">trạng thái</th>
                <th className="py-3 px-4 text-right">thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredCompensations.map((claim) => (
                <tr key={claim.compensationId} className="hover:bg-neutral-50">
                  <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>{claim.claimCode}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold">{claim.customerFullName}</div>
                    <div className="text-[11px] text-black/70 font-mono">{claim.contractCode}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">{claim.plateNumber}</td>
                  <td className="py-3.5 px-4 text-[11px]">{formatDateVN(claim.requestDate)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">{formatVND(claim.requestedAmount)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                    {claim.approvedAmount !== null && claim.approvedAmount !== undefined
                      ? formatVND(claim.approvedAmount)
                      : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={claim.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openClaimModal(claim)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition shadow-xs ${
                        claim.status === 'PENDING' ? COLORS.BTN_PRIMARY : COLORS.BTN_NEUTRAL
                      }`}
                    >
                      {claim.status === 'PENDING' ? 'Thẩm định & Duyệt' : 'Xem hồ sơ'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedClaim && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-xl w-full border shadow-2xl p-6 sm:p-8 space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-black/60">thẩm định bồi thường</span>
                <h3 className={`text-lg font-extrabold ${COLORS.TEXT_PRIMARY}`}>{selectedClaim.claimCode}</h3>
              </div>
              <button onClick={() => setSelectedClaim(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${COLORS.SURFACE_SUBTLE}`}>
              <div className="flex justify-between items-center">
                <span>trạng thái hiện tại:</span>
                <StatusBadge status={selectedClaim.status} />
              </div>
              <div className="flex justify-between">
                <span>khách hàng:</span>
                <strong>{selectedClaim.customerFullName}</strong>
              </div>
              <div className="flex justify-between">
                <span>số tiền yêu cầu:</span>
                <strong className="font-mono font-bold text-rose-700">
                  {formatVND(selectedClaim.requestedAmount)}
                </strong>
              </div>
            </div>

            {selectedClaim.status === 'PENDING' ? (
              <form onSubmit={handleSubmitDecision} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionMode('APPROVE')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      decisionMode === 'APPROVE'
                        ? `${COLORS.ACTION_SUCCESS_SOLID} border-emerald-600`
                        : COLORS.BTN_OUTLINE
                    }`}
                  >
                    Phê duyệt chi trả (APPROVED)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionMode('REJECT')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      decisionMode === 'REJECT'
                        ? `${COLORS.ACTION_DANGER_SOLID} border-rose-600`
                        : COLORS.BTN_OUTLINE
                    }`}
                  >
                    Từ chối bồi thường (REJECTED)
                  </button>
                </div>

                {decisionMode === 'APPROVE' && (
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      số tiền phê duyệt chi trả (approved_amount - vnđ) *
                    </label>
                    <input
                      type="number"
                      required
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value)}
                      className={`w-full h-10 px-3 rounded-xl border text-xs font-mono font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold mb-1">ghi chú / lý do thẩm định *</label>
                  <textarea
                    rows={2}
                    required
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>

                {actionError && <p className="text-rose-600 text-[11px] font-bold">{actionError}</p>}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClaim(null)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs ${COLORS.BTN_NEUTRAL}`}
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow ${COLORS.BTN_PRIMARY}`}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Lưu quyết định thẩm định'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 rounded-xl bg-neutral-100 text-xs font-bold text-center">
                Hồ sơ này đã được giải quyết ({selectedClaim.status}).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}