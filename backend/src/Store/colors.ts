export const COLORS = {
  // 1. Mã màu HEX nguyên bản (dùng cho inline style, SVG, Canvas, Gradient)
  HEX: {
    PRIMARY: '#4461F2',
    PRIMARY_HOVER: '#3451E0',
    WARNING_CTA: '#E5A00D',
    WARNING_CTA_HOVER: '#D49206',
    WARNING_CTA_ACTIVE: '#B87D03',
    BG_PAGE: '#F9FAFB',
    BG_SUBTLE: '#F6F8FC',
    BG_INPUT_AUTH: '#EAF0F7',
    BG_STAFF_SIDEBAR: '#0F172A',
    TEXT_MAIN: '#000000',
    WHITE: '#FFFFFF',
    GLOW_AMBER: '#FDE68A',
    GLOW_BLUE: '#93C5FD',
    GOOGLE_BLUE: '#4285F4',
    GOOGLE_GREEN: '#34A853',
    GOOGLE_YELLOW: '#FBBC05',
    GOOGLE_RED: '#EA4335',
  },

  // 2. Nền tảng trang & Bề mặt (Backgrounds & Surfaces)
  PAGE_WRAPPER: 'bg-[#F9FAFB] text-black selection:bg-[#4461F2] selection:text-white',
  NAVBAR_BG: 'bg-[#F9FAFB]/90 border-neutral-200/80',
  SURFACE_WHITE: 'bg-white border-neutral-200',
  SURFACE_SUBTLE: 'bg-[#F6F8FC] border-neutral-200',
  SURFACE_INPUT_AUTH: 'bg-[#EAF0F7] text-black placeholder-black/40 focus:bg-white focus:ring-2 focus:ring-[#4461F2]',
  SURFACE_INPUT_STANDARD: 'bg-[#F6F8FC] border-neutral-200 text-black focus:bg-white focus:ring-2 focus:ring-[#4461F2]',
  STAFF_SIDEBAR: 'bg-[#0F172A] text-white border-neutral-800',
  OVERLAY_BACKDROP: 'bg-black/50 backdrop-blur-sm',

  // 3. Chữ & Đường viền thương hiệu (Typography & Borders)
  TEXT_PRIMARY: 'text-[#4461F2]',
  TEXT_PRIMARY_HOVER: 'hover:text-[#4461F2]',
  TEXT_MAIN: 'text-black',
  TEXT_MUTED: 'text-black/70',
  BORDER_PRIMARY: 'border-[#4461F2]',
  BORDER_PRIMARY_HOVER: 'hover:border-[#4461F2]',
  SECTION_TITLE_UNDERLINE: 'text-[#4461F2] border-b-2 border-[#4461F2]',
  NAV_ACTIVE_UNDERLINE: 'text-[#4461F2] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#4461F2] after:rounded-full',

  // 4. Các nút bấm (Buttons)
  BTN_PRIMARY: 'bg-[#4461F2] hover:bg-[#3451E0] text-white',
  BTN_PRIMARY_SHADOW: 'bg-[#4461F2] hover:bg-[#3451E0] text-white shadow-[0_8px_20px_-4px_rgba(68,97,242,0.45)]',
  BTN_PRIMARY_AUTH_SHADOW: 'bg-[#4461F2] hover:bg-[#3451E0] text-white shadow-[0_10px_22px_-5px_rgba(68,97,242,0.45)]',
  BTN_PRIMARY_PILL_ACTIVE: 'bg-[#4461F2] text-white shadow-[0_6px_18px_rgba(68,97,242,0.35)]',
  BTN_WARNING_CTA: 'bg-[#E5A00D] hover:bg-[#D49206] active:bg-[#B87D03] text-white shadow-[0_8px_20px_-4px_rgba(229,160,13,0.5)]',
  BTN_DARK: 'bg-black hover:bg-neutral-800 text-white',
  BTN_NEUTRAL: 'bg-neutral-100 hover:bg-neutral-200 text-black',
  BTN_OUTLINE: 'bg-white hover:bg-neutral-50 text-black border border-neutral-200',

  // 5. Nút & Nhãn ngữ nghĩa (Semantic Actions & Statuses)
  ACTION_SUCCESS_SOLID: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  ACTION_SUCCESS_SOFT: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
  ACTION_DANGER_SOLID: 'bg-rose-600 hover:bg-rose-700 text-white',
  ACTION_DANGER_SOFT: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
  ACTION_INFO_SOFT: 'bg-blue-50 text-[#4461F2] border border-blue-200 hover:bg-blue-100',

  // 6. Bảng màu cho StatusBadge
  BADGE: {
    EMERALD: {
      CONTAINER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      DOT: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    },
    ROSE: {
      CONTAINER: 'bg-rose-50 text-rose-700 border-rose-200',
      DOT: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    },
    AMBER: {
      CONTAINER: 'bg-amber-50 text-amber-700 border-amber-200',
      DOT: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    },
    BLUE: {
      CONTAINER: 'bg-blue-50 text-blue-700 border-blue-200',
      DOT: 'bg-[#4461F2] shadow-[0_0_8px_rgba(68,97,242,0.5)]',
    },
    PURPLE: {
      CONTAINER: 'bg-purple-50 text-purple-700 border-purple-200',
      DOT: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
    },
    NEUTRAL: {
      CONTAINER: 'bg-neutral-100 text-black border-neutral-200',
      DOT: 'bg-neutral-400',
    },
  },

  // 7. Gradient ánh sáng nền trang Login
  GRADIENTS: {
    LOGIN_TOP_GLOW: 'radial-gradient(circle, #FDE68A 0%, rgba(254, 243, 199, 0) 70%)',
    LOGIN_BOTTOM_GLOW: 'radial-gradient(circle, #93C5FD 0%, rgba(68, 97, 242, 0.22) 50%, rgba(255,255,255,0) 75%)',
    CHARACTER_BACK_GLOW: 'radial-gradient(circle, #93C5FD 0%, rgba(68,97,242,0.3) 45%, rgba(254,243,199,0.3) 80%)',
  },
} as const;