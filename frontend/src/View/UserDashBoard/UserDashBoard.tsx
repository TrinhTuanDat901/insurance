// File: src/View/UserDashBoard/UserDashBoard.tsx
import React, { useState } from 'react';
import {
  Search,
  Plus,
  QrCode,
  Download,
  Share2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Car,
  CreditCard,
  History,
  Camera,
  MapPin,
  Calendar,
  X,
  Send,
  Eye,
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import {
  UserAccount,
  InsurancePolicy,
  CompensationClaim,
  IncidentRecord,
  PaymentInvoice,
  VehicleItem,
} from '../../types';
import { COLORS } from '../../Store/colors';

interface UserDashBoardProps {
  user: UserAccount;
  policies: InsurancePolicy[];
  claims: CompensationClaim[];
  incidents: IncidentRecord[];
  invoices: PaymentInvoice[];
  vehicles: VehicleItem[];
  onAddNewClaim: (newClaim: CompensationClaim) => void;
  onAddNewVehicle: (newVehicle: VehicleItem) => void;
  onRenewPolicy: (policyId: string) => void;
  onBackToLanding: () => void;
  onNavigateStaff?: () => void;
}

export default function UserDashBoard({
  user,
  policies,
  claims,
  incidents,
  invoices,
  vehicles,
  onAddNewClaim,
  onAddNewVehicle,
  onRenewPolicy,
  onBackToLanding,
  onNavigateStaff,
}: UserDashBoardProps) {
  const [activeTab, setActiveTab] = useState<'cards' | 'claims' | 'incidents' | 'invoices' | 'vehicles'>('cards');
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [selectedPolicyForModal, setSelectedPolicyForModal] = useState<InsurancePolicy | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedVehicleForClaim, setSelectedVehicleForClaim] = useState(vehicles[0]?.plateNumber || '');
  const [incidentDate, setIncidentDate] = useState('2026-11-08T08:30');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentType, setIncidentType] = useState<CompensationClaim['incidentType']>('COLLISION');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [estimatedDamage, setEstimatedDamage] = useState('3500000');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccount, setBankAccount] = useState('0011002233445');
  const [bankOwner] = useState(user.fullName.toUpperCase());

  const filteredPolicies = policies.filter((p) => {
    const q = cardSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.cardNumber.toLowerCase().includes(q) ||
      p.plateNumber.toLowerCase().includes(q) ||
      p.vehicleModel.toLowerCase().includes(q)
    );
  });

  const handleCreateClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentLocation.trim() || !incidentDescription.trim()) return;
    const matchedPolicy = policies.find((p) => p.plateNumber === selectedVehicleForClaim) || policies[0];
    onAddNewClaim({
      id: `clm_${Date.now()}`,
      claimCode: `BT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      policyCardNumber: matchedPolicy ? matchedPolicy.cardNumber : 'IC-2026-88901',
      plateNumber: selectedVehicleForClaim,
      incidentDate: incidentDate.replace('T', ' '),
      incidentLocation: incidentLocation.trim(),
      incidentType,
      description: incidentDescription.trim(),
      estimatedDamage: Number(estimatedDamage) || 3000000,
      status: 'UNDER_REVIEW',
      statusLabel: 'Đang thẩm định trực tuyến',
      bankName,
      bankAccount,
      bankOwner: bankOwner.trim(),
      submittedAt: new Date().toLocaleString('vi-VN'),
    });
    setIsClaimModalOpen(false);
    setActiveTab('claims');
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${COLORS.TEXT_MAIN}`}>
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${COLORS.SURFACE_WHITE}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm shrink-0 ${COLORS.BTN_PRIMARY}`}>
              {user.fullName.split(' ').pop()?.charAt(0) || 'U'}
            </div>
            <div className="space-y-1">
              <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${COLORS.TEXT_PRIMARY}`}>
                {user.fullName}
              </h1>
              <p className="text-xs flex flex-wrap items-center gap-2.5">
                <span>email: <strong>{user.email}</strong></span>
                <span>·</span>
                <span>sđt: <strong>{user.phone}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user.role === 'STAFF' && onNavigateStaff && (
              <button
                onClick={onNavigateStaff}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${COLORS.BTN_DARK}`}
              >
                Nghiệp vụ & Hồ sơ Staff
              </button>
            )}
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${COLORS.BTN_WARNING_CTA}`}
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Khai báo tai nạn & Bồi thường</span>
            </button>
            <button
              onClick={onBackToLanding}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${COLORS.BTN_NEUTRAL}`}
            >
              Về Trang chủ
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 text-xs font-bold">
        {[
          { id: 'cards' as const, label: `Thẻ bảo hiểm (${policies.length})`, icon: QrCode },
          { id: 'claims' as const, label: `Hồ sơ bồi thường (${claims.length})`, icon: FileText },
          { id: 'incidents' as const, label: `Lịch sử cứu hộ (${incidents.length})`, icon: History },
          { id: 'invoices' as const, label: `Hóa đơn (${invoices.length})`, icon: CreditCard },
          { id: 'vehicles' as const, label: `Phương tiện (${vehicles.length})`, icon: Car },
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
      </div>

      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPolicies.map((pol) => (
            <div key={pol.id} className={`rounded-3xl p-5 border shadow-sm space-y-4 ${COLORS.SURFACE_WHITE}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold">{pol.vehicleBrand} {pol.vehicleModel}</h3>
                  <p className="text-xs font-bold font-mono">BKS: {pol.plateNumber}</p>
                </div>
                <StatusBadge status={pol.status} customLabel={pol.statusLabel} />
              </div>
              <div className={`p-4 rounded-2xl border space-y-2 text-xs ${COLORS.SURFACE_SUBTLE}`}>
                <div className="flex justify-between">
                  <span>mã thẻ:</span>
                  <strong className="font-mono">{pol.cardNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span>thời hạn:</span>
                  <strong>{pol.effectiveFrom} – {pol.effectiveTo}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isClaimModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border relative space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <button onClick={() => setIsClaimModalOpen(false)} className="absolute top-5 right-5 p-2">
              <X className="w-5 h-5" />
            </button>
            <h3 className={`text-xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>Nộp Hồ Sơ Yêu Cầu Bồi Thường</h3>
            <form onSubmit={handleCreateClaimSubmit} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder="Địa điểm xảy ra sự cố..."
                className={`w-full h-10 px-3.5 rounded-xl border ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
              <textarea
                rows={3}
                required
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="Mô tả chi tiết..."
                className={`w-full p-3 rounded-xl border ${COLORS.SURFACE_INPUT_STANDARD}`}
              />
              <button type="submit" className={`w-full h-11 rounded-xl font-bold ${COLORS.BTN_PRIMARY}`}>
                Gửi yêu cầu bồi thường
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}