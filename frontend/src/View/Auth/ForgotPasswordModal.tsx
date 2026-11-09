// File: motobike_insurance/frontend/src/View/Auth/ForgotPasswordModal.tsx
import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { COLORS } from '../../Store/colors';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setError('Vui lòng nhập đúng định dạng email.');
      return;
    }

    setError('');
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
    }, 500);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP} ${COLORS.TEXT_MAIN}`}>
      <div className={`rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border relative ${COLORS.SURFACE_WHITE}`}>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-black/50 hover:text-black hover:bg-neutral-100 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className={`w-10 h-10 mx-auto ${COLORS.TEXT_PRIMARY}`} />
            <h3 className={`text-xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>
              Đã gửi liên kết khôi phục
            </h3>
            <p className="text-xs text-black/80 leading-relaxed">
              Nếu địa chỉ <strong>{email}</strong> tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hộp thư của bạn.
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-sm ${COLORS.BTN_PRIMARY}`}
            >
              Quay lại màn hình Đăng nhập
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <span className="text-[11px] font-bold text-black uppercase tracking-wider block">
                Khôi phục quyền truy cập
              </span>
              <h3 className={`text-xl font-extrabold mt-1 ${COLORS.TEXT_PRIMARY}`}>
                Quên Mật Khẩu Đăng Nhập?
              </h3>
              <p className="text-xs text-black/75 mt-1">
                Nhập địa chỉ email đã đăng ký để nhận mã OTP hoặc đường dẫn thiết lập mật khẩu mới.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="nhập email của bạn"
                  className={`w-full h-11 px-4 rounded-xl text-xs font-medium focus:outline-none ${COLORS.SURFACE_INPUT_AUTH}`}
                />
                {error && (
                  <p className="text-[11px] text-black font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSending}
                className={`w-full h-11 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${COLORS.BTN_PRIMARY}`}
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi hướng dẫn đặt lại mật khẩu</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}