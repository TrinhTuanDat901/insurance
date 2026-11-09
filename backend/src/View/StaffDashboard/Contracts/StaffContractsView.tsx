// File: motobike_insurance/frontend/src/View/StaffDashboard/Contracts/StaffContractsView.tsx
import React, { useState, useMemo } from 'react';
import { Clock, FileCheck, Plus, Search, FolderOpen, X, QrCode, RefreshCw } from 'lucide-react';
import StatusBadge from '../../shared/StatusBadge';
import { contractApi, ContractResponse, UserResponse } from '../../../Store/apiClient';
import { COLORS } from '../../../Store/colors';

interface StaffContractsViewProps {
  contracts: ContractResponse[];
  customers: UserResponse[];
  initialSubTab?: 'requests' | 'list';
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onRecordAudit: (action: string, entityType: string, entityId: string, transition: string, note: string) => void;
  onShowToast: (message: string, type?: 'success' | 'warning') => void;
}

const formatVND = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};

const formatDateVN = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  if (dateStr.includes('/')) return dateStr;
  const clean = dateStr.split('T')[0].split(' ')[0];
  const parts = clean.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

export default function StaffContractsView({
  contracts,
  customers,
  initialSubTab = 'requests',
  isLoading,
  onRefresh,
  onRecordAudit,
  onShowToast,
}: StaffContractsViewProps) {
  const [contractSubTab, setContractSubTab] = useState<'requests' | 'list'>(initialSubTab);
  const [contractSearch, setContractSearch] = useState('');
  const [contractStatusFilter, setContractStatusFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPendingContract, setSelectedPendingContract] = useState<ContractResponse | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [requestActionError, setRequestActionError] = useState('');

  const [contractFormModal, setContractFormModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data: {
      contractId?: number;
      contractCode?: string;
      userId: number;
      vehicleId: number;
      packageId: number;
      startDate: string;
      endDate: string;
      status: string;
    };
  }>({
    open: false,
    mode: 'create',
    data: {
      userId: customers[0]?.userId || 1,
      vehicleId: 1,
      packageId: 1,
      startDate: '2026-11-09',
      endDate: '2027-11-09',
      status: 'ACTIVE',
    },
  });
  const [contractFormError, setContractFormError] = useState('');

  const [renewModal, setRenewModal] = useState<{
    open: boolean;
    contract: ContractResponse | null;
    packageId: number;
    startDate: string;
    endDate: string;
    error: string;
  }>({
    open: false,
    contract: null,
    packageId: 1,
    startDate: '2026-11-09',
    endDate: '2027-11-09',
    error: '',
  });

  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    contract: ContractResponse | null;
    reason: string;
    error: string;
  }>({
    open: false,
    contract: null,
    reason: '',
    error: '',
  });

  const [insuranceCardModal, setInsuranceCardModal] = useState<ContractResponse | null>(null);

  const pendingContracts = useMemo(
    () => contracts.filter((c) => c.status === 'PENDING'),
    [contracts]
  );

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const q = contractSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        (c.contractCode || '').toLowerCase().includes(q) ||
        (c.customerFullName || '').toLowerCase().includes(q) ||
        (c.plateNumber || '').toLowerCase().includes(q);
      const matchStatus = contractStatusFilter === 'ALL' || c.status === contractStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [contracts, contractSearch, contractStatusFilter]);

  const handleOpenPendingDetail = async (contract: ContractResponse) => {
    setRejectReason('');
    setRequestActionError('');
    try {
      const fresh = await contractApi.viewContractDetail(contract.contractId);
      setSelectedPendingContract(fresh);
    } catch {
      setSelectedPendingContract(contract);
    }
  };

  const handleApprovePendingContract = async (contract: ContractResponse) => {
    setIsSubmitting(true);
    setRequestActionError('');
    try {
      const activated = await contractApi.activeContract(contract.contractId);
      onRecordAudit(
        'ACTIVE_CONTRACT',
        'Contract',
        activated.contractCode,
        'PENDING → ACTIVE',
        `Kích hoạt hợp đồng ${activated.contractCode}`
      );
      onShowToast(`Đã kích hoạt hợp đồng ${activated.contractCode}!`);
      setSelectedPendingContract(null);
      await onRefresh();
    } catch (err: any) {
      setRequestActionError(err.message || 'Không thể phê duyệt hợp đồng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectPendingContract = async (contract: ContractResponse) => {
    if (!rejectReason || rejectReason.trim().length < 5) {
      setRequestActionError('Vui lòng nhập lý do từ chối (tối thiểu 5 ký tự).');
      return;
    }
    setIsSubmitting(true);
    try {
      const cancelled = await contractApi.cancelContract(contract.contractId, rejectReason.trim());
      onRecordAudit(
        'REJECT_CONTRACT_REQUEST',
        'Contract',
        cancelled.contractCode,
        'PENDING → CANCELLED',
        `Từ chối yêu cầu hợp đồng: ${rejectReason.trim()}`
      );
      onShowToast(`Đã từ chối hợp đồng ${cancelled.contractCode}.`, 'warning');
      setSelectedPendingContract(null);
      await onRefresh();
    } catch (err: any) {
      setRequestActionError(err.message || 'Từ chối hợp đồng thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveContractForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setContractFormError('');
    const { mode, data } = contractFormModal;

    if (!data.startDate || !data.endDate || new Date(data.endDate) <= new Date(data.startDate)) {
      setContractFormError('Ngày kết thúc phải lớn hơn ngày bắt đầu hiệu lực.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const created = await contractApi.createContract({
          userId: Number(data.userId),
          vehicleId: Number(data.vehicleId),
          packageId: Number(data.packageId),
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
        });
        onRecordAudit('CREATE_CONTRACT', 'Contract', created.contractCode, `NONE → ${created.status}`, `Tạo hợp đồng ${created.contractCode}`);
        onShowToast(`Đã tạo hợp đồng ${created.contractCode}!`);
      } else if (data.contractId) {
        const updated = await contractApi.updateContract(data.contractId, {
          packageId: Number(data.packageId),
          startDate: data.startDate,
          endDate: data.endDate,
        });
        onRecordAudit('UPDATE_CONTRACT', 'Contract', updated.contractCode, `${updated.status} → ${updated.status}`, `Cập nhật hợp đồng ${updated.contractCode}`);
        onShowToast(`Đã cập nhật hợp đồng ${updated.contractCode}!`);
      }
      setContractFormModal((prev) => ({ ...prev, open: false }));
      await onRefresh();
    } catch (err: any) {
      setContractFormError(err.message || 'Lưu hợp đồng thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewModal.contract) return;
    if (new Date(renewModal.endDate) <= new Date(renewModal.startDate)) {
      setRenewModal((prev) => ({ ...prev, error: 'Ngày hết hạn phải lớn hơn ngày bắt đầu.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const renewed = await contractApi.renewContract(renewModal.contract.contractId, {
        startDate: renewModal.startDate,
        endDate: renewModal.endDate,
        packageId: Number(renewModal.packageId),
      });
      onRecordAudit('RENEW_CONTRACT', 'Contract', renewed.contractCode, `${renewModal.contract.status} → RENEWED`, `Gia hạn hợp đồng ${renewed.contractCode}`);
      onShowToast(`Đã gia hạn hợp đồng ${renewed.contractCode}!`);
      setRenewModal((prev) => ({ ...prev, open: false, contract: null }));
      await onRefresh();
    } catch (err: any) {
      setRenewModal((prev) => ({ ...prev, error: err.message || 'Gia hạn hợp đồng thất bại.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModal.contract) return;
    if (!cancelModal.reason || cancelModal.reason.trim().length < 5) {
      setCancelModal((prev) => ({ ...prev, error: 'Vui lòng nhập lý do hủy (tối thiểu 5 ký tự).' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const cancelled = await contractApi.cancelContract(cancelModal.contract.contractId, cancelModal.reason.trim());
      onRecordAudit('CANCEL_CONTRACT', 'Contract', cancelled.contractCode, `${cancelModal.contract.status} → CANCELLED`, `Hủy hợp đồng: ${cancelModal.reason.trim()}`);
      onShowToast(`Đã hủy hợp đồng ${cancelled.contractCode}.`, 'warning');
      setCancelModal({ open: false, contract: null, reason: '', error: '' });
      await onRefresh();
    } catch (err: any) {
      setCancelModal((prev) => ({ ...prev, error: err.message || 'Hủy hợp đồng thất bại.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${COLORS.TEXT_MAIN}`}>
      <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border shadow-sm ${COLORS.SURFACE_WHITE}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setContractSubTab('requests')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              contractSubTab === 'requests' ? `${COLORS.BTN_PRIMARY} shadow-sm` : COLORS.BTN_NEUTRAL
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Yêu cầu hợp đồng chờ duyệt</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] bg-white font-black ${COLORS.TEXT_PRIMARY}`}>
              {pendingContracts.length}
            </span>
          </button>

          <button
            onClick={() => setContractSubTab('list')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              contractSubTab === 'list' ? `${COLORS.BTN_PRIMARY} shadow-sm` : COLORS.BTN_NEUTRAL
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Danh sách hợp đồng ({contracts.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${COLORS.BTN_OUTLINE}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? `animate-spin ${COLORS.TEXT_PRIMARY}` : ''}`} />
            <span>Đồng bộ</span>
          </button>
          <button
            onClick={() => {
              setContractFormError('');
              setContractFormModal({
                open: true,
                mode: 'create',
                data: {
                  userId: customers[0]?.userId || 1,
                  vehicleId: 1,
                  packageId: 1,
                  startDate: '2026-11-09',
                  endDate: '2027-11-09',
                  status: 'ACTIVE',
                },
              });
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition ${COLORS.BTN_PRIMARY}`}
          >
            <Plus className="w-4 h-4" />
            Tạo hợp đồng mới
          </button>
        </div>
      </div>

      {contractSubTab === 'requests' && (
        <div className={`rounded-3xl border shadow-sm p-6 space-y-4 ${COLORS.SURFACE_WHITE}`}>
          <div>
            <h2 className={`text-lg font-extrabold inline-block pb-1 ${COLORS.SECTION_TITLE_UNDERLINE}`}>
              Xét duyệt hợp đồng chờ kích hoạt (PENDING)
            </h2>
            <p className="text-xs mt-1">Phê duyệt kích hoạt (PENDING → ACTIVE) hoặc từ chối hợp đồng.</p>
          </div>

          {pendingContracts.length === 0 ? (
            <div className={`py-12 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
              <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
              <p className="text-xs font-bold">Không có hợp đồng nào đang chờ duyệt (PENDING)</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                    <th className="py-3 px-4">mã hợp đồng</th>
                    <th className="py-3 px-4">khách hàng</th>
                    <th className="py-3 px-4">xe máy</th>
                    <th className="py-3 px-4">gói bảo hiểm</th>
                    <th className="py-3 px-4">phí bh</th>
                    <th className="py-3 px-4">trạng thái</th>
                    <th className="py-3 px-4 text-right">thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {pendingContracts.map((req) => (
                    <tr key={req.contractId} className="hover:bg-neutral-50">
                      <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>{req.contractCode}</td>
                      <td className="py-3.5 px-4 font-bold">{req.customerFullName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">{req.plateNumber}</td>
                      <td className="py-3.5 px-4 font-bold">{req.packageName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">{formatVND(req.premiumAmount)}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenPendingDetail(req)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs ${COLORS.BTN_PRIMARY}`}
                        >
                          Thẩm định & Duyệt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {contractSubTab === 'list' && (
        <div className={`rounded-3xl border shadow-sm p-6 space-y-4 ${COLORS.SURFACE_WHITE}`}>
          <div>
            <h2 className={`text-lg font-extrabold inline-block pb-1 ${COLORS.SECTION_TITLE_UNDERLINE}`}>
              Danh mục hợp đồng bảo hiểm xe máy
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contractSearch}
                onChange={(e) => setContractSearch(e.target.value)}
                placeholder="Tìm theo Mã HĐ, Biển số xe hoặc Tên khách hàng..."
                className={`w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border focus:outline-none ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
            </div>
            <select
              value={contractStatusFilter}
              onChange={(e) => setContractStatusFilter(e.target.value)}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border ${COLORS.SURFACE_WHITE}`}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt (PENDING)</option>
              <option value="ACTIVE">Đang hiệu lực (ACTIVE)</option>
              <option value="RENEWED">Đã gia hạn (RENEWED)</option>
              <option value="EXPIRED">Hết hạn (EXPIRED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                  <th className="py-3 px-4">mã hợp đồng</th>
                  <th className="py-3 px-4">khách hàng</th>
                  <th className="py-3 px-4">xe máy</th>
                  <th className="py-3 px-4">thời hạn</th>
                  <th className="py-3 px-4">phí bh</th>
                  <th className="py-3 px-4">trạng thái</th>
                  <th className="py-3 px-4 text-right">thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filteredContracts.map((contract) => (
                  <tr key={contract.contractId} className="hover:bg-neutral-50">
                    <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>
                      {contract.contractCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{contract.customerFullName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">{contract.plateNumber}</td>
                    <td className="py-3.5 px-4 text-[11px]">
                      {formatDateVN(contract.startDate)} → {formatDateVN(contract.endDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">{formatVND(contract.premiumAmount)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={contract.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setInsuranceCardModal(contract)}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs ${COLORS.BTN_OUTLINE}`}
                        >
                          Thẻ BH
                        </button>
                        {contract.status === 'PENDING' && (
                          <button
                            onClick={() => handleOpenPendingDetail(contract)}
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs ${COLORS.ACTION_INFO_SOFT}`}
                          >
                            Kích hoạt
                          </button>
                        )}
                        {contract.status !== 'CANCELLED' && (
                          <button
                            onClick={() =>
                              setContractFormModal({
                                open: true,
                                mode: 'edit',
                                data: {
                                  contractId: contract.contractId,
                                  contractCode: contract.contractCode,
                                  userId: contract.userId,
                                  vehicleId: contract.vehicleId,
                                  packageId: contract.packageId,
                                  startDate: contract.startDate,
                                  endDate: contract.endDate,
                                  status: contract.status,
                                },
                              })
                            }
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs ${COLORS.BTN_NEUTRAL}`}
                          >
                            Sửa
                          </button>
                        )}
                        <button
                          disabled={contract.status === 'CANCELLED'}
                          onClick={() =>
                            setRenewModal({
                              open: true,
                              contract,
                              packageId: contract.packageId,
                              startDate: contract.endDate,
                              endDate: '2027-12-31',
                              error: '',
                            })
                          }
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs ${
                            contract.status === 'CANCELLED'
                              ? 'bg-neutral-100 text-black/40 cursor-not-allowed'
                              : COLORS.ACTION_SUCCESS_SOFT
                          }`}
                        >
                          Gia hạn
                        </button>
                        {contract.status !== 'CANCELLED' && (
                          <button
                            onClick={() =>
                              setCancelModal({
                                open: true,
                                contract,
                                reason: '',
                                error: '',
                              })
                            }
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs ${COLORS.ACTION_DANGER_SOFT}`}
                          >
                            Hủy HĐ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Các Modal giữ nguyên cấu trúc và lấy màu từ COLORS */}
      {selectedPendingContract && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-lg w-full border shadow-2xl p-6 sm:p-8 space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                {selectedPendingContract.contractCode}
              </h3>
              <button onClick={() => setSelectedPendingContract(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${COLORS.SURFACE_SUBTLE}`}>
              <div className="flex justify-between">
                <span>khách hàng:</span>
                <strong>{selectedPendingContract.customerFullName}</strong>
              </div>
              <div className="flex justify-between">
                <span>phí bảo hiểm:</span>
                <strong className={`font-mono ${COLORS.TEXT_PRIMARY}`}>
                  {formatVND(selectedPendingContract.premiumAmount)}
                </strong>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do nếu từ chối..."
                className={`w-full h-10 px-3 rounded-xl border text-xs ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
              {requestActionError && <p className="text-rose-600 text-xs font-bold">{requestActionError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleRejectPendingContract(selectedPendingContract)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs ${COLORS.ACTION_DANGER_SOLID}`}
                >
                  Từ chối
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleApprovePendingContract(selectedPendingContract)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs ${COLORS.ACTION_SUCCESS_SOLID}`}
                >
                  Kích hoạt (ACTIVE)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {contractFormModal.open && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-lg w-full border shadow-2xl p-6 sm:p-8 space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                {contractFormModal.mode === 'create' ? 'Tạo Hợp Đồng Mới' : 'Cập Nhật Hợp Đồng'}
              </h3>
              <button onClick={() => setContractFormModal((prev) => ({ ...prev, open: false }))}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {contractFormError && <p className="text-rose-600 text-xs font-bold">{contractFormError}</p>}
            <form onSubmit={handleSaveContractForm} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ngày bắt đầu *</label>
                  <input
                    type="date"
                    required
                    value={contractFormModal.data.startDate}
                    onChange={(e) =>
                      setContractFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, startDate: e.target.value },
                      }))
                    }
                    className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ngày kết thúc *</label>
                  <input
                    type="date"
                    required
                    value={contractFormModal.data.endDate}
                    onChange={(e) =>
                      setContractFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, endDate: e.target.value },
                      }))
                    }
                    className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContractFormModal((prev) => ({ ...prev, open: false }))}
                  className={`px-4 py-2 rounded-xl font-bold ${COLORS.BTN_NEUTRAL}`}
                >
                  Đóng
                </button>
                <button type="submit" className={`px-5 py-2 rounded-xl font-bold ${COLORS.BTN_PRIMARY}`}>
                  Lưu hợp đồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {renewModal.open && renewModal.contract && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-md w-full border shadow-2xl p-6 space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <h3 className={`text-lg font-extrabold ${COLORS.TEXT_PRIMARY}`}>
              Gia Hạn {renewModal.contract.contractCode}
            </h3>
            <form onSubmit={handleConfirmRenew} className="space-y-3 text-xs">
              <input
                type="date"
                required
                value={renewModal.endDate}
                onChange={(e) => setRenewModal((prev) => ({ ...prev, endDate: e.target.value }))}
                className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenewModal((prev) => ({ ...prev, open: false }))}
                  className={`px-4 py-2 rounded-xl font-bold ${COLORS.BTN_NEUTRAL}`}
                >
                  Đóng
                </button>
                <button type="submit" className={`px-5 py-2 rounded-xl font-bold ${COLORS.ACTION_SUCCESS_SOLID}`}>
                  Gia hạn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelModal.open && cancelModal.contract && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-md w-full border shadow-2xl p-6 space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <h3 className="text-lg font-extrabold text-rose-600">
              Hủy Hợp Đồng {cancelModal.contract.contractCode}
            </h3>
            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
              <textarea
                rows={3}
                required
                value={cancelModal.reason}
                onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Nhập lý do hủy..."
                className={`w-full p-3 rounded-xl border ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModal((prev) => ({ ...prev, open: false }))}
                  className={`px-4 py-2 rounded-xl font-bold ${COLORS.BTN_NEUTRAL}`}
                >
                  Đóng
                </button>
                <button type="submit" className={`px-5 py-2 rounded-xl font-bold ${COLORS.ACTION_DANGER_SOLID}`}>
                  Xác nhận hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {insuranceCardModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-md w-full border shadow-2xl p-6 space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                {insuranceCardModal.cardNumber || `THE-BHXM-${insuranceCardModal.contractId}`}
              </h3>
              <button onClick={() => setInsuranceCardModal(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${COLORS.SURFACE_SUBTLE}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-base">{insuranceCardModal.plateNumber}</span>
                <QrCode className="w-10 h-10" />
              </div>
              <p>Chủ xe: <strong>{insuranceCardModal.customerFullName}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}