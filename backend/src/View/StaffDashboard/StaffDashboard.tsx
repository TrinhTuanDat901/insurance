// File: src/View/StaffDashboard/StaffDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  ChevronRight,
  Menu,
  X,
  ArrowUpRight,
  FileWarning,
  ClipboardList,
  Home,
  Wrench,
  Settings,
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import UserMonitorView from './UserMonitor/UserMonitorView';
import StaffContractsView from './Contracts/StaffContractsView';
import StaffCompensationsView from './Compensations/StaffCompensationsView';
import StaffAccidentsView from './Accidents/StaffAccidentsView';
import StaffPunishmentsView from './Punishments/StaffPunishmentsView';
import StaffHistoryView from './History/StaffHistoryView';
import { userApi } from '../../Store/userApi';
import { contractApi } from '../../Store/contractApi';
import { compensationApi } from '../../Store/compensationApi';
import { TokenStorage, decodeJwt } from '../../Store/apiClient';
import {
  UserResponse,
  ContractResponse,
  CompensationResponse,
  AuditLogEntry,
} from '../../types';
import { COLORS } from '../../Store/colors';

const formatVND = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};

interface StaffDashboardProps {
  onBackToLanding: () => void;
  onNavigateProfile?: () => void;
  onLogout?: () => void;
}

