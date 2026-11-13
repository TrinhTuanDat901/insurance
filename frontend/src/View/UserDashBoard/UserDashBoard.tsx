// File: src/View/UserDashBoard/UserDashBoard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  QrCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Car,
  X,
  Send,
  RefreshCw,
  History as HistoryIcon,
  CreditCard,
  FileWarning,
  ShieldAlert,
  FolderOpen,
  Pencil,
  Trash2,
  Ban,
  UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { UserAccount, UserHistoryResponse, UserResponse } from '../../types/index';
import { COLORS } from '../../Store/colors';
import { userApi } from '../../Store/userApi';
import { contractApi, ContractResponse } from '../../Store/contractApi';
import { compensationApi, CompensationResponse } from '../../Store/compensationApi';
import { vehicleApi, VehicleResponse } from '../../Store/vehicleApi';
import { historyApi } from '../../Store/historyApi';
import { paymentApi } from '../../Store/paymentApi';
import { accidentApi } from '../../Store/accidentApi';

interface UserDashBoardProps {
  user: UserAccount;
  onBackToLanding: () => void;
  onNavigateStaff?: () => void;
  externalOpenClaimModal?: boolean;
  onClearExternalClaimModal?: () => void;
}

/* =====================================================================
   HELPERS
   ===================================================================== */
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

