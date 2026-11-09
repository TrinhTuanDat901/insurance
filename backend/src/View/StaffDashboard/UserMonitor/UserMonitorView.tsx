// File: src/View/StaffDashboard/UserMonitor/UserMonitorView.tsx
import React, { useState, useMemo } from 'react';
import { Search, Plus, FolderOpen, X, RefreshCw } from 'lucide-react';
import StatusBadge from '../../shared/StatusBadge';
import { userApi } from '../../../Store/userApi';
import { UserResponse } from '../../../types';
import { COLORS } from '../../../Store/colors';

interface UserMonitorViewProps {
  customers: UserResponse[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onRecordAudit: (action: string, entityType: string, entityId: string, transition: string, note: string) => void;
  onShowToast: (message: string, type?: 'success' | 'warning') => void;
}

export default function UserMonitorView({
  customers,
  isLoading,
  onRefresh,
  onRecordAudit,
  onShowToast,
}: UserMonitorViewProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<UserResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerFormModal, setCustomerFormModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data: {
      userId?: number;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
    };
  }>({
    open: false,
    mode: 'create',
    data: { firstName: '', lastName: '', email: '', phone: '', password: 'BikeAid@2026' },
  });
  const [formError, setFormError] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = customerSearch.toLowerCase().trim();
      if (!q) return true;
      const code = `kh-2026-${String(c.userId).padStart(3, '0')}`;
      return (
        (c.fullName || '').toLowerCase().includes(q) ||
        code.includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q)
      );
    });
  }, [customers, customerSearch]);

  const handleViewDetail = async (userId: number) => {
    try {
      const detail = await userApi.getUserById(userId);
      setSelectedCustomerDetail(detail);
    } catch (err: any) {
      onShowToast(err.message || 'Không thể tải chi tiết khách hàng.', 'warning');
    }
  };

  const openCreateModal = () => {
    setFormError('');
    setCustomerFormModal({
      open: true,
      mode: 'create',
      data: { firstName: '', lastName: '', email: '', phone: '', password: 'BikeAid@2026' },
    });
  };

  const openEditModal = (cust: UserResponse) => {
    setFormError('');
    setCustomerFormModal({
      open: true,
      mode: 'edit',
      data: {
        userId: cust.userId,
        firstName: cust.firstName?.trim() || '',
        lastName: cust.lastName?.trim() || '',
        email: cust.email || '',
        phone: cust.phone || '',
        password: '',
      },
    });
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const { mode, data } = customerFormModal;

    if (!data.lastName.trim() || !data.firstName.trim()) {
      setFormError('Vui lòng nhập đầy đủ Họ và Tên khách hàng.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
      setFormError('Địa chỉ email không hợp lệ.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const created = await userApi.register({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          password: data.password || 'BikeAid@2026',
          phone: data.phone.trim(),
        });
        const code = `KH-2026-${String(created.userId).padStart(3, '0')}`;
        onRecordAudit(
          'CREATE_CUSTOMER',
          'User',
          code,
          'NONE → ACTIVE',
          `Tạo mới khách hàng ${created.fullName?.trim()} (${created.email})`
        );
        onShowToast(`Đã tạo khách hàng mới: ${created.fullName?.trim()}`);
      } else if (data.userId) {
        const updated = await userApi.updateUser(data.userId, {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
        });
        const code = `KH-2026-${String(data.userId).padStart(3, '0')}`;
        onRecordAudit(
          'UPDATE_CUSTOMER',
          'User',
          code,
          'ACTIVE → ACTIVE',
          `Cập nhật thông tin khách hàng ${updated.fullName?.trim()}`
        );
        onShowToast(`Đã cập nhật khách hàng ${code}.`);
      }

      setCustomerFormModal((prev) => ({ ...prev, open: false }));
      await onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Thao tác lưu khách hàng thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (cust: UserResponse) => {
    if (!window.confirm(`Xác nhận xóa tài khoản khách hàng ${cust.fullName?.trim()} (${cust.email})?`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await userApi.deleteUser(cust.userId);
      const code = `KH-2026-${String(cust.userId).padStart(3, '0')}`;
      onRecordAudit(
        'DELETE_CUSTOMER',
        'User',
        code,
        'ACTIVE → DELETED',
        `Xóa tài khoản khách hàng ${cust.fullName?.trim()}`
      );
      onShowToast(`Đã xóa khách hàng ${code}.`, 'warning');
      await onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Không thể xóa khách hàng (đang có hợp đồng liên kết).', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-3xl border shadow-sm p-6 space-y-5 ${COLORS.SURFACE_WHITE} ${COLORS.TEXT_MAIN}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
        <div>
          <h2 className={`text-lg font-extrabold inline-block pb-1 ${COLORS.SECTION_TITLE_UNDERLINE}`}>
            Danh sách hồ sơ khách hàng
          </h2>
          <p className={`text-xs mt-1 ${COLORS.TEXT_MAIN}`}>
            Dữ liệu đồng bộ trực tiếp từ bảng users trên SQL Server qua REST API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${COLORS.BTN_OUTLINE}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? `animate-spin ${COLORS.TEXT_PRIMARY}` : ''}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={openCreateModal}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition ${COLORS.BTN_PRIMARY}`}
          >
            <Plus className="w-4 h-4" />
            Thêm khách hàng mới
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Tìm theo Mã KH, Họ tên, SĐT hoặc Email..."
            className={`w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border focus:outline-none ${COLORS.SURFACE_INPUT_STANDARD}`}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={`py-14 text-center rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
          <RefreshCw className={`w-7 h-7 animate-spin mx-auto mb-2 ${COLORS.TEXT_PRIMARY}`} />
          <p className="text-xs font-bold">Đang tải danh sách khách hàng từ cơ sở dữ liệu...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className={`py-14 text-center rounded-2xl border border-dashed border-neutral-300 ${COLORS.SURFACE_SUBTLE}`}>
          <FolderOpen className="w-8 h-8 text-black/40 mx-auto mb-2" />
          <p className="text-xs font-bold">Không tìm thấy khách hàng nào trong hệ thống</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-bold uppercase ${COLORS.SURFACE_SUBTLE}`}>
                <th className="py-3 px-4">mã kh</th>
                <th className="py-3 px-4">họ và tên</th>
                <th className="py-3 px-4">email</th>
                <th className="py-3 px-4">số điện thoại</th>
                <th className="py-3 px-4">vai trò</th>
                <th className="py-3 px-4">trạng thái</th>
                <th className="py-3 px-4 text-right">thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredCustomers.map((cust) => {
                const customerCode = `KH-2026-${String(cust.userId).padStart(3, '0')}`;
                const roleNames = cust.roles?.map((r) => r.roleName).join(', ') || 'USER';
                return (
                  <tr key={cust.userId} className="hover:bg-neutral-50 transition">
                    <td className={`py-3.5 px-4 font-mono font-bold ${COLORS.TEXT_PRIMARY}`}>{customerCode}</td>
                    <td className="py-3.5 px-4 font-bold">{cust.fullName?.trim()}</td>
                    <td className="py-3.5 px-4">{cust.email}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">{cust.phone || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 font-mono font-bold text-[11px]">
                        {roleNames}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status="ACTIVE" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewDetail(cust.userId)}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs ${COLORS.BTN_OUTLINE}`}
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => openEditModal(cust)}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs ${COLORS.BTN_NEUTRAL}`}
                        >
                          Sửa
                        </button>
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleDeleteCustomer(cust)}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs ${COLORS.ACTION_DANGER_SOFT}`}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomerDetail && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-lg w-full border shadow-2xl overflow-hidden space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-black/60">chi tiết khách hàng</span>
                <h3 className={`text-lg font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                  {selectedCustomerDetail.fullName?.trim()} (ID: #{selectedCustomerDetail.userId})
                </h3>
              </div>
              <button onClick={() => setSelectedCustomerDetail(null)} className="p-2 text-black/60 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
                <span className="text-[10px] text-black/60 block">họ (last name):</span>
                <span className="font-bold">{selectedCustomerDetail.lastName?.trim()}</span>
              </div>
              <div className={`p-3 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
                <span className="text-[10px] text-black/60 block">tên (first name):</span>
                <span className="font-bold">{selectedCustomerDetail.firstName?.trim()}</span>
              </div>
              <div className={`p-3 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
                <span className="text-[10px] text-black/60 block">email:</span>
                <span className="font-bold">{selectedCustomerDetail.email}</span>
              </div>
              <div className={`p-3 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
                <span className="text-[10px] text-black/60 block">số điện thoại:</span>
                <span className="font-bold">{selectedCustomerDetail.phone || 'Chưa cập nhật'}</span>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className={`px-4 py-2 rounded-xl font-bold text-xs ${COLORS.BTN_NEUTRAL}`}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {customerFormModal.open && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP}`}>
          <div className={`rounded-3xl max-w-lg w-full border shadow-2xl p-6 sm:p-8 space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                {customerFormModal.mode === 'create' ? 'Thêm Khách Hàng Mới' : 'Cập Nhật Hồ Sơ Khách Hàng'}
              </h3>
              <button onClick={() => setCustomerFormModal((prev) => ({ ...prev, open: false }))}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className={`p-3 rounded-xl text-xs font-bold ${COLORS.ACTION_DANGER_SOFT}`}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">họ (last name) *</label>
                  <input
                    type="text"
                    required
                    value={customerFormModal.data.lastName}
                    onChange={(e) =>
                      setCustomerFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, lastName: e.target.value },
                      }))
                    }
                    className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">tên (first name) *</label>
                  <input
                    type="text"
                    required
                    value={customerFormModal.data.firstName}
                    onChange={(e) =>
                      setCustomerFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, firstName: e.target.value },
                      }))
                    }
                    className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">email *</label>
                  <input
                    type="email"
                    required
                    value={customerFormModal.data.email}
                    onChange={(e) =>
                      setCustomerFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, email: e.target.value },
                      }))
                    }
                    className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={customerFormModal.data.phone}
                    onChange={(e) =>
                      setCustomerFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, phone: e.target.value },
                      }))
                    }
                    className={`w-full h-10 px-3 rounded-xl border font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>
              </div>

              {customerFormModal.mode === 'create' && (
                <div>
                  <label className="block font-bold mb-1">mật khẩu khởi tạo *</label>
                  <input
                    type="text"
                    required
                    value={customerFormModal.data.password}
                    onChange={(e) =>
                      setCustomerFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, password: e.target.value },
                      }))
                    }
                    className={`w-full h-10 px-3 rounded-xl border font-mono font-bold ${COLORS.SURFACE_INPUT_STANDARD}`}
                  />
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerFormModal((prev) => ({ ...prev, open: false }))}
                  className={`px-4 py-2.5 rounded-xl font-bold ${COLORS.BTN_NEUTRAL}`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-xl font-bold shadow ${COLORS.BTN_PRIMARY}`}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}