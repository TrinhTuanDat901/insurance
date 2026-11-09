// File: src/types/index.ts
export type UserRole = 'CUSTOMER' | 'STAFF';

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  citizenId?: string;
  address?: string;
  membershipTier?: 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface ApiResponse<T> {
  code?: number;
  message?: string;
  result?: T;
}

export interface BackendRole {
  roleName: string;
  roleDescription?: string;
}

export interface UserResponse {
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  roles: BackendRole[];
  avatarPath: string | null;
}

export interface ContractResponse {
  contractId: number;
  contractCode: string;
  userId: number;
  customerFullName: string;
  customerPhone: string | null;
  vehicleId: number;
  vehicleName: string;
  plateNumber: string;
  packageId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'RENEWED';
  createdAt: string;
  approvedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  cardNumber: string | null;
  qrCodeData: string | null;
}

export interface CompensationResponse {
  compensationId: number;
  claimCode: string;
  contractId: number;
  contractCode: string;
  accidentId: number | null;
  userId: number;
  customerFullName: string;
  customerPhone: string | null;
  plateNumber: string;
  requestDate: string;
  requestedAmount: number;
  approvedAmount: number | null;
  description: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  resolvedByStaffId: number | null;
  resolvedAt: string | null;
}

export interface AuditLogEntry {
  logId: string;
  timestamp: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  transition: string;
  note: string;
}

export type InsuranceStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED';

export interface InsurancePolicy {
  id: string;
  cardNumber: string;
  contractNumber: string;
  holderName: string;
  holderPhone: string;
  plateNumber: string;
  vehicleModel: string;
  vehicleBrand: string;
  chassisNumber: string;
  engineNumber: string;
  packageType: 'COMPULSORY' | 'COMPREHENSIVE' | 'RIDER_ACCIDENT' | 'DIAMOND_ALL_IN_ONE';
  packageName: string;
  coverageAmount: string;
  premiumPaid: number;
  effectiveFrom: string;
  effectiveTo: string;
  status: InsuranceStatus;
  statusLabel: string;
  issuedAt: string;
  autoRenew: boolean;
}

export type ClaimStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'INSPECTION' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface CompensationClaim {
  id: string;
  claimCode: string;
  policyCardNumber: string;
  plateNumber: string;
  incidentDate: string;
  incidentLocation: string;
  incidentType: 'COLLISION' | 'FALL' | 'FIRE' | 'FLOOD' | 'THEFT' | 'THIRD_PARTY_DAMAGE';
  description: string;
  estimatedDamage: number;
  approvedAmount?: number;
  status: ClaimStatus;
  statusLabel: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  submittedAt: string;
  handledByStaff?: string;
  notes?: string;
  payoutDate?: string;
}

export interface IncidentRecord {
  id: string;
  date: string;
  plateNumber: string;
  title: string;
  location: string;
  severity: 'LIGHT' | 'MODERATE' | 'SEVERE';
  rescueDispatched: boolean;
  rescueDetails?: string;
  settlementStatus: 'COMPLETED' | 'PENDING' | 'CLOSED';
}

export interface PaymentInvoice {
  id: string;
  invoiceCode: string;
  contractNumber: string;
  packageName: string;
  plateNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  status: 'PAID' | 'REFUNDED';
}

export interface VehicleItem {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  engineCapacity: string;
  manufactureYear: number;
  chassisNumber: string;
  engineNumber: string;
  hasActiveInsurance: boolean;
  activeCardNumber?: string;
}