const formatDateTimeVN = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const clean = dateStr.replace('T', ' ').substring(0, 16);
  const [datePart, timePart] = clean.split(' ');
  const parts = datePart.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}${timePart ? ` ${timePart}` : ''}`;
  return dateStr;
};

const toInputDateTime = (dateStr: string | null | undefined) =>
  (dateStr || '').replace(' ', 'T').substring(0, 16);

const nowInputDateTime = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().substring(0, 16);
};

const includesQ = (q: string, ...fields: Array<string | null | undefined>) =>
  !q || fields.some((f) => (f || '').toLowerCase().includes(q));

const canCancelContract = (status: string) => status === 'PENDING';
const canModifyAccident = (status: string) => status === 'REPORTED';

const ONLINE_PAYMENT_METHODS = ['BANK_TRANSFER', 'CARD', 'E_WALLET'] as const;
type OnlinePaymentMethod = (typeof ONLINE_PAYMENT_METHODS)[number];

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ ngân hàng',
  E_WALLET: 'Ví điện tử',
};

type HistorySubTab = 'contracts' | 'payments' | 'accidents' | 'punishments' | 'compensations';
type HistoryContract = UserHistoryResponse['contracts'][number];
type HistoryPayment = UserHistoryResponse['payments'][number];
type HistoryAccident = UserHistoryResponse['accidents'][number];
type HistoryPunishment = UserHistoryResponse['punishments'][number];
type HistoryCompensation = UserHistoryResponse['compensations'][number];

type AccidentModalState =
  | { mode: 'create' }
  | { mode: 'edit'; id: number; contractLabel: string };

interface AccidentForm {
  contractId: string;
  accidentDate: string;
  location: string;
  description: string;
}

const EMPTY_HISTORY: UserHistoryResponse = {
  contracts: [],
  payments: [],
  accidents: [],
  punishments: [],
  compensations: [],
};

const EMPTY_ACCIDENT_FORM: AccidentForm = {
  contractId: '',
  accidentDate: '',
  location: '',
  description: '',
};

/* =====================================================================
   COMPONENT DÙNG CHUNG
   ===================================================================== */
function ModalShell({
  title,
  onClose,
  children,
  widthClass = 'max-w-md',
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
}) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
      <div className={`rounded-3xl ${widthClass} w-full p-6 sm:p-8 shadow-2xl border relative space-y-4 ${COLORS.SURFACE_WHITE}`}>
        <button type="button" onClick={onClose} className="absolute top-5 right-5 p-2">
          <X className="w-5 h-5" />
        </button>
        <h3 className={`text-xl font-extrabold pr-8 ${COLORS.TEXT_PRIMARY}`}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

interface Column<T> {
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

function HistoryTable<T>({
  rows,
  columns,
  getKey,
  emptyText,
  isFiltered,
  renderActions,
}: {
  rows: T[];
  columns: Column<T>[];
  getKey: (row: T) => string | number;
  emptyText: string;
  isFiltered: boolean;
  renderActions?: (row: T) => React.ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <div className={`py-10 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
        <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
        <p className="text-xs font-bold">{isFiltered ? 'Không tìm thấy kết quả phù hợp' : emptyText}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
            {columns.map((col) => (
              <th key={col.header} className="py-3 px-4">{col.header}</th>
            ))}
            {renderActions && <th className="py-3 px-4 text-right">thao tác</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 font-medium">
          {rows.map((row) => (
            <tr key={getKey(row)} className="hover:bg-neutral-50">
              {columns.map((col) => (
                <td key={col.header} className={`py-3.5 px-4 ${col.className || ''}`}>
                  {col.render(row)}
                </td>
              ))}
              {renderActions && (
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-end gap-1.5">{renderActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ACTION_BTN = 'px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors';
const ACTION_BTN_DANGER = `${ACTION_BTN} border-rose-200 text-rose-700 hover:bg-rose-50`;

interface ToolbarAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

/* =====================================================================
   MAIN
   ===================================================================== */
export default function UserDashBoard({
  user,
  onBackToLanding,
  onNavigateStaff,
  externalOpenClaimModal,
  onClearExternalClaimModal,
}: UserDashBoardProps) {
  const [activeTab, setActiveTab] = useState<'cards' | 'claims' | 'vehicles' | 'history'>('cards');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. State Thông tin Cá nhân (CRUD User Info)
  const [profileData, setProfileData] = useState<UserResponse>({
    userId: Number(user.id) || 1,
    firstName: user.fullName.split(' ').slice(1).join(' ') || user.fullName,
    lastName: user.fullName.split(' ')[0] || '',
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    roles: [{ roleName: user.role === 'STAFF' ? 'STAFF' : 'USER' }],
    avatarPath: null,
  });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editProfileError, setEditProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // 2. Dynamic Data (Hợp đồng, Bồi thường, Phương tiện, Lịch sử)
  const [policies, setPolicies] = useState<ContractResponse[]>([]);
  const [claims, setClaims] = useState<CompensationResponse[]>([]);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [history, setHistory] = useState<UserHistoryResponse>(EMPTY_HISTORY);

  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [selectedPolicyForModal, setSelectedPolicyForModal] = useState<ContractResponse | null>(null);

  // Modal Khai báo Bồi thường
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedContractForClaim, setSelectedContractForClaim] = useState<string>('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [estimatedDamage, setEstimatedDamage] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimSubmitSuccess, setClaimSubmitSuccess] = useState(false);

  // Modal Thêm Phương Tiện
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newEngineNumber, setNewEngineNumber] = useState('');
  const [newChassisNumber, setNewChassisNumber] = useState('');
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

  // Tab Lịch sử
  const [historySubTab, setHistorySubTab] = useState<HistorySubTab>('contracts');
  const [historyQuery, setHistoryQuery] = useState('');
  const [isMutating, setIsMutating] = useState(false);

  // Tai nạn: thêm / sửa / xoá
  const [accidentModal, setAccidentModal] = useState<AccidentModalState | null>(null);
  const [accidentForm, setAccidentForm] = useState<AccidentForm>(EMPTY_ACCIDENT_FORM);
  const [accidentToDelete, setAccidentToDelete] = useState<HistoryAccident | null>(null);

  // Thanh toán
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentContractId, setPaymentContractId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OnlinePaymentMethod>('BANK_TRANSFER');

  // Huỷ hợp đồng
  const [contractToCancel, setContractToCancel] = useState<HistoryContract | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Mở modal bồi thường từ nút gợi ý trong AI Chatbot
  useEffect(() => {
    if (externalOpenClaimModal) {
      setIsClaimModalOpen(true);
      onClearExternalClaimModal?.();
    }
  }, [externalOpenClaimModal, onClearExternalClaimModal]);

  const showToast = useCallback((message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [myInfoData, contractsData, claimsData, vehiclesData, historyData] = await Promise.all([
        userApi.getMyInfo().catch(() => null),
        contractApi.getMyContracts().catch(() => []),
        compensationApi.getMyCompensations().catch(() => []),
        vehicleApi.getMyVehicles().catch(() => []),
        historyApi.getMyHistory().catch(() => EMPTY_HISTORY),
      ]);
      if (myInfoData) setProfileData(myInfoData);
      setPolicies(contractsData);
      setClaims(claimsData);
      setVehicles(vehiclesData);
      setHistory(historyData);
      if (contractsData.length > 0) setSelectedContractForClaim(String(contractsData[0].contractId));
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải dữ liệu cá nhân.', 'warning');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mở Modal chỉnh sửa thông tin cá nhân
  const openEditProfileModal = () => {
    setEditProfileError('');
    setEditFirstName(profileData.firstName?.trim() || '');
    setEditLastName(profileData.lastName?.trim() || '');
    setEditEmail(profileData.email || '');
    setEditPhone(profileData.phone || '');
    setIsEditProfileOpen(true);
  };

  // Lưu thông tin cá nhân (POST /users/update/{userId})
  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfileError('');

    if (!editLastName.trim() || !editFirstName.trim()) {
      setEditProfileError('Vui lòng nhập đầy đủ Họ và Tên.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editEmail.trim() || !emailRegex.test(editEmail.trim())) {
      setEditProfileError('Địa chỉ email không đúng định dạng.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await userApi.updateUser(profileData.userId, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        avatarPath: profileData.avatarPath,
      });
      setProfileData(updated);
      setIsEditProfileOpen(false);
      showToast('Đã cập nhật thông tin cá nhân thành công!');
    } catch (err: any) {
      setEditProfileError(err.message || 'Cập nhật thông tin thất bại.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    const q = cardSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.cardNumber || '').toLowerCase().includes(q) ||
      (p.plateNumber || '').toLowerCase().includes(q) ||
      (p.vehicleName || '').toLowerCase().includes(q)
    );
  });

  const handleCreateClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDescription.trim() || !estimatedDamage.trim()) return;

    setIsSubmittingClaim(true);
    try {
      await compensationApi.requestCompensation({
        contractId: Number(selectedContractForClaim),
        userId: profileData.userId,
        requestedAmount: Number(estimatedDamage),
        description: incidentDescription.trim(),
      });
      setClaimSubmitSuccess(true);
      setTimeout(() => {
        setClaimSubmitSuccess(false);
        setIsClaimModalOpen(false);
        setActiveTab('claims');
        setIncidentDescription('');
        setEstimatedDamage('');
        fetchData();
      }, 1800);
    } catch (err: any) {
      showToast(err.message || 'Gửi yêu cầu bồi thường thất bại.', 'warning');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleCreateVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehiclePlate.trim() || !newVehicleName.trim()) return;

    setIsSubmittingVehicle(true);
    try {
      await vehicleApi.addVehicle({
        vehicleName: newVehicleName.trim(),
        plateNumber: newVehiclePlate.trim(),
        brandId: 1,
        categoryId: 1,
        engineNumber: newEngineNumber.trim() || `ENG-${Date.now()}`,
        chassisNumber: newChassisNumber.trim() || `CHA-${Date.now()}`,
        manufactureYear: new Date().getFullYear(),
      });
      showToast('Đã thêm phương tiện mới thành công!');
      setIsVehicleModalOpen(false);
      setNewVehiclePlate('');
      setNewVehicleName('');
      setNewEngineNumber('');
      setNewChassisNumber('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Thêm phương tiện thất bại.', 'warning');
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const handleRequestInsurance = async (vehicleId: number) => {
    try {
      await contractApi.createContract({
        userId: profileData.userId,
        vehicleId,
        packageId: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: 'PENDING',
      });
      showToast('Đã gửi yêu cầu mua bảo hiểm thành công. Chờ chuyên viên duyệt.');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Yêu cầu mua bảo hiểm thất bại.', 'warning');
    }
  };

  /* ---------------------------------------------------------------
     TAB LỊCH SỬ — dữ liệu dẫn xuất & thao tác ghi
     --------------------------------------------------------------- */
  const q = historyQuery.trim().toLowerCase();
  const activePolicies = policies.filter((p) => p.status === 'ACTIVE');

  const isPayable = (c: HistoryContract) =>
    c.status === 'PENDING' &&
    !history.payments.some((p) => p.contractCode === c.contractCode && p.status === 'SUCCESS');
  const payableContracts = history.contracts.filter(isPayable);
  const selectedPayable = payableContracts.find((c) => String(c.contractId) === paymentContractId);

  const contractRows = history.contracts.filter((c) => includesQ(q, c.contractCode, c.plateNumber));
  const paymentRows = history.payments.filter((p) => includesQ(q, p.contractCode, p.transactionRef));
  const accidentRows = history.accidents.filter((a) => includesQ(q, a.contractCode, a.plateNumber));
  const punishmentRows = history.punishments.filter((pu) => includesQ(q, pu.contractCode, pu.reason));
  const compensationRows = history.compensations.filter((cm) => includesQ(q, cm.contractCode));

  const runMutation = async (
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string,
    onDone?: () => void,
  ) => {
    setIsMutating(true);
    try {
      await action();
      showToast(successMessage);
      onDone?.();
      await fetchData();
    } catch (err: any) {
      showToast(err.message || errorMessage, 'warning');
    } finally {
      setIsMutating(false);
    }
  };

  const openCreateAccident = () => {
    setAccidentForm({
      ...EMPTY_ACCIDENT_FORM,
      contractId: activePolicies[0] ? String(activePolicies[0].contractId) : '',
    });
    setAccidentModal({ mode: 'create' });
  };

  const openEditAccident = (a: HistoryAccident) => {
    setAccidentForm({
      contractId: '',
      accidentDate: toInputDateTime(a.accidentDate),
      location: a.location || '',
      description: a.description || '',
    });
    setAccidentModal({
      mode: 'edit',
      id: a.accidentId,
      contractLabel: `${a.contractCode} (${a.plateNumber})`,
    });
  };

  const handleAccidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accidentModal || !accidentForm.accidentDate || !accidentForm.description.trim()) return;

    const payload = {
      accidentDate: `${accidentForm.accidentDate}:00`,
      location: accidentForm.location.trim(),
      description: accidentForm.description.trim(),
    };

    if (accidentModal.mode === 'create') {
      if (!accidentForm.contractId) return;
      void runMutation(
        () => accidentApi.reportAccident({ contractId: Number(accidentForm.contractId), ...payload }),
        'Đã gửi báo cáo tai nạn. Chuyên viên sẽ tiếp nhận sớm.',
        'Gửi báo cáo tai nạn thất bại.',
        () => setAccidentModal(null),
      );
    } else {
      const { id } = accidentModal;
      void runMutation(
        () => accidentApi.updateAccident(id, payload),
        'Đã cập nhật sự vụ tai nạn.',
        'Cập nhật sự vụ thất bại.',
        () => setAccidentModal(null),
      );
    }
  };

  const handleDeleteAccident = () => {
    if (!accidentToDelete) return;
    const { accidentId } = accidentToDelete;
    void runMutation(
      () => accidentApi.deleteAccident(accidentId),
      'Đã xoá sự vụ tai nạn.',
      'Xoá sự vụ thất bại.',
      () => setAccidentToDelete(null),
    );
  };

  const openPaymentModal = (contractId?: number) => {
    const target = contractId ?? payableContracts[0]?.contractId;
    setPaymentContractId(target !== undefined ? String(target) : '');
    setPaymentMethod('BANK_TRANSFER');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayable) return;
    void runMutation(
      () => paymentApi.createPayment({ contractId: selectedPayable.contractId, paymentMethod }),
      'Thanh toán thành công.',
      'Thanh toán thất bại.',
      () => {
        setIsPaymentModalOpen(false);
        setHistorySubTab('payments');
      },
    );
  };

  const openCancelContract = (c: HistoryContract) => {
    setCancelReason('');
    setContractToCancel(c);
  };

  const handleCancelContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractToCancel || !cancelReason.trim()) return;
    const { contractId } = contractToCancel;
    void runMutation(
      () => contractApi.cancelContract(contractId, cancelReason.trim()),
      'Đã huỷ yêu cầu hợp đồng.',
      'Huỷ hợp đồng thất bại.',
      () => setContractToCancel(null),
    );
  };

  const contractColumns: Column<HistoryContract>[] = [
    { header: 'mã hợp đồng', className: `font-mono font-bold ${COLORS.TEXT_PRIMARY}`, render: (c) => c.contractCode },
    {
      header: 'phương tiện',
      className: 'font-bold',
      render: (c) => (
        <>
          {c.plateNumber} <span className="font-normal text-black/60">({c.vehicleName})</span>
        </>
      ),
    },
    { header: 'gói bảo hiểm', render: (c) => c.packageName },
    {
      header: 'thời hạn',
      className: 'font-mono text-[11px]',
      render: (c) => `${formatDateVN(c.startDate)} → ${formatDateVN(c.endDate)}`,
    },
    { header: 'mức phí', className: 'font-mono font-bold', render: (c) => formatVND(c.premiumAmount) },
    { header: 'trạng thái', render: (c) => <StatusBadge status={c.status} /> },
  ];

  const paymentColumns: Column<HistoryPayment>[] = [
    {
      header: 'mã giao dịch',
      className: `font-mono font-bold ${COLORS.TEXT_PRIMARY}`,
      render: (p) => p.transactionRef || `PAY-${p.paymentId}`,
    },
    { header: 'mã hợp đồng', className: 'font-mono font-bold', render: (p) => p.contractCode },
    { header: 'ngày thanh toán', className: 'font-mono', render: (p) => formatDateTimeVN(p.paymentDate) },
    {
      header: 'phương thức',
      className: 'font-bold',
      render: (p) => PAYMENT_METHOD_LABEL[p.paymentMethod] || p.paymentMethod,
    },
    { header: 'số tiền', className: 'font-mono font-bold', render: (p) => formatVND(p.amount) },
    { header: 'trạng thái', render: (p) => <StatusBadge status={p.status} /> },
  ];

  const accidentColumns: Column<HistoryAccident>[] = [
    { header: 'mã sự vụ', className: `font-mono font-bold ${COLORS.TEXT_PRIMARY}`, render: (a) => `#TN-${a.accidentId}` },
    { header: 'hợp đồng & biển số', className: 'font-mono font-bold', render: (a) => `${a.contractCode} (${a.plateNumber})` },
    { header: 'thời gian', className: 'font-mono', render: (a) => formatDateTimeVN(a.accidentDate) },
    { header: 'địa điểm', render: (a) => a.location || '—' },
    { header: 'mô tả', className: 'max-w-xs', render: (a) => a.description || '—' },
    { header: 'trạng thái', render: (a) => <StatusBadge status={a.status} /> },
  ];

  const punishmentColumns: Column<HistoryPunishment>[] = [
    { header: 'mã xử phạt', className: `font-mono font-bold ${COLORS.TEXT_PRIMARY}`, render: (pu) => `#XP-${pu.punishmentId}` },
    { header: 'mã hợp đồng', className: 'font-mono font-bold', render: (pu) => pu.contractCode || '—' },
    { header: 'ngày ghi nhận', className: 'font-mono', render: (pu) => formatDateVN(pu.punishmentDate) },
    { header: 'lý do chế tài', render: (pu) => pu.reason },
    { header: 'mức phạt', className: 'font-mono font-bold text-rose-700', render: (pu) => formatVND(pu.fineAmount) },
    { header: 'trạng thái', render: (pu) => <StatusBadge status={pu.status} /> },
  ];

  const compensationColumns: Column<HistoryCompensation>[] = [
    { header: 'mã hồ sơ', className: `font-mono font-bold ${COLORS.TEXT_PRIMARY}`, render: (cm) => `#BT-${cm.compensationId}` },
    { header: 'mã hợp đồng', className: 'font-mono font-bold', render: (cm) => cm.contractCode },
    { header: 'ngày yêu cầu', className: 'font-mono', render: (cm) => formatDateTimeVN(cm.requestDate) },
    { header: 'số tiền yêu cầu', className: 'font-mono font-bold', render: (cm) => formatVND(cm.requestedAmount) },
    { header: 'số tiền được duyệt', className: 'font-mono font-bold text-emerald-700', render: (cm) => formatVND(cm.approvedAmount) },
    { header: 'mô tả', className: 'max-w-xs', render: (cm) => cm.description || '—' },
    { header: 'trạng thái', render: (cm) => <StatusBadge status={cm.status} /> },
  ];

  const HISTORY_TABS: { id: HistorySubTab; label: string; icon: LucideIcon }[] = [
    { id: 'contracts', label: `Lịch sử Hợp đồng (${history.contracts.length})`, icon: FileText },
    { id: 'payments', label: `Lịch sử Thanh toán (${history.payments.length})`, icon: CreditCard },
    { id: 'accidents', label: `Lịch sử Tai nạn (${history.accidents.length})`, icon: AlertTriangle },
    { id: 'punishments', label: `Lịch sử Xử phạt (${history.punishments.length})`, icon: FileWarning },
    { id: 'compensations', label: `Lịch sử Bồi thường (${history.compensations.length})`, icon: ShieldAlert },
  ];

  const toolbarConfig: Record<HistorySubTab, { hint: string; action?: ToolbarAction }> = {
    contracts: {
      hint: 'Chỉ huỷ được hợp đồng đang chờ duyệt. Hợp đồng đã duyệt được giữ lại để đối soát.',
      action: { label: 'Mua bảo hiểm mới', icon: Plus, onClick: () => setActiveTab('vehicles') },
    },
    payments: {
      hint: 'Giao dịch đã ghi nhận không thể sửa hoặc xoá.',
      action: {
        label: 'Thanh toán hợp đồng',
        icon: CreditCard,
        onClick: () => openPaymentModal(),
        disabled: payableContracts.length === 0,
        title: payableContracts.length === 0 ? 'Không có hợp đồng nào đang chờ thanh toán' : undefined,
      },
    },
    accidents: {
      hint: 'Chỉ sửa hoặc xoá được sự vụ chưa được chuyên viên tiếp nhận.',
      action: {
        label: 'Báo cáo tai nạn',
        icon: AlertTriangle,
        onClick: openCreateAccident,
        disabled: activePolicies.length === 0,
        title: activePolicies.length === 0 ? 'Cần có hợp đồng đang hiệu lực để báo cáo tai nạn' : undefined,
      },
    },
    punishments: {
      hint: 'Biên bản do chuyên viên lập, bạn chỉ có quyền xem.',
    },
    compensations: {
      hint: 'Yêu cầu bồi thường được gửi qua mục Khai báo Bồi thường.',
      action: { label: 'Khai báo bồi thường', icon: ShieldAlert, onClick: () => setIsClaimModalOpen(true) },
    },
  };

  const currentToolbar = toolbarConfig[historySubTab];
  const ToolbarIcon = currentToolbar.action?.icon;

  const displayName =
    profileData.fullName?.trim() ||
    `${profileData.lastName || ''} ${profileData.firstName || ''}`.trim() ||
    user.fullName;

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${COLORS.TEXT_MAIN}`}>
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${toast.type === 'warning' ? 'bg-amber-900 text-white border-amber-700' : `${COLORS.BTN_PRIMARY} border-blue-400`}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER CARD (Tích hợp CRUD Thông tin cá nhân) */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${COLORS.SURFACE_WHITE}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm shrink-0 ${COLORS.BTN_PRIMARY}`}>
              {displayName.split(' ').pop()?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${COLORS.TEXT_PRIMARY}`}>
                  {displayName}
                </h1>
                <StatusBadge status="ACTIVE" customLabel="Đang hoạt động" />
              </div>
              <p className="text-xs flex flex-wrap items-center gap-2.5">
                <span>email: <strong>{profileData.email}</strong></span>
                <span>·</span>
                <span>sđt: <strong>{profileData.phone || 'Chưa cập nhật'}</strong></span>
                <span>·</span>
                <span>id: <strong className="font-mono">#{profileData.userId}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user.role === 'STAFF' && onNavigateStaff && (
              <button onClick={onNavigateStaff} className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${COLORS.BTN_DARK}`}>
                Nghiệp vụ & Hồ sơ Staff
              </button>
            )}
            <button
              onClick={openEditProfileModal}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${COLORS.BTN_OUTLINE}`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Chỉnh sửa thông tin</span>
            </button>
            <button onClick={() => setIsClaimModalOpen(true)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${COLORS.BTN_WARNING_CTA}`}>
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Khai báo Bồi thường</span>
            </button>
            <button onClick={onBackToLanding} className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${COLORS.BTN_NEUTRAL}`}>
              Về Trang chủ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-100 text-xs">
          <div className={`p-3 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
            <span className="text-[11px] block">thẻ bảo hiểm hiệu lực:</span>
            <span className="text-base font-extrabold mt-0.5 block">{policies.filter(p => p.status === 'ACTIVE').length} Thẻ</span>
          </div>
          <div className={`p-3 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
            <span className="text-[11px] block">hồ sơ bồi thường:</span>
            <span className="text-base font-extrabold mt-0.5 block">{claims.length} Vụ việc</span>
          </div>
          <div className={`p-3 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
            <span className="text-[11px] block">phương tiện đăng ký:</span>
            <span className="text-base font-extrabold mt-0.5 block">{vehicles.length} Xe máy</span>
          </div>
          <div className={`p-3 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
            <span className="text-[11px] block">tổng bồi thường đã nhận:</span>
            <span className="text-base font-extrabold font-mono mt-0.5 block">
              {formatVND(claims.filter(c => c.status === 'APPROVED' || c.status === 'PAID').reduce((acc, c) => acc + (c.approvedAmount || 0), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 text-xs font-bold">
        {[
          { id: 'cards' as const, label: `Thẻ bảo hiểm (${policies.length})`, icon: QrCode },
          { id: 'claims' as const, label: `Hồ sơ bồi thường (${claims.length})`, icon: FileText },
          { id: 'vehicles' as const, label: `Phương tiện (${vehicles.length})`, icon: Car },
          { id: 'history' as const, label: 'Lịch sử & Giao dịch', icon: HistoryIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id ? `${COLORS.BTN_PRIMARY} shadow-sm` : 'hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
        <button onClick={fetchData} className={`px-4 py-2.5 rounded-xl ml-auto flex items-center gap-1.5 ${COLORS.BTN_OUTLINE}`}>
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? `animate-spin ${COLORS.TEXT_PRIMARY}` : ''}`} />
          Đồng bộ
        </button>
      </div>

      {/* TAB 1: THẺ BẢO HIỂM */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className={`rounded-2xl p-4 border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 ${COLORS.SURFACE_WHITE}`}>
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={cardSearchQuery}
                onChange={(e) => setCardSearchQuery(e.target.value)}
                placeholder="Tra cứu theo mã thẻ, biển số xe..."
                className={`w-full h-10 pl-9 pr-4 rounded-xl border font-semibold focus:outline-none ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
              <Search className="w-4 h-4 text-black/50 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPolicies.map((pol) => (
              <div key={pol.contractId} className={`rounded-3xl p-5 border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow ${COLORS.SURFACE_WHITE}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">chứng nhận điện tử</span>
                    <h3 className="text-base font-extrabold mt-0.5">{pol.vehicleName}</h3>
                    <p className="text-xs font-bold font-mono mt-0.5">bks: {pol.plateNumber}</p>
                  </div>
                  <StatusBadge status={pol.status} />
                </div>
                <div className={`p-4 rounded-2xl border space-y-2 text-xs ${COLORS.SURFACE_SUBTLE}`}>
                  <div className="flex justify-between">
                    <span>mã thẻ:</span>
                    <span className="font-mono font-bold">{pol.cardNumber || 'Chưa phát hành'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>gói:</span>
                    <span className="font-semibold truncate max-w-[170px] text-right">{pol.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>thời hạn:</span>
                    <span className="font-bold">{formatDateVN(pol.startDate)} – {formatDateVN(pol.endDate)}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPolicyForModal(pol)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${COLORS.BTN_PRIMARY}`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Xem thẻ (QR)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HỒ SƠ BỒI THƯỜNG */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.compensationId} className={`rounded-3xl p-6 border shadow-sm space-y-4 ${COLORS.SURFACE_WHITE}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-extrabold">{claim.claimCode}</span>
                    <span>·</span>
                    <span className="font-bold">xe: {claim.plateNumber}</span>
                  </div>
                  <p className="text-xs flex items-center gap-1.5">
                    <span>gửi lúc: <strong>{formatDateVN(claim.requestDate)}</strong></span>
                  </p>
                </div>
                <StatusBadge status={claim.status} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                <div className={`lg:col-span-8 p-3.5 rounded-2xl border space-y-2 ${COLORS.SURFACE_SUBTLE}`}>
                  <p className="font-bold">chi tiết sự cố tai nạn:</p>
                  <p className="leading-relaxed">{claim.description}</p>
                </div>
                <div className={`lg:col-span-4 p-3.5 rounded-2xl border space-y-2 flex flex-col justify-between ${COLORS.SURFACE_SUBTLE}`}>
                  <div className="space-y-1">
                    <span className="text-[11px] block">thiệt hại ước tính (đề xuất):</span>
                    <span className="text-sm font-extrabold font-mono">{formatVND(claim.requestedAmount)}</span>
                    {claim.approvedAmount !== null && (
                      <div className="pt-1">
                        <span className="text-[11px] block">số tiền đã duyệt chi trả:</span>
                        <span className={`text-base font-black font-mono ${COLORS.TEXT_PRIMARY}`}>
                          {formatVND(claim.approvedAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: QUẢN LÝ PHƯƠNG TIỆN */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className={`rounded-3xl p-6 border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${COLORS.SURFACE_WHITE}`}>
            <div>
              <h2 className={`text-lg font-extrabold ${COLORS.TEXT_PRIMARY}`}>Danh Sách Phương Tiện Cá Nhân</h2>
              <p className="text-xs mt-0.5">Quản lý xe máy và yêu cầu mua bảo hiểm cho xe chưa có hợp đồng.</p>
            </div>
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 ${COLORS.BTN_PRIMARY}`}
            >
              <Plus className="w-4 h-4" />
              <span>Thêm xe máy mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {vehicles.map((veh) => (
              <div key={veh.vehicleId} className={`rounded-2xl p-5 border shadow-sm space-y-3 ${COLORS.SURFACE_WHITE}`}>
                <div className="flex items-center justify-between text-xs">
                  <Car className="w-5 h-5" />
                  <StatusBadge
                    status={veh.hasActiveInsurance ? 'ACTIVE' : 'PENDING'}
                    customLabel={veh.hasActiveInsurance ? 'Đã có bảo hiểm' : 'Chưa có bảo hiểm'}
                  />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">{veh.brandName} {veh.vehicleName}</h3>
                  <p className="text-xs font-black font-mono mt-0.5">{veh.plateNumber}</p>
                </div>
                <div className={`p-2.5 rounded-xl text-xs space-y-1 font-mono ${COLORS.SURFACE_SUBTLE}`}>
                  <p>số khung: {veh.chassisNumber}</p>
                  <p>số máy: {veh.engineNumber}</p>
                </div>
                {!veh.hasActiveInsurance && (
                  <button
                    onClick={() => handleRequestInsurance(veh.vehicleId)}
                    className={`w-full py-2 rounded-xl text-xs font-bold ${COLORS.BTN_PRIMARY}`}
                  >
                    Đăng ký mua bảo hiểm
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LỊCH SỬ & GIAO DỊCH */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <div className={`p-4 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 ${COLORS.SURFACE_WHITE}`}>
            <div className="flex flex-wrap items-center gap-2">
              {HISTORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = historySubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setHistorySubTab(tab.id)}
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
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="Tìm theo mã HĐ, biển số..."
                className={`w-full h-9 pl-9 pr-3 rounded-xl border text-xs font-semibold focus:outline-none ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
            </div>
          </div>

          <div className={`rounded-3xl border shadow-sm p-6 space-y-4 ${COLORS.SURFACE_WHITE}`}>
            {isLoading ? (
              <div className="py-12 text-center text-xs font-bold">Đang tải dữ liệu lịch sử...</div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs">{currentToolbar.hint}</p>
                  {currentToolbar.action && ToolbarIcon && (
                    <button
                      onClick={currentToolbar.action.onClick}
                      disabled={currentToolbar.action.disabled}
                      title={currentToolbar.action.title}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${COLORS.BTN_PRIMARY}`}
                    >
                      <ToolbarIcon className="w-4 h-4" />
                      <span>{currentToolbar.action.label}</span>
                    </button>
                  )}
                </div>

                {historySubTab === 'contracts' && (
                  <HistoryTable
                    rows={contractRows}
                    columns={contractColumns}
                    getKey={(c) => c.contractId}
                    emptyText="Chưa có lịch sử hợp đồng"
                    isFiltered={!!q && history.contracts.length > 0}
                    renderActions={(c) => {
                      const payable = isPayable(c);
                      const cancellable = canCancelContract(c.status);
                      if (!payable && !cancellable) return <span className="text-black/40">—</span>;
                      return (
                        <>
                          {payable && (
                            <button onClick={() => openPaymentModal(c.contractId)} className={`${ACTION_BTN} ${COLORS.BTN_PRIMARY}`}>
                              <CreditCard className="w-3 h-3" />
                              <span>Thanh toán</span>
                            </button>
                          )}
                          {cancellable && (
                            <button onClick={() => openCancelContract(c)} className={ACTION_BTN_DANGER}>
                              <Ban className="w-3 h-3" />
                              <span>Huỷ</span>
                            </button>
                          )}
                        </>
                      );
                    }}
                  />
                )}

                {historySubTab === 'payments' && (
                  <HistoryTable
                    rows={paymentRows}
                    columns={paymentColumns}
                    getKey={(p) => p.paymentId}
                    emptyText="Chưa có lịch sử giao dịch thanh toán"
                    isFiltered={!!q && history.payments.length > 0}
                  />
                )}

                {historySubTab === 'accidents' && (
                  <HistoryTable
                    rows={accidentRows}
                    columns={accidentColumns}
                    getKey={(a) => a.accidentId}
                    emptyText="Chưa có lịch sử tai nạn nào"
                    isFiltered={!!q && history.accidents.length > 0}
                    renderActions={(a) =>
                      canModifyAccident(a.status) ? (
                        <>
                          <button onClick={() => openEditAccident(a)} className={`${ACTION_BTN} ${COLORS.BTN_OUTLINE}`}>
                            <Pencil className="w-3 h-3" />
                            <span>Sửa</span>
                          </button>
                          <button onClick={() => setAccidentToDelete(a)} className={ACTION_BTN_DANGER}>
                            <Trash2 className="w-3 h-3" />
                            <span>Xoá</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-black/40">—</span>
                      )
                    }
                  />
                )}

                {historySubTab === 'punishments' && (
                  <HistoryTable
                    rows={punishmentRows}
                    columns={punishmentColumns}
                    getKey={(pu) => pu.punishmentId}
                    emptyText="Chưa có biên bản xử phạt / chế tài nào"
                    isFiltered={!!q && history.punishments.length > 0}
                  />
                )}

                {historySubTab === 'compensations' && (
                  <HistoryTable
                    rows={compensationRows}
                    columns={compensationColumns}
                    getKey={(cm) => cm.compensationId}
                    emptyText="Chưa có lịch sử yêu cầu bồi thường"
                    isFiltered={!!q && history.compensations.length > 0}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CHỈNH SỬA THÔNG TIN CÁ NHÂN (CRUD USER INFO) */}
      {isEditProfileOpen && (
        <ModalShell title="Chỉnh Sửa Thông Tin Cá Nhân" onClose={() => setIsEditProfileOpen(false)}>
          {editProfileError && (
            <div className={`p-3 rounded-xl text-xs font-bold ${COLORS.ACTION_DANGER_SOFT}`}>
              {editProfileError}
            </div>
          )}
          <form onSubmit={handleUpdateProfileSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">họ (last name) *</label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">tên (first name) *</label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1">địa chỉ email *</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">số điện thoại *</label>
              <input
                type="tel"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border font-mono font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-bold ${COLORS.BTN_NEUTRAL}`}
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className={`px-5 py-2.5 rounded-xl font-bold shadow ${COLORS.BTN_PRIMARY}`}
              >
                {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* MODAL: XEM THẺ QR */}
      {selectedPolicyForModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border relative space-y-5 ${COLORS.SURFACE_WHITE}`}>
            <button onClick={() => setSelectedPolicyForModal(null)} className="absolute top-5 right-5 p-2">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-1 border-b pb-4">
              <h3 className={`text-base sm:text-lg font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                GIẤY CHỨNG NHẬN BẢO HIỂM ĐIỆN TỬ
              </h3>
            </div>
            <div className={`p-5 rounded-2xl border space-y-4 ${COLORS.SURFACE_SUBTLE}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono">mã số thẻ:</span>
                  <p className="text-lg font-black font-mono tracking-wider">{selectedPolicyForModal.cardNumber || 'PENDING'}</p>
                  <div className="mt-1"><StatusBadge status={selectedPolicyForModal.status} /></div>
                </div>
                <div className="bg-white p-1.5 rounded-lg border"><QrCode className="w-10 h-10" /></div>
              </div>
              <div className="space-y-1 text-xs">
                <p>chủ xe: <strong>{selectedPolicyForModal.customerFullName}</strong></p>
                <p>biển số: <strong>{selectedPolicyForModal.plateNumber}</strong></p>
                <p>hiệu lực: <strong>{formatDateVN(selectedPolicyForModal.startDate)}</strong> đến <strong>{formatDateVN(selectedPolicyForModal.endDate)}</strong></p>
                {selectedPolicyForModal.qrCodeData && (
                  <p className="text-[10px] font-mono text-black/60 break-all mt-2 pt-2 border-t">Payload: {selectedPolicyForModal.qrCodeData}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KHAI BÁO BỒI THƯỜNG */}
      {isClaimModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border relative space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <button onClick={() => setIsClaimModalOpen(false)} className="absolute top-5 right-5 p-2">
              <X className="w-5 h-5" />
            </button>
            {claimSubmitSuccess ? (
              <div className="text-center space-y-4 py-6">
                <CheckCircle2 className={`w-12 h-12 mx-auto ${COLORS.TEXT_PRIMARY}`} />
                <h3 className={`text-xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>Đã Gửi Yêu Cầu Thành Công!</h3>
              </div>
            ) : (
              <>
                <h3 className={`text-xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>Yêu Cầu Bồi Thường Tai Nạn</h3>
                <form onSubmit={handleCreateClaimSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold mb-1">chọn hợp đồng bảo hiểm *</label>
                    <select
                      value={selectedContractForClaim}
                      onChange={(e) => setSelectedContractForClaim(e.target.value)}
                      className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                    >
                      {policies.filter(p => p.status === 'ACTIVE').map((p) => (
                        <option key={p.contractId} value={p.contractId}>
                          {p.plateNumber} - {p.contractCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">mô tả chi tiết tổn thất *</label>
                    <textarea
                      rows={3}
                      required
                      value={incidentDescription}
                      onChange={(e) => setIncidentDescription(e.target.value)}
                      placeholder="Trình bày diễn biến tai nạn và thiệt hại..."
                      className={`w-full p-3 rounded-xl border ${COLORS.SURFACE_INPUT_STANDARD}`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">ước tính thiệt hại (vnđ) *</label>
                    <input
                      type="number"
                      required
                      value={estimatedDamage}
                      onChange={(e) => setEstimatedDamage(e.target.value)}
                      className={`w-full h-10 px-3 rounded-xl border font-mono font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingClaim}
                    className={`w-full h-11 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${COLORS.BTN_PRIMARY}`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingClaim ? 'Đang gửi...' : 'Gửi yêu cầu bồi thường'}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: THÊM XE MÁY */}
      {isVehicleModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border relative space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <button onClick={() => setIsVehicleModalOpen(false)} className="absolute top-5 right-5 p-2">
              <X className="w-5 h-5" />
            </button>
            <h3 className={`text-xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>Đăng Ký Xe Máy Mới</h3>
            <form onSubmit={handleCreateVehicleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">biển kiểm soát *</label>
                <input
                  type="text"
                  required
                  value={newVehiclePlate}
                  onChange={(e) => setNewVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="VD: 59P1-889.99"
                  className={`w-full h-10 px-3.5 rounded-xl border font-mono font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">tên phương tiện *</label>
                <input
                  type="text"
                  required
                  value={newVehicleName}
                  onChange={(e) => setNewVehicleName(e.target.value)}
                  placeholder="VD: Vision 110"
                  className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">số máy</label>
                  <input
                    type="text"
                    value={newEngineNumber}
                    onChange={(e) => setNewEngineNumber(e.target.value)}
                    className={`w-full h-10 px-3 rounded-xl border font-mono ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">số khung</label>
                  <input
                    type="text"
                    value={newChassisNumber}
                    onChange={(e) => setNewChassisNumber(e.target.value)}
                    className={`w-full h-10 px-3 rounded-xl border font-mono ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmittingVehicle}
                className={`w-full h-10 rounded-xl font-bold shadow-sm transition-all ${COLORS.BTN_PRIMARY}`}
              >
                {isSubmittingVehicle ? 'Đang lưu...' : 'Lưu phương tiện'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BÁO CÁO / SỬA TAI NẠN */}
      {accidentModal && (
        <ModalShell
          title={accidentModal.mode === 'create' ? 'Báo Cáo Tai Nạn' : 'Cập Nhật Sự Vụ Tai Nạn'}
          onClose={() => setAccidentModal(null)}
          widthClass="max-w-lg"
        >
          <form onSubmit={handleAccidentSubmit} className="space-y-3.5 text-xs">
            {accidentModal.mode === 'create' ? (
              <div>
                <label className="block font-bold mb-1">hợp đồng bảo hiểm *</label>
                <select
                  required
                  value={accidentForm.contractId}
                  onChange={(e) => setAccidentForm({ ...accidentForm, contractId: e.target.value })}
                  className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                >
                  {activePolicies.map((p) => (
                    <option key={p.contractId} value={p.contractId}>
                      {p.plateNumber} - {p.contractCode}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className={`p-3 rounded-xl border font-mono font-bold ${COLORS.SURFACE_SUBTLE}`}>
                hợp đồng: {accidentModal.contractLabel}
              </div>
            )}
            <div>
              <label className="block font-bold mb-1">thời điểm xảy ra *</label>
              <input
                type="datetime-local"
                required
                max={nowInputDateTime()}
                value={accidentForm.accidentDate}
                onChange={(e) => setAccidentForm({ ...accidentForm, accidentDate: e.target.value })}
                className={`w-full h-10 px-3 rounded-xl border font-mono font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">địa điểm</label>
              <input
                type="text"
                maxLength={255}
                value={accidentForm.location}
                onChange={(e) => setAccidentForm({ ...accidentForm, location: e.target.value })}
                placeholder="VD: Ngã tư Hàng Xanh, Bình Thạnh"
                className={`w-full h-10 px-3 rounded-xl border font-semibold ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">mô tả diễn biến *</label>
              <textarea
                rows={3}
                required
                maxLength={500}
                value={accidentForm.description}
                onChange={(e) => setAccidentForm({ ...accidentForm, description: e.target.value })}
                placeholder="Trình bày diễn biến vụ tai nạn..."
                className={`w-full p-3 rounded-xl border ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
            </div>
            <button
              type="submit"
              disabled={isMutating || (accidentModal.mode === 'create' && !accidentForm.contractId)}
              className={`w-full h-10 rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 ${COLORS.BTN_PRIMARY}`}
            >
              {isMutating ? 'Đang lưu...' : accidentModal.mode === 'create' ? 'Gửi báo cáo' : 'Lưu thay đổi'}
            </button>
          </form>
        </ModalShell>
      )}

      {/* MODAL: XÁC NHẬN XOÁ TAI NẠN */}
      {accidentToDelete && (
        <ModalShell title="Xoá Sự Vụ Tai Nạn?" onClose={() => setAccidentToDelete(null)}>
          <p className="text-xs leading-relaxed">
            Sự vụ <strong className="font-mono">#TN-{accidentToDelete.accidentId}</strong> của hợp đồng{' '}
            <strong className="font-mono">{accidentToDelete.contractCode}</strong> sẽ bị xoá và không thể khôi phục.
          </p>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setAccidentToDelete(null)}
              className={`flex-1 h-10 rounded-xl font-bold ${COLORS.BTN_NEUTRAL}`}
            >
              Giữ lại
            </button>
            <button
              type="button"
              onClick={handleDeleteAccident}
              disabled={isMutating}
              className="flex-1 h-10 rounded-xl font-bold bg-rose-700 text-white hover:bg-rose-800 disabled:opacity-50"
            >
              {isMutating ? 'Đang xoá...' : 'Xoá sự vụ'}
            </button>
          </div>
        </ModalShell>
      )}

      {/* MODAL: THANH TOÁN */}
      {isPaymentModalOpen && (
        <ModalShell title="Thanh Toán Phí Bảo Hiểm" onClose={() => setIsPaymentModalOpen(false)}>
          <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold mb-1">hợp đồng cần thanh toán *</label>
              <select
                required
                value={paymentContractId}
                onChange={(e) => setPaymentContractId(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
              >
                {payableContracts.map((c) => (
                  <option key={c.contractId} value={c.contractId}>
                    {c.contractCode} - {c.plateNumber}
                  </option>
                ))}
              </select>
            </div>
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${COLORS.SURFACE_SUBTLE}`}>
              <span>số tiền thanh toán:</span>
              <span className={`text-base font-black font-mono ${COLORS.TEXT_PRIMARY}`}>
                {formatVND(selectedPayable?.premiumAmount)}
              </span>
            </div>
            <div>
              <label className="block font-bold mb-1">phương thức *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as OnlinePaymentMethod)}
                className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
              >
                {ONLINE_PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isMutating || !selectedPayable}
              className={`w-full h-10 rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 ${COLORS.BTN_PRIMARY}`}
            >
              {isMutating ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </button>
          </form>
        </ModalShell>
      )}

      {/* MODAL: HUỶ HỢP ĐỒNG */}
      {contractToCancel && (
        <ModalShell title="Huỷ Yêu Cầu Hợp Đồng" onClose={() => setContractToCancel(null)}>
          <form onSubmit={handleCancelContractSubmit} className="space-y-3.5 text-xs">
            <p className="leading-relaxed">
              Hợp đồng <strong className="font-mono">{contractToCancel.contractCode}</strong> (
              {contractToCancel.plateNumber}) sẽ chuyển sang trạng thái đã huỷ.
            </p>
            <div>
              <label className="block font-bold mb-1">lý do huỷ *</label>
              <textarea
                rows={3}
                required
                maxLength={255}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="VD: Nhập sai thông tin xe, đổi nhà cung cấp..."
                className={`w-full p-3 rounded-xl border ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setContractToCancel(null)}
                className={`flex-1 h-10 rounded-xl font-bold ${COLORS.BTN_NEUTRAL}`}
              >
                Giữ hợp đồng
              </button>
              <button
                type="submit"
                disabled={isMutating || !cancelReason.trim()}
                className="flex-1 h-10 rounded-xl font-bold bg-rose-700 text-white hover:bg-rose-800 disabled:opacity-50"
              >
                {isMutating ? 'Đang huỷ...' : 'Huỷ hợp đồng'}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}