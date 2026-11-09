// File: src/View/Homepage/LandingPage.tsx
import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Check,
  ChevronRight,
  Send,
  Wrench,
  Settings,
} from 'lucide-react';
import { MOTORBIKE_PACKAGES, CASE_STUDIES, GUARANTEE_POINTS } from '../../Store/mockData';
import { COLORS } from '../../Store/colors';

interface LandingPageProps {
  onNavigateAuth: (mode: 'login' | 'register') => void;
  onSelectPackageForEnrollment: (pkgId: string) => void;
}

export default function LandingPage({
  onNavigateAuth,
  onSelectPackageForEnrollment,
}: LandingPageProps) {
  const [selectedVehicleType, setSelectedVehicleType] = useState<'standard' | 'scooter' | 'sport'>('scooter');
  const [selectedDurationYears, setSelectedDurationYears] = useState<number>(1);
  const [consultationName, setConsultationName] = useState('');
  const [consultationPhone, setConsultationPhone] = useState('');
  const [consultationSuccess, setConsultationSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const calculateQuickEstimate = () => {
    let base = 66000;
    if (selectedVehicleType === 'scooter') base += 250000;
    if (selectedVehicleType === 'sport') base += 350000;
    return base * selectedDurationYears;
  };

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationPhone.trim()) return;
    setConsultationSuccess(true);
    setTimeout(() => {
      setConsultationSuccess(false);
      setConsultationName('');
      setConsultationPhone('');
    }, 4500);
  };

  const FAQS = [
    {
      q: 'Nếu xảy ra tai nạn trong thời hạn bảo hiểm, tôi được bồi thường như thế nào?',
      a: 'Nếu vụ tai nạn xảy ra trong khoảng thời gian hợp đồng còn hiệu lực và không vi phạm các điều khoản loại trừ, MotoInsure cam kết bồi thường 100% thiệt hại thuộc phạm vi bảo hiểm. Bạn chỉ cần chụp ảnh hiện trường và liên hệ tổng đài 1900 6868 trong vòng 24 giờ.',
    },
    {
      q: 'Xe máy bị trầy xước hoặc hư hỏng do va chạm có phải ứng tiền sửa trước không?',
      a: 'Không. Với gói Bảo hiểm Toàn diện Vật chất hoặc Gói Kim Cương, MotoInsure liên kết trực tiếp với hơn 350 Head Honda, Yamaha Town và xưởng dịch vụ ủy quyền. Chúng tôi bảo lãnh thanh toán chi phí sửa chữa trực tiếp cho xưởng, bạn không cần bỏ tiền túi ứng trước.',
    },
    {
      q: 'Chứng nhận bảo hiểm điện tử có giá trị pháp lý khi CSGT kiểm tra không?',
      a: 'Hoàn toàn hợp lệ theo Nghị định 67/2023/NĐ-CP và Luật Giao thông Đường bộ. Giấy chứng nhận điện tử của MotoInsure có mã QR hợp chuẩn, được tra cứu trực tiếp và có giá trị tương đương bản giấy.',
    },
    {
      q: 'Dịch vụ cứu hộ xe máy 24/7 bao gồm những gì?',
      a: 'Dịch vụ cứu hộ xe máy hỗ trợ miễn phí: vá lốp lưu động khi thủng săm/lốp trên đường, kích bình ắc quy khi xe không đề được máy, tiếp xăng khẩn cấp và điều xe cẩu chuyên dụng chở xe về trạm sửa chữa gần nhất khi tai nạn hư hỏng nặng.',
    },
  ];

  return (
    <div className={`space-y-20 pb-20 overflow-x-hidden ${COLORS.TEXT_MAIN}`}>
      {/* ==================================================================
          1. HERO SECTION
         ================================================================== */}
      <section className="pt-8 sm:pt-12 lg:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className={`text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight leading-[1.18] ${COLORS.TEXT_PRIMARY}`}>
              Bảo Vệ Toàn Diện & <br />
              Cam Kết Bồi Thường <br />
              <span className={COLORS.TEXT_MAIN}>Tức Thì Khi Có Tai Nạn</span>
            </h1>

            <p className="text-xs sm:text-[13px] text-black/80 leading-relaxed max-w-xl">
              An tâm lăn bánh trên mọi nẻo đường với chứng nhận bảo hiểm điện tử tích hợp mã QR, bảo lãnh viện phí và cam kết chi trả bồi thường tai nạn trong vòng <strong>48 giờ</strong> khi sự cố xảy ra trong thời hạn bảo hiểm.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => {
                  const el = document.getElementById('packages-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${COLORS.BTN_PRIMARY_SHADOW}`}
              >
                <span>Xem các gói bảo hiểm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('compensation-guarantee-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl bg-white hover:bg-neutral-100 text-black font-bold text-xs border border-neutral-300 transition-all"
              >
                Cam kết bồi thường tai nạn
              </button>
            </div>
          </div>

          {/* Right Hero Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200 group">
              <img
                src="/src/assets/images/hero_motorbike_journey_1794159500973.jpg"
                alt="Chuyến hành trình an toàn cùng bảo hiểm xe máy MotoInsure"
                className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              {/* Bottom caption card on image */}
              <div className={`absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-neutral-200 shadow-lg space-y-1.5 ${COLORS.TEXT_MAIN}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider ${COLORS.TEXT_PRIMARY}`}>
                    Chính sách bảo lãnh tức thì
                  </span>
                  <span className="text-[11px] font-bold text-black">
                    Bảo đảm 100%
                  </span>
                </div>
                <p className="text-xs text-black font-medium leading-snug">
                  Đảm bảo bồi thường mọi sự vụ tai nạn, va chạm, ngập nước trong thời hạn hợp đồng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Big Trust Metric Row */}
        <div className={`mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border shadow-sm text-center ${COLORS.SURFACE_WHITE}`}>
          <div className="space-y-0.5">
            <p className={`text-2xl font-extrabold tracking-tight ${COLORS.TEXT_PRIMARY}`}>1.2 Triệu+</p>
            <p className="text-xs font-medium text-black">Chủ xe máy tin dùng</p>
          </div>
          <div className="space-y-0.5">
            <p className={`text-2xl font-extrabold tracking-tight ${COLORS.TEXT_PRIMARY}`}>98.6%</p>
            <p className="text-xs font-medium text-black">Tỷ lệ bồi thường đúng hạn</p>
          </div>
          <div className="space-y-0.5">
            <p className={`text-2xl font-extrabold tracking-tight ${COLORS.TEXT_PRIMARY}`}>48 Giờ</p>
            <p className="text-xs font-medium text-black">Cam kết chi trả tài khoản</p>
          </div>
          <div className="space-y-0.5">
            <p className={`text-2xl font-extrabold tracking-tight ${COLORS.TEXT_PRIMARY}`}>350+</p>
            <p className="text-xs font-medium text-black">Gara chính hãng bảo lãnh</p>
          </div>
        </div>
      </section>

      {/* ==================================================================
          2. INSURANCE PACKAGES SECTION
         ================================================================== */}
      <section id="packages-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-black">
            Danh mục sản phẩm bảo hiểm
          </span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${COLORS.TEXT_PRIMARY}`}>
            Các Gói Bảo Hiểm Xe Máy Toàn Diện
          </h2>
          <p className="text-xs sm:text-[13px] text-black/80 leading-relaxed">
            Lựa chọn gói bảo vệ linh hoạt phù hợp với nhu cầu lưu thông hàng ngày, từ gói bắt buộc pháp lý đến gói bảo vệ vật chất hai chiều cao cấp.
          </p>
        </div>

        {/* 4 Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOTORBIKE_PACKAGES.map((pkg) => {
            const isFeatured = pkg.id === 'DIAMOND_ALL_IN_ONE';
            return (
              <div
                key={pkg.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative bg-white ${
                  isFeatured
                    ? `border-2 ${COLORS.BORDER_PRIMARY} shadow-lg`
                    : 'border border-neutral-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isFeatured && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${COLORS.BTN_PRIMARY}`}>
                    Gói khuyên dùng
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-black/60 block">
                      {pkg.highlightBadge}
                    </span>
                    <h3 className={`text-base font-extrabold mt-1 leading-snug ${COLORS.TEXT_PRIMARY}`}>
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-black/75 mt-1 leading-relaxed">
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="py-3 border-y border-neutral-200">
                    <span className="text-[11px] text-black font-medium">mức phí chỉ từ:</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-extrabold text-black font-mono">
                        {pkg.basePrice.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-xs font-semibold text-black">đ / {pkg.period}</span>
                    </div>
                  </div>

                  {/* Key coverage points */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
                      <span className="text-black block text-[10px]">hạn mức bảo vệ người:</span>
                      <span className="font-bold text-black">{pkg.coveragePeople}</span>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
                      <span className="text-black block text-[10px]">hạn mức bảo vệ xe:</span>
                      <span className="font-bold text-black">{pkg.coverageProperty}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="pt-1 space-y-2">
                    <p className="text-[11px] font-bold text-black uppercase tracking-wide">
                      quyền lợi nổi bật:
                    </p>
                    <ul className="space-y-1.5 text-xs text-black">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-neutral-200">
                  <button
                    onClick={() => onSelectPackageForEnrollment(pkg.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm ${COLORS.BTN_PRIMARY}`}
                  >
                    <span>Đăng ký gói này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Rate Estimator Box */}
        <div className={`mt-10 rounded-3xl p-6 sm:p-8 border shadow-sm ${COLORS.SURFACE_WHITE}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                công cụ tính phí trực quan
              </span>
              <h3 className={`text-xl sm:text-2xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                Ước Tính Phí Bảo Hiểm Nhanh Chóng
              </h3>
              <p className="text-xs text-black leading-relaxed">
                Chọn dòng xe và thời hạn bảo hiểm mong muốn để hệ thống tự động tính toán tổng mức phí phù hợp nhất.
              </p>
            </div>

            <div className={`lg:col-span-7 p-5 rounded-2xl border space-y-4 ${COLORS.SURFACE_SUBTLE}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    loại phương tiện
                  </label>
                  <select
                    value={selectedVehicleType}
                    onChange={(e) => setSelectedVehicleType(e.target.value as 'standard' | 'scooter' | 'sport')}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#4461F2]"
                  >
                    <option value="standard">Xe máy số (Wave, Sirius, Future...)</option>
                    <option value="scooter">Xe tay ga (AirBlade, Vision, SH, Lead...)</option>
                    <option value="sport">Xe môtô phân khối lớn ({'>'}175cc)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    thời hạn tham gia
                  </label>
                  <select
                    value={selectedDurationYears}
                    onChange={(e) => setSelectedDurationYears(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#4461F2]"
                  >
                    <option value={1}>1 Năm bảo vệ</option>
                    <option value={2}>2 Năm (Tiết kiệm 10%)</option>
                    <option value={3}>3 Năm (Tiết kiệm 15%)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-neutral-200">
                <div>
                  <span className="text-xs text-black">tổng phí bảo hiểm dự kiến:</span>
                  <div className="text-xl font-black text-black font-mono">
                    {calculateQuickEstimate().toLocaleString('vi-VN')} đ
                  </div>
                </div>
                <button
                  onClick={() => onSelectPackageForEnrollment('DIAMOND_ALL_IN_ONE')}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${COLORS.BTN_PRIMARY}`}
                >
                  <span>Đăng ký ngay với mức phí này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          3. ACCIDENT COMPENSATION GUARANTEE SECTION (CAM KẾT BỒI THƯỜNG)
         ================================================================== */}
      <section id="compensation-guarantee-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className={`rounded-3xl p-6 sm:p-10 border shadow-sm ${COLORS.SURFACE_WHITE}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                Cam kết bảo vệ quyền lợi khách hàng
              </span>

              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug ${COLORS.TEXT_PRIMARY}`}>
                Đảm Bảo Bồi Thường 100% Khi Có Tai Nạn Trong Thời Hạn Bảo Hiểm
              </h2>

              <p className="text-xs sm:text-[13px] text-black/80 leading-relaxed">
                Tại MotoInsure, mọi sự cố va chạm, té ngã, hư hỏng vật chất hay tai nạn thương tật xảy ra <strong>trong thời hạn hợp đồng còn hiệu lực</strong> đều được thẩm định minh bạch và chi trả bồi thường trọn vẹn theo đúng quy tắc bảo hiểm.
              </p>

              {/* 4 Guarantee bullets */}
              <div className="space-y-3 pt-2">
                {GUARANTEE_POINTS.map((pt) => (
                  <div key={pt.number} className={`flex items-start gap-3 p-3 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
                    <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${COLORS.BTN_PRIMARY}`}>
                      {pt.number}
                    </span>
                    <div>
                      <h4 className={`text-xs font-extrabold ${COLORS.TEXT_PRIMARY}`}>{pt.title}</h4>
                      <p className="text-xs text-black/80 leading-relaxed mt-0.5">
                        {pt.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateAuth('register')}
                  className={`px-6 py-3 rounded-xl font-bold text-xs shadow-sm transition-all ${COLORS.BTN_PRIMARY}`}
                >
                  Tham gia bảo hiểm ngay
                </button>
                <a
                  href="tel:19006868"
                  className={`px-4 py-3 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 ${COLORS.BTN_NEUTRAL}`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-black" />
                  <span>Tổng đài bồi thường: 1900 6868</span>
                </a>
              </div>
            </div>

            {/* Right Image Assessor Assurance */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-md">
                <img
                  src="/src/assets/images/accident_claim_assurance_1794159500279.jpg"
                  alt="Chuyên viên giám định bồi thường tai nạn xe máy trực tiếp tại gara"
                  className="w-full h-[400px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className={`mt-4 p-4 rounded-2xl border text-xs flex items-center justify-between ${COLORS.SURFACE_SUBTLE}`}>
                <div>
                  <span className="text-[11px] text-black block">thời gian xử lý trung bình:</span>
                  <span className={`text-sm font-extrabold ${COLORS.TEXT_PRIMARY}`}>Dưới 48 Giờ Làm Việc</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-black block">hình thức chi trả:</span>
                  <span className="text-xs font-bold text-black">Chuyển khoản trực tiếp 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          4. 4-STEP STREAMLINED COMPENSATION PROCESS
         ================================================================== */}
      <section id="process-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-black">
            quy trình số hóa tinh gọn
          </span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${COLORS.TEXT_PRIMARY}`}>
            4 Bước Nhận Bồi Thường Khi Gặp Sự Cố
          </h2>
          <p className="text-xs sm:text-[13px] text-black leading-relaxed">
            Không cần chờ đợi thủ tục giấy tờ phức tạp. Mọi bước được xử lý trực quan ngay trong hồ sơ cá nhân của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            {
              step: '01',
              title: 'Khai Báo Hiện Trường',
              desc: 'Khi xảy ra tai nạn, đăng nhập vào hồ sơ chụp ảnh hiện trường và gửi yêu cầu hoặc gọi tổng đài 1900 6868.',
              footer: 'thời gian: 5 - 10 phút',
            },
            {
              step: '02',
              title: 'Giám Định Viên Tiếp Nhận',
              desc: 'Hệ thống phân bổ giám định viên kết nối trực tiếp, hướng dẫn xử lý hiện trường và điều phối cứu hộ.',
              footer: 'phản hồi: trong 30 phút',
            },
            {
              step: '03',
              title: 'Bảo Lãnh Sửa Chữa Tại Gara',
              desc: 'Xe được đưa về Gara chính hãng liên kết. MotoInsure bảo lãnh 100% chi phí sửa chữa, khách không cần ứng tiền.',
              footer: '350+ gara chính hãng Honda, Yamaha',
            },
            {
              step: '04',
              title: 'Chi Trả Bồi Thường Tức Thì',
              desc: 'Tiền bồi thường được chuyển khoản thẳng vào tài khoản ngân hàng của chủ xe trong vòng 48 giờ làm việc.',
              footer: 'chuyển khoản 100% sau 48h',
            },
          ].map((item) => (
            <div key={item.step} className={`rounded-2xl p-5 border shadow-sm space-y-3 ${COLORS.SURFACE_WHITE}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${COLORS.BTN_PRIMARY}`}>
                {item.step}
              </div>
              <div>
                <h3 className={`text-sm font-extrabold ${COLORS.TEXT_PRIMARY}`}>{item.title}</h3>
                <p className="text-xs text-black mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-2 border-t border-neutral-100 text-[11px] font-bold text-black">
                {item.footer}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================
          5. 24/7 ROADSIDE RESCUE SPOTLIGHT
         ================================================================== */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${COLORS.SURFACE_WHITE}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-neutral-200">
                <img
                  src="/src/assets/images/roadside_rescue_support_1794159501033.jpg"
                  alt="Dịch vụ cứu hộ xe máy 24/7 khẩn cấp trên toàn quốc"
                  className="w-full h-[290px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                Đồng hành trên mọi nẻo đường
              </span>
              <h3 className={`text-xl sm:text-2xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                Mạng Lưới Cứu Hộ Xe Máy Khẩn Cấp 24/7 Toàn Quốc
              </h3>
              <p className="text-xs sm:text-[13px] text-black/80 leading-relaxed">
                Dù bạn bị thủng lốp lúc đêm khuya, xe chết máy giữa đường ngập nước hay gặp va chạm trên quốc lộ, đội cứu hộ MotoInsure luôn sẵn sàng ứng cứu kịp thời.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className={`p-3 rounded-xl border text-xs space-y-0.5 ${COLORS.SURFACE_SUBTLE}`}>
                  <p className="font-bold text-black">Vá lốp & Bơm hơi lưu động</p>
                  <p className="text-black/70 text-[11px]">Xử lý tại chỗ khi dính đinh, thủng lốp bất ngờ.</p>
                </div>
                <div className={`p-3 rounded-xl border text-xs space-y-0.5 ${COLORS.SURFACE_SUBTLE}`}>
                  <p className="font-bold text-black">Kích bình ắc quy & Tiếp xăng</p>
                  <p className="text-black/70 text-[11px]">Hỗ trợ tiếp nhiên liệu khẩn cấp hoặc câu nạp điện bình.</p>
                </div>
                <div className={`p-3 rounded-xl border text-xs space-y-0.5 ${COLORS.SURFACE_SUBTLE}`}>
                  <p className="font-bold text-black">Xe cẩu tải chuyên dụng</p>
                  <p className="text-black/70 text-[11px]">Vận chuyển xe máy về gara chính hãng an toàn khi tai nạn.</p>
                </div>
                <div className={`p-3 rounded-xl border text-xs space-y-0.5 ${COLORS.SURFACE_SUBTLE}`}>
                  <p className="font-bold text-black">Tổng đài cứu hộ 24/7</p>
                  <p className="text-black/70 text-[11px]">Đội ngũ trực điện thoại 365 ngày không nghỉ lễ tết.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          6. REAL ACCIDENT COMPENSATION CASE STUDIES (SỰ VỤ THỰC TẾ)
         ================================================================== */}
      <section id="case-studies-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-black">
            Minh chứng năng lực chi trả
          </span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${COLORS.TEXT_PRIMARY}`}>
            Sự Vụ Bồi Thường Tai Nạn Gần Đây
          </h2>
          <p className="text-xs sm:text-[13px] text-black/80 leading-relaxed">
            Hàng ngàn trường hợp khách hàng gặp sự cố trên đường đã được MotoInsure bảo lãnh sửa chữa và giải quyết bồi thường thỏa đáng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CASE_STUDIES.map((cs) => (
            <div
              key={cs.id}
              className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between space-y-4 ${COLORS.SURFACE_WHITE}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-black/70 font-semibold">
                  <span>{cs.rider}</span>
                  <span>{cs.vehicle} ({cs.plate})</span>
                </div>

                <h3 className={`text-sm font-extrabold leading-snug ${COLORS.TEXT_PRIMARY}`}>
                  {cs.title}
                </h3>

                <p className="text-xs text-black leading-relaxed">
                  <strong>sự cố:</strong> {cs.incident}
                </p>

                <div className={`p-3 rounded-xl border text-xs text-black space-y-1 ${COLORS.SURFACE_SUBTLE}`}>
                  <p className={`font-bold ${COLORS.TEXT_PRIMARY}`}>giải quyết bồi thường:</p>
                  <p className="text-[11px] leading-relaxed">{cs.solution}</p>
                </div>

                <p className="text-xs italic text-black pt-1">
                  "{cs.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-black block">số tiền bồi thường:</span>
                  <span className="font-extrabold text-black text-sm font-mono">{cs.payout}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-black block">tiến độ chi trả:</span>
                  <span className="font-bold text-black">{cs.timeframe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================
          7. FAQ SECTION
         ================================================================== */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-black">
            Giải đáp thắc mắc
          </span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>
            Câu Hỏi Thường Gặp Về Bảo Hiểm Xe Máy
          </h2>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl border overflow-hidden shadow-sm ${COLORS.SURFACE_WHITE}`}
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className={`w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-black ${COLORS.TEXT_PRIMARY_HOVER} transition-colors`}
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-black transition-transform shrink-0 ${
                    activeFaq === index ? `rotate-90 ${COLORS.TEXT_PRIMARY}` : ''
                  }`}
                />
              </button>
              {activeFaq === index && (
                <div className="px-4 sm:px-5 pb-4 pt-1 text-xs text-black/80 leading-relaxed border-t border-neutral-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================
          8. LEAD CAPTURE & CONSULTATION SECTION
         ================================================================== */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`rounded-3xl p-6 sm:p-10 border shadow-sm ${COLORS.SURFACE_WHITE}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                Tư vấn miễn phí 24/7
              </span>
              <h2 className={`text-xl sm:text-2xl font-extrabold leading-snug ${COLORS.TEXT_PRIMARY}`}>
                Bạn Cần Tư Vấn Gói Bảo Hiểm Phù Hợp Cho Xe Của Mình?
              </h2>
              <p className="text-xs text-black/80 leading-relaxed max-w-xl">
                Để lại số điện thoại, chuyên viên giám định MotoInsure sẽ liên hệ giải đáp chi tiết về quyền lợi bồi thường và hướng dẫn cấp chứng nhận trong 5 phút.
              </p>
            </div>

            <div className="lg:col-span-5">
              {consultationSuccess ? (
                <div className={`rounded-2xl p-5 text-center space-y-1.5 border ${COLORS.SURFACE_SUBTLE}`}>
                  <CheckCircle2 className={`w-8 h-8 mx-auto ${COLORS.TEXT_PRIMARY}`} />
                  <h4 className={`text-sm font-bold ${COLORS.TEXT_PRIMARY}`}>Yêu Cầu Đã Được Tiếp Nhận!</h4>
                  <p className="text-xs text-black/80">
                    Chuyên viên bảo hiểm sẽ gọi lại cho bạn qua số {consultationPhone} trong vòng 10 phút.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConsultationSubmit} className={`space-y-3 p-5 rounded-2xl border ${COLORS.SURFACE_SUBTLE}`}>
                  <div>
                    <input
                      type="text"
                      value={consultationName}
                      onChange={(e) => setConsultationName(e.target.value)}
                      placeholder="họ và tên của bạn"
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-neutral-300 text-black text-xs font-medium placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#4461F2]"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      value={consultationPhone}
                      onChange={(e) => setConsultationPhone(e.target.value)}
                      placeholder="số điện thoại nhận tư vấn *"
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-neutral-300 text-black text-xs font-medium placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#4461F2]"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full h-10 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${COLORS.BTN_PRIMARY}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi yêu cầu tư vấn ngay</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          9. FOOTER
         ================================================================== */}
      <footer className={`border-t pt-10 pb-8 px-4 sm:px-6 lg:px-8 ${COLORS.SURFACE_WHITE}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-neutral-200">
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden ${COLORS.BTN_PRIMARY}`}>
                <Settings className="w-4 h-4 absolute -bottom-1 -left-1 opacity-70 animate-[spin_16s_linear_infinite]" />
                <Wrench className="w-4 h-4 relative z-10 rotate-45 transform" />
              </div>
              <span className={`text-xl font-extrabold ${COLORS.TEXT_PRIMARY}`}>
                Bike Aid
              </span>
            </div>
            <p className="text-xs text-black/75 max-w-md leading-relaxed">
              Hệ thống Bảo hiểm & Cứu hộ Xe máy Toàn diện Bike Aid — Giới thiệu các gói bảo hiểm xe máy TNDS bắt buộc, vật chất hai chiều, tai nạn người ngồi và cam kết bảo lãnh bồi thường nhanh chóng 24/7.
            </p>
            <p className="text-xs text-black font-semibold pt-1">
              Hotline khẩn cấp & Giám định hiện trường: <strong className={COLORS.TEXT_PRIMARY}>1900 6868</strong>
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className={`font-extrabold uppercase tracking-wider ${COLORS.TEXT_PRIMARY}`}>
              Sản phẩm bảo hiểm
            </h4>
            <ul className="space-y-1.5 text-black/80">
              <li>Bảo hiểm TNDS Bắt buộc xe máy</li>
              <li>Bảo hiểm Vật chất xe máy hai chiều</li>
              <li>Bảo hiểm Tai nạn lái phụ xe</li>
              <li>Gói Kim Cương Cứu hộ 24/7</li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className={`font-extrabold uppercase tracking-wider ${COLORS.TEXT_PRIMARY}`}>
              Khách hàng & Cổng thông tin
            </h4>
            <ul className="space-y-1.5 text-black/80">
              <li>
                <button onClick={() => onNavigateAuth('login')} className={`${COLORS.TEXT_PRIMARY_HOVER} transition-colors font-medium`}>
                  Đăng nhập tài khoản
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateAuth('register')} className={`${COLORS.TEXT_PRIMARY_HOVER} transition-colors font-medium`}>
                  Đăng ký tài khoản thành viên
                </button>
              </li>
              <li>
                <span className="text-black/60">Tra cứu thẻ bảo hiểm (Trong hồ sơ)</span>
              </li>
              <li>
                <span className="text-black/60">Khai báo hồ sơ bồi thường (Trong hồ sơ)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-black/60 gap-2">
          <p>© 2026 Bike Aid Vietnam — Cứu hộ & Bảo hiểm xe máy thông minh, cam kết bồi thường đúng hạn.</p>
          <p>Tuân thủ Nghị định 67/2023/NĐ-CP của Chính phủ về Bảo hiểm Bắt buộc TNDS.</p>
        </div>
      </footer>
    </div>
  );
}