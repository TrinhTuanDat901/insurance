// File: src/Router/AppRouter.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../View/shared/Navbar';
import { UserResponse } from '../types/index';
import AiChatbot from '../View/shared/AiChatbot';
import LandingPage from '../View/Homepage/LandingPage';
import LoginPage from '../View/Auth/LoginPage';
import ForgotPasswordModal from '../View/Auth/ForgotPasswordModal';
import UserDashBoard from '../View/UserDashBoard/UserDashBoard';
import StaffDashboard from '../View/StaffDashboard/StaffDashboard';
import { COLORS } from '../Store/colors';
import { authApi } from '../Store/authClient';
import { TokenStorage, decodeJwt } from '../Store/apiClient';
import { INITIAL_USER } from '../Store/mockData';
import { UserAccount } from '../types/index';

export default function AppRouter() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'profile' | 'staff'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [enrollModalPackageId, setEnrollModalPackageId] = useState<string | null>(null);
  const [openClaimFromAi, setOpenClaimFromAi] = useState(false);
  const [userResponse, setUserResponse] = useState<UserResponse | null>(null);
  
  useEffect(() => {
    const savedToken = TokenStorage.getToken();
    if (!savedToken) return;
    authApi.introspect(savedToken).then((isValid) => {
      if (isValid) {
        const decoded = decodeJwt(savedToken);
        const isStaff = decoded?.scope?.includes('ROLE_STAFF') ?? false;
        setUser({
          id: decoded?.jti || '1',
          email: decoded?.sub || '',
          fullName: isStaff ? 'Chuyên viên Nghiệp vụ' : decoded?.sub || 'Khách hàng',
          phone: '0984 123 456', // phone: userResponse?.phone || '',
          role: isStaff ? 'STAFF' : 'CUSTOMER'
        });
      } else {
        TokenStorage.clearToken();
      }
    });
  }, []);

  const handleNavigateAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (loggedInUser: UserAccount) => {
    setUser(loggedInUser);
    setCurrentView(loggedInUser.role === 'STAFF' ? 'staff' : 'profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col ${COLORS.PAGE_WRAPPER}`}>
      <Navbar
        currentView={currentView}
        authMode={authMode}
        onNavigateAuth={handleNavigateAuth}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onScrollToSection={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigateAuth={handleNavigateAuth}
            onSelectPackageForEnrollment={(pkgId: string) => {
              if (!user) setEnrollModalPackageId(pkgId);
              else setCurrentView('profile');
            }}
          />
        )}

        {currentView === 'auth' && (
          <LoginPage
            initialMode={authMode}
            onModeChange={setAuthMode}
            onLoginSuccess={handleLoginSuccess}
            onOpenForgot={() => setIsForgotOpen(true)}
            onBackToLanding={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'profile' && (
          <UserDashBoard
            user={user || INITIAL_USER}
            onNavigateStaff={() => setCurrentView('staff')}
            onBackToLanding={() => setCurrentView('landing')}
            externalOpenClaimModal={openClaimFromAi}
            onClearExternalClaimModal={() => setOpenClaimFromAi(false)}
          />
        )}

        {currentView === 'staff' && (
          <StaffDashboard
            onBackToLanding={() => setCurrentView('landing')}
            onNavigateProfile={() => setCurrentView('profile')}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Tích hợp AI Chatbot nổi (Tự động chuyển đổi chế độ USER AI và STAFF MODE) */}
      <AiChatbot
        user={user}
        currentView={currentView}
        onNavigateView={(view) => setCurrentView(view)}
        onOpenClaimModal={() => {
          setCurrentView('profile');
          setOpenClaimFromAi(true);
        }}
      />

      {isForgotOpen && <ForgotPasswordModal onClose={() => setIsForgotOpen(false)} />}

      {enrollModalPackageId && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${COLORS.OVERLAY_BACKDROP} ${COLORS.TEXT_MAIN}`}>
          <div className={`rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border relative space-y-4 ${COLORS.SURFACE_WHITE}`}>
            <h3 className={`text-xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>
              Đăng Ký Tham Gia Gói Bảo Hiểm
            </h3>
            <p className="text-xs text-black/80 leading-relaxed">
              Để kích hoạt gói bảo hiểm và nhận chứng nhận điện tử có mã QR tích hợp, vui lòng đăng nhập hoặc tạo tài khoản mới.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  setEnrollModalPackageId(null);
                  handleNavigateAuth('login');
                }}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-sm transition-all ${COLORS.BTN_PRIMARY}`}
              >
                Đăng nhập để tiếp tục
              </button>
              <button
                onClick={() => {
                  setEnrollModalPackageId(null);
                  handleNavigateAuth('register');
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${COLORS.BTN_NEUTRAL}`}
              >
                Tạo tài khoản mới
              </button>
              <button
                onClick={() => setEnrollModalPackageId(null)}
                className="w-full py-2 text-black/60 hover:text-black text-xs font-semibold"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}