export default function StaffDashboard({ onBackToLanding }: StaffDashboardProps) {
  const [activeNav, setActiveNav] = useState<
    'overview' | 'customers' | 'contracts' | 'compensations' | 'accidents_punishments' | 'profile'
  >('overview');
  const [contractSubTab, setContractSubTab] = useState<'requests' | 'list'>('requests');
  const [accidentPunishSubTab, setAccidentPunishSubTab] = useState<'accidents' | 'punishments'>('accidents');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const [customers, setCustomers] = useState<UserResponse[]>([]);
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [compensations, setCompensations] = useState<CompensationResponse[]>([]);
  const [accidents] = useState<any[]>([]);
  const [punishments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [isLoadingCompensations, setIsLoadingCompensations] = useState(false);

  const token = TokenStorage.getToken();
  const decoded = token ? decodeJwt(token) : null;
  const currentStaffEmail = decoded?.sub || 'staff@example.com';

  const matchedStaffUser = customers.find(
    (u) => u.email?.toLowerCase() === currentStaffEmail.toLowerCase()
  );

  const currentStaffProfile = {
    staffId: matchedStaffUser ? `NV-2026-0${matchedStaffUser.userId}` : 'NV-2026-01',
    fullName: matchedStaffUser?.fullName?.trim() || 'Chuyên viên Nghiệp vụ',
    email: currentStaffEmail,
    phone: matchedStaffUser?.phone || '0903 128 456',
    role: 'STAFF',
    roleLabel: 'Chuyên viên Nghiệp vụ Bảo hiểm',
    department: 'Phòng Nghiệp vụ & Bồi thường Xe máy - Khu vực Hà Nội',
  };

  const showToast = useCallback((message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  }, []);

  const recordAudit = useCallback(
    (action: string, entityType: string, entityId: string, transition: string, note: string) => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      setAuditLogs((prev) => [
        {
          logId: `LOG-${1001 + prev.length}`,
          timestamp,
          actorId: `${currentStaffProfile.staffId} (${currentStaffProfile.fullName})`,
          action,
          entityType,
          entityId,
          transition,
          note,
        },
        ...prev,
      ]);
    },
    [currentStaffProfile.staffId, currentStaffProfile.fullName]
  );

  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await userApi.getAllUsers();
      setCustomers(data);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải danh sách khách hàng.', 'warning');
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [showToast]);

  const fetchContracts = useCallback(async () => {
    setIsLoadingContracts(true);
    try {
      const data = await contractApi.viewAllContracts();
      setContracts(data);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải danh sách hợp đồng.', 'warning');
    } finally {
      setIsLoadingContracts(false);
    }
  }, [showToast]);

  const fetchCompensations = useCallback(
    async (statusFilter?: string) => {
      setIsLoadingCompensations(true);
      try {
        const data = await compensationApi.viewAllCompensations(statusFilter);
        setCompensations(data);
      } catch (err: any) {
        showToast(err.message || 'Không thể tải danh sách bồi thường.', 'warning');
      } finally {
        setIsLoadingCompensations(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchCustomers();
    fetchContracts();
    fetchCompensations();
  }, [fetchCustomers, fetchContracts, fetchCompensations]);

  const pendingContractRequestCount = contracts.filter((c) => c.status === 'PENDING').length;
  const actionableClaimsCount = compensations.filter((c) => c.status === 'PENDING').length;

  const NAV_ITEMS = [
    { id: 'overview' as const, label: 'Tổng quan nghiệp vụ', icon: LayoutDashboard, badge: null },
    { id: 'customers' as const, label: 'Quản lý khách hàng', icon: Users, badge: customers.length },
    {
      id: 'contracts' as const,
      label: 'Quản lý hợp đồng',
      icon: FileText,
      badge: pendingContractRequestCount > 0 ? pendingContractRequestCount : null,
    },
    {
      id: 'compensations' as const,
      label: 'Giải quyết bồi thường',
      icon: ShieldAlert,
      badge: actionableClaimsCount > 0 ? actionableClaimsCount : null,
    },
    { id: 'accidents_punishments' as const, label: 'Tai nạn & Xử phạt', icon: AlertTriangle, badge: null },
    { id: 'profile' as const, label: 'Hồ sơ chuyên viên', icon: UserCheck, badge: null },
  ];

  const currentNavObj = NAV_ITEMS.find((n) => n.id === activeNav) || NAV_ITEMS[0];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans ${COLORS.PAGE_WRAPPER}`}>
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              toast.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-700'
                : `${COLORS.BTN_PRIMARY} border-blue-400`
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <aside className={`hidden md:flex md:w-64 lg:w-72 flex-col justify-between shrink-0 shadow-2xl select-none border-r ${COLORS.STAFF_SIDEBAR}`}>
        <div>
          <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md font-black text-xl shrink-0 relative overflow-hidden ${COLORS.BTN_PRIMARY}`}>
              <Settings className="w-5 h-5 absolute -bottom-1 -left-1 opacity-70 animate-[spin_16s_linear_infinite]" />
              <Wrench className="w-5 h-5 relative z-10 rotate-45 transform" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight leading-none text-white">BIKE AID</div>
              <div className="text-[11px] text-neutral-400 font-semibold mt-1">Cổng Nghiệp vụ Chuyên viên</div>
            </div>
          </div>

          <div className="px-6 pt-5 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Phân hệ nghiệp vụ
          </div>

          <nav className="space-y-1.5 pr-3">
            {NAV_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between py-3 pl-6 pr-4 rounded-r-2xl text-xs font-bold transition-all ${
                    isActive
                      ? `${COLORS.BTN_PRIMARY} shadow-lg font-black`
                      : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`px-2 py-0.5 text-[11px] rounded-full font-black ${
                        isActive ? `bg-white ${COLORS.TEXT_PRIMARY}` : 'bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 m-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-sm shadow shrink-0 ${COLORS.BTN_PRIMARY}`}>
              ST
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentStaffProfile.fullName}</p>
              <p className="text-[10px] text-neutral-400 truncate">
                {currentStaffProfile.staffId} · {currentStaffProfile.role}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-800 grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => setActiveNav('profile')}
              className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                activeNav === 'profile' ? COLORS.BTN_PRIMARY : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Hồ sơ</span>
            </button>
            <button
              onClick={onBackToLanding}
              className="py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold transition flex items-center justify-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`border-b px-4 sm:px-8 py-3.5 sticky top-0 z-30 ${COLORS.SURFACE_WHITE}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl border ${COLORS.BTN_OUTLINE}`}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <span>Hệ thống Bảo hiểm Bike Aid</span>
                  <ChevronRight className="w-3 h-3 text-black/50" />
                  <span className={`${COLORS.TEXT_PRIMARY} font-bold`}>{currentNavObj.label}</span>
                </div>
                <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight mt-0.5 ${COLORS.TEXT_PRIMARY}`}>
                  {currentNavObj.label}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setAuditDrawerOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${COLORS.BTN_OUTLINE}`}
              >
                <ClipboardList className={`w-3.5 h-3.5 ${COLORS.TEXT_PRIMARY}`} />
                <span>Nhật ký ({auditLogs.length})</span>
              </button>
              <button
                onClick={onBackToLanding}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${COLORS.BTN_NEUTRAL}`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trang chủ</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeNav === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div
                  onClick={() => {
                    setContractSubTab('requests');
                    setActiveNav('contracts');
                  }}
                  className={`rounded-3xl p-5 border shadow-sm transition cursor-pointer ${COLORS.SURFACE_WHITE} ${COLORS.BORDER_PRIMARY_HOVER}`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider">yêu cầu hợp đồng chờ duyệt</span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-mono">{pendingContractRequestCount}</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${COLORS.TEXT_PRIMARY}`}>
                      xử lý ngay <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveNav('compensations')}
                  className={`rounded-3xl p-5 border shadow-sm transition cursor-pointer ${COLORS.SURFACE_WHITE} ${COLORS.BORDER_PRIMARY_HOVER}`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider">hồ sơ bồi thường chờ xử lý</span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-mono">{actionableClaimsCount}</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${COLORS.TEXT_PRIMARY}`}>
                      thẩm định <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveNav('customers')}
                  className={`rounded-3xl p-5 border shadow-sm transition cursor-pointer ${COLORS.SURFACE_WHITE} ${COLORS.BORDER_PRIMARY_HOVER}`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider">tổng số tài khoản hệ thống</span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-mono">{customers.length}</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${COLORS.TEXT_PRIMARY}`}>
                      quản lý KH <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setContractSubTab('list');
                    setActiveNav('contracts');
                  }}
                  className={`rounded-3xl p-5 border shadow-sm transition cursor-pointer ${COLORS.SURFACE_WHITE} ${COLORS.BORDER_PRIMARY_HOVER}`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider">tổng số hợp đồng</span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-mono">{contracts.length}</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${COLORS.TEXT_PRIMARY}`}>
                      danh sách HĐ <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`rounded-3xl border shadow-sm p-6 space-y-4 ${COLORS.SURFACE_WHITE}`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-base font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                      Hợp đồng chờ kích hoạt (PENDING)
                    </h2>
                    <button
                      onClick={() => {
                        setContractSubTab('requests');
                        setActiveNav('contracts');
                      }}
                      className={`text-xs font-bold hover:underline flex items-center gap-1 ${COLORS.TEXT_PRIMARY}`}
                    >
                      xem tất cả ({pendingContractRequestCount}) <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {pendingContractRequestCount === 0 ? (
                    <div className={`py-10 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold">Không có hợp đồng nào chờ duyệt</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contracts
                        .filter((c) => c.status === 'PENDING')
                        .slice(0, 4)
                        .map((req) => (
                          <div
                            key={req.contractId}
                            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${COLORS.SURFACE_SUBTLE}`}
                          >
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold">{req.contractCode}</span>
                                <StatusBadge status={req.status} />
                              </div>
                              <p className="font-bold">
                                {req.customerFullName} • <span className={`font-mono ${COLORS.TEXT_PRIMARY}`}>{req.plateNumber}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setContractSubTab('requests');
                                setActiveNav('contracts');
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold ${COLORS.BTN_PRIMARY}`}
                            >
                              Xử lý
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className={`rounded-3xl border shadow-sm p-6 space-y-4 ${COLORS.SURFACE_WHITE}`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-base font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                      Hồ sơ bồi thường chờ xử lý (PENDING)
                    </h2>
                    <button
                      onClick={() => setActiveNav('compensations')}
                      className={`text-xs font-bold hover:underline flex items-center gap-1 ${COLORS.TEXT_PRIMARY}`}
                    >
                      xem tất cả ({compensations.length}) <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {actionableClaimsCount === 0 ? (
                    <div className={`py-10 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold">Tất cả hồ sơ bồi thường đã được giải quyết</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {compensations
                        .filter((c) => c.status === 'PENDING')
                        .slice(0, 4)
                        .map((claim) => (
                          <div
                            key={claim.compensationId}
                            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${COLORS.SURFACE_SUBTLE}`}
                          >
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold">{claim.claimCode}</span>
                                <StatusBadge status={claim.status} />
                              </div>
                              <p className="font-bold">
                                {claim.customerFullName} • {formatVND(claim.requestedAmount)}
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveNav('compensations')}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold ${COLORS.BTN_PRIMARY}`}
                            >
                              Thẩm định
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeNav === 'customers' && (
            <UserMonitorView
              customers={customers}
              isLoading={isLoadingCustomers}
              onRefresh={fetchCustomers}
              onRecordAudit={recordAudit}
              onShowToast={showToast}
            />
          )}

          {activeNav === 'contracts' && (
            <StaffContractsView
              contracts={contracts}
              customers={customers}
              initialSubTab={contractSubTab}
              isLoading={isLoadingContracts}
              onRefresh={fetchContracts}
              onRecordAudit={recordAudit}
              onShowToast={showToast}
            />
          )}

          {activeNav === 'compensations' && (
            <StaffCompensationsView
              compensations={compensations}
              isLoading={isLoadingCompensations}
              onRefresh={fetchCompensations}
              onRecordAudit={recordAudit}
              onShowToast={showToast}
            />
          )}

          {activeNav === 'accidents_punishments' && (
            <div className="space-y-6">
              <div className={`flex flex-wrap items-center gap-2 p-4 rounded-3xl border shadow-sm ${COLORS.SURFACE_WHITE}`}>
                <button
                  onClick={() => setAccidentPunishSubTab('accidents')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                    accidentPunishSubTab === 'accidents' ? `${COLORS.BTN_PRIMARY} shadow-sm` : COLORS.BTN_NEUTRAL
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Hồ sơ Tai nạn giao thông ({accidents.length})</span>
                </button>
                <button
                  onClick={() => setAccidentPunishSubTab('punishments')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                    accidentPunishSubTab === 'punishments' ? `${COLORS.BTN_PRIMARY} shadow-sm` : COLORS.BTN_NEUTRAL
                  }`}
                >
                  <FileWarning className="w-4 h-4" />
                  <span>Biên bản Vi phạm & Xử phạt ({punishments.length})</span>
                </button>
              </div>

              {accidentPunishSubTab === 'accidents' ? (
                <StaffAccidentsView accidents={accidents} />
              ) : (
                <StaffPunishmentsView punishments={punishments} />
              )}
            </div>
          )}

          {activeNav === 'profile' && (
            <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6 ${COLORS.SURFACE_WHITE}`}>
              <div className="flex items-center gap-5 pb-6 border-b border-neutral-100">
                <div className="w-20 h-20 rounded-3xl bg-[#0F172A] text-white font-black text-2xl flex items-center justify-center shadow-lg">
                  ST
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className={`text-2xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                      {currentStaffProfile.fullName}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 text-white">
                      Mã NV: {currentStaffProfile.staffId}
                    </span>
                    <StatusBadge status="ACTIVE" />
                  </div>
                  <p className="text-xs text-black/80 font-medium">
                    {currentStaffProfile.roleLabel} · {currentStaffProfile.department}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {auditDrawerOpen && (
        <div className={`fixed inset-0 z-50 flex justify-end ${COLORS.OVERLAY_BACKDROP}`}>
          <StaffHistoryView logs={auditLogs} onClose={() => setAuditDrawerOpen(false)} />
        </div>
      )}
    </div>
  );
}