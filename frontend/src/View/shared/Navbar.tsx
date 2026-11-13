// File: motobike_insurance/frontend/src/View/shared/Navbar.tsx
import React from 'react';
import {
  Wrench,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { UserAccount } from '../../types';
import { COLORS } from '../../Store/colors';

interface NavbarProps {
  currentView: 'landing' | 'auth' | 'profile' | 'staff';
  authMode: 'login' | 'register';
  onNavigateAuth: (mode: 'login' | 'register') => void;
  onNavigate: (view: 'landing' | 'auth' | 'profile' | 'staff') => void;
  onScrollToSection: (sectionId: string) => void;
  user: UserAccount | null;
  onLogout: () => void;
}

export default function Navbar({
  currentView,
  authMode,
  onNavigateAuth,
  onNavigate,
  onScrollToSection,
  user,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>('home');

  React.useEffect(() => {
    if (currentView !== 'landing') {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      const sections = [
        { id: 'case-studies-section', name: 'case-studies' },
        { id: 'process-section', name: 'process' },
        { id: 'compensation-guarantee-section', name: 'guarantee' },
        { id: 'packages-section', name: 'packages' },
      ];

      let found = false;
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el && scrollPos >= el.offsetTop) {
          setActiveSection(sec.name);
          found = true;
          break;
        }
      }
      if (!found) setActiveSection('home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const handleNavClick = (sectionId: string, sectionName?: string) => {
    setMobileMenuOpen(false);
    if (sectionName) setActiveSection(sectionName);
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => onScrollToSection(sectionId), 150);
    } else {
      onScrollToSection(sectionId);
    }
  };

  const isProfileOrStaff = currentView === 'profile' || currentView === 'staff';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all ${COLORS.NAVBAR_BG}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        <button
          onClick={() => {
            onNavigate('landing');
            setActiveSection('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-colors relative overflow-hidden ${COLORS.BTN_PRIMARY}`}>
            <Settings className="w-5 h-5 absolute -bottom-1 -left-1 opacity-70 animate-[spin_16s_linear_infinite]" />
            <Wrench className="w-5 h-5 relative z-10 rotate-45 transform drop-shadow-xs" />
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-extrabold tracking-tight leading-none ${COLORS.TEXT_PRIMARY}`}>
              Bike Aid
            </span>
            <span className="text-[10px] text-black/60 font-semibold tracking-wider uppercase mt-0.5">
              Cứu hộ & Bảo hiểm xe máy
            </span>
          </div>
        </button>

        {!isProfileOrStaff ? (
          <nav className={`hidden md:flex items-center gap-8 text-xs font-semibold ${COLORS.TEXT_MAIN}`}>
            {[
              { key: 'home', label: 'Trang chủ', sectionId: '' },
              { key: 'packages', label: 'Gói bảo hiểm', sectionId: 'packages-section' },
              { key: 'guarantee', label: 'Cam kết bồi thường', sectionId: 'compensation-guarantee-section' },
              { key: 'process', label: 'Quy trình giải quyết', sectionId: 'process-section' },
              { key: 'case-studies', label: 'Sự vụ thực tế', sectionId: 'case-studies-section' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === 'home') {
                    onNavigate('landing');
                    setActiveSection('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    handleNavClick(item.sectionId, item.key);
                  }
                }}
                className={`whitespace-nowrap transition-all ${COLORS.TEXT_PRIMARY_HOVER} relative py-1 ${
                  currentView === 'landing' && activeSection === item.key
                    ? COLORS.NAV_ACTIVE_UNDERLINE
                    : COLORS.TEXT_MAIN
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-black/80">
            <button
              onClick={() => {
                onNavigate('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${COLORS.BTN_NEUTRAL}`}
            >
              <span>← Về Trang chủ</span>
            </button>
            <span className="text-black/40">|</span>
            <span className={`font-extrabold`}>
              {currentView === 'staff' ? 'Khu Vực Nghiệp Vụ Chuyên Viên' : 'Khu Vực Hồ Sơ Khách Hàng'}
            </span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'STAFF' ? (
                <button
                  onClick={() => onNavigate('staff')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                    currentView === 'staff' ? COLORS.BTN_DARK : COLORS.BTN_PRIMARY
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                    <span>Hồ sơ Nhân Viên</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('profile')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${COLORS.BTN_PRIMARY}`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Hồ sơ</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                </button>
              )}
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className={`p-2 rounded-xl hover:bg-neutral-200/60 transition-colors ${COLORS.TEXT_MAIN}`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigateAuth('login')}
                className={`text-xs font-bold transition-all whitespace-nowrap ${
                  currentView === 'auth' && authMode === 'login'
                    ? `px-5 py-2.5 rounded-full ${COLORS.BTN_PRIMARY_PILL_ACTIVE}`
                    : `px-4 py-2.5 rounded-full ${COLORS.TEXT_MAIN} ${COLORS.TEXT_PRIMARY_HOVER}`
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => onNavigateAuth('register')}
                className={`text-xs font-bold transition-all whitespace-nowrap ${
                  currentView === 'auth' && authMode === 'register'
                    ? `px-5 py-2.5 rounded-full ${COLORS.BTN_PRIMARY_PILL_ACTIVE}`
                    : `px-4 py-2.5 rounded-full ${COLORS.TEXT_MAIN} ${COLORS.TEXT_PRIMARY_HOVER}`
                }`}
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          {user && (
            <button
              onClick={() => onNavigate(user.role === 'STAFF' ? 'staff' : 'profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${COLORS.BTN_PRIMARY}`}
            >
              Hồ sơ
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl hover:bg-neutral-100 ${COLORS.TEXT_MAIN}`}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
}