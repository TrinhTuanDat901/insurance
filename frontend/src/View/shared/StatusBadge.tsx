// File: motobike_insurance/frontend/src/View/shared/StatusBadge.tsx
import React from 'react';
import { COLORS } from '../../Store/colors';

export type GeneralStatus =
  | 'ACTIVE'
  | 'VALID'
  | 'APPROVED'
  | 'RESOLVED'
  | 'SUCCESS'
  | 'PAID'
  | 'RENEWED'
  | 'PENDING'
  | 'REPORTED'
  | 'OPEN'
  | 'PENDING_VERIFICATION'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INSPECTION'
  | 'NEED_MORE_INFORMATION'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'REVOKED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'LOCKED'
  | string;

interface StatusBadgeProps {
  status: GeneralStatus;
  customLabel?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({
  status,
  customLabel,
  size = 'sm',
}: StatusBadgeProps) {
  const normalized = (status || '').toUpperCase().trim();

  const isEmerald =
    ['ACTIVE', 'VALID', 'APPROVED', 'RESOLVED', 'SUCCESS', 'PAID', 'RENEWED'].includes(normalized) ||
    normalized.includes('HIỆU LỰC') ||
    normalized.includes('HỢP LỆ') ||
    normalized.includes('ĐÃ DUYỆT') ||
    normalized.includes('ĐÃ GIẢI QUYẾT') ||
    normalized.includes('ĐÃ THANH TOÁN') ||
    normalized.includes('ĐÃ CHI TRẢ');

  const isAmber =
    ['PENDING', 'REPORTED', 'OPEN', 'PENDING_VERIFICATION', 'SUBMITTED', 'EXPIRING_SOON'].includes(normalized) ||
    normalized.includes('CHỜ') ||
    normalized.includes('SẮP HẾT HẠN') ||
    normalized.includes('CHƯA GIẢI QUYẾT');

  const isBlue =
    ['UNDER_REVIEW', 'INSPECTION'].includes(normalized) ||
    normalized.includes('THẨM ĐỊNH') ||
    normalized.includes('GIÁM ĐỊNH') ||
    normalized.includes('ĐANG XỬ LÝ');

  const isPurple =
    ['NEED_MORE_INFORMATION'].includes(normalized) ||
    normalized.includes('BỔ SUNG');

  const isRose =
    ['EXPIRED', 'REVOKED', 'CANCELLED', 'REJECTED', 'LOCKED'].includes(normalized) ||
    normalized.includes('HẾT HẠN') ||
    normalized.includes('THU HỒI') ||
    normalized.includes('ĐÃ HỦY') ||
    normalized.includes('TỪ CHỐI') ||
    normalized.includes('ĐÃ KHÓA');

  let styleClasses: string = COLORS.BADGE.NEUTRAL.CONTAINER;
  let dotClass: string = COLORS.BADGE.NEUTRAL.DOT;
  let defaultLabel = customLabel || status;

  if (isEmerald) {
    styleClasses = COLORS.BADGE.EMERALD.CONTAINER;
    dotClass = COLORS.BADGE.EMERALD.DOT;
    if (!customLabel) {
      if (normalized === 'ACTIVE') defaultLabel = 'Đang có hiệu lực';
      else if (normalized === 'VALID') defaultLabel = 'Thẻ hợp lệ';
      else if (normalized === 'APPROVED') defaultLabel = 'Đã phê duyệt';
      else if (normalized === 'RESOLVED') defaultLabel = 'Đã giải quyết';
      else if (normalized === 'PAID') defaultLabel = 'Đã thanh toán';
      else if (normalized === 'RENEWED') defaultLabel = 'Đã gia hạn';
      else if (normalized === 'SUCCESS') defaultLabel = 'Thành công';
    }
  } else if (isRose) {
    styleClasses = COLORS.BADGE.ROSE.CONTAINER;
    dotClass = COLORS.BADGE.ROSE.DOT;
    if (!customLabel) {
      if (normalized === 'EXPIRED') defaultLabel = 'Đã hết hạn';
      else if (normalized === 'REVOKED') defaultLabel = 'Đã thu hồi';
      else if (normalized === 'CANCELLED') defaultLabel = 'Đã hủy hợp đồng';
      else if (normalized === 'REJECTED') defaultLabel = 'Từ chối bồi thường';
      else if (normalized === 'LOCKED') defaultLabel = 'Tài khoản đã khóa';
    }
  } else if (isAmber) {
    styleClasses = COLORS.BADGE.AMBER.CONTAINER;
    dotClass = COLORS.BADGE.AMBER.DOT;
    if (!customLabel) {
      if (normalized === 'PENDING') defaultLabel = 'Chờ xử lý';
      else if (normalized === 'REPORTED') defaultLabel = 'Chờ giải quyết';
      else if (normalized === 'OPEN') defaultLabel = 'Chưa giải quyết';
      else if (normalized === 'EXPIRING_SOON') defaultLabel = 'Sắp hết hạn';
      else if (normalized === 'PENDING_VERIFICATION') defaultLabel = 'Chờ xác minh';
    }
  } else if (isBlue) {
    styleClasses = COLORS.BADGE.BLUE.CONTAINER;
    dotClass = COLORS.BADGE.BLUE.DOT;
    if (!customLabel) {
      if (normalized === 'UNDER_REVIEW') defaultLabel = 'Đang thẩm định';
      else if (normalized === 'INSPECTION') defaultLabel = 'Đang giám định';
    }
  } else if (isPurple) {
    styleClasses = COLORS.BADGE.PURPLE.CONTAINER;
    dotClass = COLORS.BADGE.PURPLE.DOT;
    if (!customLabel) {
      defaultLabel = 'Cần bổ sung thông tin';
    }
  }

  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border transition-colors ${padding} ${styleClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} shrink-0`} />
      <span className="whitespace-nowrap">{customLabel || defaultLabel}</span>
    </span>
  );
}