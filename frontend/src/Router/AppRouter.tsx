// File: src/Router/AppRouter.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../View/shared/Navbar';
import LandingPage from '../View/Homepage/LandingPage';
import LoginPage from '../View/Auth/LoginPage';
import ForgotPasswordModal from '../View/Auth/ForgotPasswordModal';
import UserDashBoard from '../View/UserDashBoard/UserDashBoard';
import StaffDashboard from '../View/StaffDashboard/StaffDashboard';
import { COLORS } from '../Store/colors';
import { authApi, TokenStorage, decodeJwt } from '../Store/apiClient';
import {
  INITIAL_USER,
  INITIAL_POLICIES,
  INITIAL_CLAIMS,
  INITIAL_INCIDENTS,
  INITIAL_INVOICES,
  USER_VEHICLES,
} from '../Store/mockData';
import { UserAccount, InsurancePolicy, CompensationClaim, VehicleItem } from '../types';

export default function AppRouter() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'profile' | 'staff'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [enrollModalPackageId, setEnrollModalPackageId] = useState<string | null>(null);

  const [policies, setPolicies] = useState<InsurancePolicy[]>(INITIAL_POLICIES);
  const [claims, setClaims] = useState<CompensationClaim[]>(INITIAL_CLAIMS);
  const [vehicles, setVehicles] = useState<VehicleItem[]>(USER_VEHICLES);

  useEffect(() => {
    const savedToken = TokenStorage.getToken();
    if (!savedToken) return;
    authApi.introspect(savedToken).then((isValid) => {
      if (isValid) {
        const decoded = decodeJwt(savedToken);
        const isStaff = decoded?.scope?.includes('ROLE_STAFF') ?? false;
        setUser({
          id: decoded?.jti || 'usr_restored',
          email: decoded?.sub || '',
          fullName: isStaff ? 'Chuyên viên Nghiệp vụ' : decoded?.sub || 'Khách hàng',
          phone: '0903 128 456',
          role: isStaff ? 'STAFF' : 'CUSTOMER',
          membershipTier: isStaff ? 'PLATINUM' : 'GOLD',
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
            policies={policies}
            claims={claims}
            incidents={INITIAL_INCIDENTS}
            invoices={INITIAL_INVOICES}
            vehicles={vehicles}
            onAddNewClaim={(c) => setClaims((prev) => [c, ...prev])}
            onAddNewVehicle={(v) => setVehicles((prev) => [...prev, v])}
            onRenewPolicy={(id) =>
              setPolicies((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: 'ACTIVE', statusLabel: 'Đang có hiệu lực' } : p))
              )
            }
            onNavigateStaff={() => setCurrentView('staff')}
            onBackToLanding={() => setCurrentView('landing')}
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

      {isForgotOpen && <ForgotPasswordModal onClose={() => setIsForgotOpen(false)} />}
    </div>
  );
}