import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import { UserAccount } from '../../types';
import { INITIAL_USER } from '../../Store/mockData';
import { authApi, userApi } from '../../Store/apiClient';
import { COLORS } from '../../Store/colors';

interface LoginPageProps {
  initialMode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
  onLoginSuccess: (user: UserAccount) => void;
  onOpenForgot: () => void;
  onBackToLanding: () => void;
}

export default function LoginPage({
  initialMode = 'login',
  onModeChange,
  onLoginSuccess,
  onOpenForgot,
  onBackToLanding
}: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg('');
    if (onModeChange) onModeChange(newMode);
  };

  // Shared / Login state (Khớp với tài khoản Seed trong ApplicationInitConfig.java)
  const [email, setEmail] = useState('staff@example.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // Register additional fields
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();

    if (mode === 'login') {
      if (!trimmedEmail) {
        setErrorMsg('Vui lòng nhập địa chỉ email của bạn.');
        return;
      }
      if (!password) {
        setErrorMsg('Vui lòng nhập mật khẩu đăng nhập.');
        return;
      }

      setIsSubmitting(true);
      try {
        const loggedInUser = await authApi.login(trimmedEmail, password);
        onLoginSuccess(loggedInUser);
      } catch (err: any) {
        setErrorMsg(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Register validation khớp với RegisterRequest.java (@Size(min=5), @PasswordConstraint(min=9))
      if (!lastName.trim()) {
        setErrorMsg('Vui lòng nhập họ (Last name).');
        return;
      }
      if (!firstName.trim()) {
        setErrorMsg('Vui lòng nhập tên (First name).');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        setErrorMsg('Vui lòng nhập định dạng email chính xác.');
        return;
      }
      if (!phone.trim() || phone.trim().length < 9) {
        setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 số).');
        return;
      }
      if (!password || password.length < 9) {
        setErrorMsg(
          'Mật khẩu phải từ 9 ký tự trở lên, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.'
        );
        return;
      }
      // if (confirmPassword !== password) {
      //   setErrorMsg('Mật khẩu xác nhận không khớp.');
      //   return;
      // }

      setIsSubmitting(true);
      try {
        await userApi.register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: trimmedEmail,
          password,
          phone: phone.trim()
        });

        // Sau khi đăng ký thành công trên Backend, tự động đăng nhập lấy JWT
        const loggedInUser = await authApi.login(trimmedEmail, password);
        onLoginSuccess(loggedInUser);
      } catch (err: any) {
        setErrorMsg(err.message || 'Đăng ký tài khoản thất bại.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-between py-10 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative overflow-hidden">
      {/* Soft ambient background matching reference image */}
      <div
        className="pointer-events-none fixed top-16 left-10 w-[420px] h-[420px] rounded-full opacity-45 blur-[130px] -z-10"
        style={{ background: 'radial-gradient(circle, #FDE68A 0%, rgba(254, 243, 199, 0) 70%)' }}
      />
      <div
        className="pointer-events-none fixed bottom-10 left-1/4 w-[440px] h-[440px] rounded-full opacity-45 blur-[140px] -z-10"
        style={{ background: 'radial-gradient(circle, #93C5FD 0%, rgba(68, 97, 242, 0.22) 50%, rgba(255,255,255,0) 75%)' }}
      />

      <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        {/* Left Column: Typography & Mode Switch Prompts */}
        <div className="lg:col-span-4 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black leading-[1.2] tracking-tight">
            {mode === 'login' ? (
              <>
                Đăng nhập vào <br />
                <span className="text-[#4461F2]">Bike Aid Direct</span>
              </>
            ) : (
              <>
                Đăng ký tài khoản <br />
                <span className="text-[#4461F2]">Bike Aid Direct</span>
              </>
            )}
          </h1>

          <p className="text-xs text-black/75 leading-relaxed">
            {mode === 'login'
              ? 'Truy cập hồ sơ cá nhân để tra cứu thẻ bảo hiểm xe máy điện tử, kiểm tra thời hạn hiệu lực và gửi yêu cầu bồi thường tai nạn trực tuyến.'
              : 'Khởi tạo tài khoản thành viên chỉ trong 1 phút để quản lý hợp đồng bảo hiểm xe máy, nhận chứng nhận QR hợp chuẩn và bảo lãnh bồi thường 24/7.'}
          </p>

          <div className="pt-1 text-xs text-black font-medium leading-relaxed">
            {mode === 'login' ? (
              <p>
                Nếu bạn chưa có tài khoản, <br />
                bạn có thể{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-[#4461F2] font-bold hover:underline focus:outline-none"
                >
                  Đăng ký tại đây!
                </button>
              </p>
            ) : (
              <p>
                Nếu bạn đã có tài khoản, <br />
                bạn có thể{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#4461F2] font-bold hover:underline focus:outline-none"
                >
                  Đăng nhập tại đây!
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Center Column: 3D AI Character matching user reference image */}
        <div className="lg:col-span-4 flex items-center justify-center relative py-4 lg:py-0">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center">
            <div
              className="absolute inset-4 rounded-full opacity-60 blur-2xl -z-10"
              style={{
                background: 'radial-gradient(circle, #93C5FD 0%, rgba(68,97,242,0.3) 45%, rgba(254,243,199,0.3) 80%)'
              }}
            />
            <img
              src="/src/assets/images/login_3d_character_1794161519801.jpg"
              alt="MotoInsure 3D AI Assistant Character"
              className="w-full h-full object-contain rounded-3xl drop-shadow-[0_15px_30px_rgba(68,97,242,0.22)] mix-blend-multiply select-none pointer-events-none transform hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Right Column: Unified Login & Register Form */}
        <div className="lg:col-span-4 w-full max-w-sm mx-auto lg:ml-auto">
          <div className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-neutral-200 shadow-[0_16px_40px_rgba(15,23,42,0.06)] space-y-4">
            {/* Unified Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#EAF0F7]">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-[#4461F2] text-white shadow-sm'
                    : 'text-black hover:opacity-75'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-[#4461F2] text-white shadow-sm'
                    : 'text-black hover:opacity-75'
                }`}
              >
                Đăng ký tài khoản
              </button>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#4461F2]">
                {mode === 'login' ? 'Thông tin đăng nhập' : 'Tạo tài khoản mới'}
              </h2>
              <p className="text-xs text-black mt-0.5">
                {mode === 'login'
                  ? 'Nhập email và mật khẩu để trải nghiệm nhiều gói bảo hiểm với giá cả hợp lí cho gia đình.'
                  : 'Điền thông tin cá nhân để nhận lấy quyền lợi bảo hiểm điện tử uy tín.'}
              </p>
            </div>

            {/* {mode === 'login' && (
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                
          
            )} */}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-black text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      họ
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Nhập họ (Ví dụ: Nguyễn)"
                      className="w-full h-[48px] px-3.5 rounded-xl bg-[#EAF0F7] text-black placeholder-black/40 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4461F2] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      tên
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Nhập tên (Ví dụ: Văn An)"
                      className="w-full h-[48px] px-3.5 rounded-xl bg-[#EAF0F7] text-black placeholder-black/40 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4461F2] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Nhập địa chỉ email"
                    className="w-full h-[48px] pl-4 pr-10 rounded-xl bg-[#EAF0F7] text-black placeholder-black/40 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4461F2] transition-all"
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-black/30 flex items-center justify-center text-black/60 hover:text-black"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Nhập số điện thoại liên hệ"
                    className="w-full h-[48px] px-4 rounded-xl bg-[#EAF0F7] text-black placeholder-black/40 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4461F2] transition-all"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="••••••••"
                    className="w-full h-[48px] pl-4 pr-11 rounded-xl bg-[#EAF0F7] text-black placeholder-black/40 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4461F2] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    xác nhận mật khẩu
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full h-[48px] px-4 rounded-xl bg-[#EAF0F7] text-black placeholder-black/40 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4461F2] transition-all"
                  />
                </div>
              )} */}

              {/* Forgot link in Login mode */}
              {mode === 'login' && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onOpenForgot}
                    className="text-[11px] font-medium text-black hover:text-[#4461F2] transition-colors"
                  >
                    quên mật khẩu ?
                  </button>
                </div>
              )}

              {/* Submit Button - Blue */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[48px] rounded-xl bg-[#4461F2] hover:bg-[#3451E0] disabled:opacity-60 text-white font-bold text-xs shadow-[0_10px_22px_-5px_rgba(68,97,242,0.45)] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký ngay'}</span>
                  )}
                </button>
              </div>
            </form>

            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] text-black font-medium">
                hoặc tiếp tục với
              </span>
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={() => onLoginSuccess(INITIAL_USER)}
              className="w-full h-[46px] rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2.5 text-xs font-bold text-black shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-4 border-t border-neutral-200/70 flex items-center justify-between text-xs text-black/60">
        <button onClick={onBackToLanding} className="hover:text-[#4461F2] transition-colors font-semibold text-black">
          ← Quay lại Trang chủ
        </button>
        <p>© 2026 Bike Aid. Hệ thống cứu hộ & bảo hiểm xe máy điện tử.</p>
      </div>
    </section>
  );
}