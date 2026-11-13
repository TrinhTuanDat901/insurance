import {
  UserAccount,
  InsurancePolicy,
  CompensationClaim,
  IncidentRecord,
  PaymentInvoice,
  VehicleItem
} from '../types';

export const INITIAL_USER: UserAccount = {
  id: 'usr_88201',
  email: 'nguyenvanan@gmail.com',
  fullName: 'Nguyễn Văn An',
  phone: '0918 456 789',
  role: 'CUSTOMER',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
};

export const STAFF_USER: UserAccount = {
  id: 'usr_staff_01',
  email: 'staff@gmail.com',
  fullName: 'Nguyễn Minh Quân',
  phone: '0903 128 456',
  role: 'STAFF'
};

export const MOTORBIKE_PACKAGES = [
  {
    id: 'COMPULSORY',
    name: 'Bảo hiểm TNDS Bắt buộc Xe máy',
    tagline: 'Tuân thủ Nghị định 67/2023/NĐ-CP của Chính phủ',
    highlightBadge: 'Bắt buộc pháp lý',
    basePrice: 66000,
    period: '1 năm',
    coveragePeople: '150.000.000 đ/người/vụ',
    coverageProperty: '50.000.000 đ/vụ',
    features: [
      'Chứng nhận điện tử tích hợp mã QR hợp chuẩn Cảnh sát giao thông',
      'Bồi thường thiệt hại về tính mạng, sức khỏe bên thứ ba đến 150 triệu đồng',
      'Bồi thường thiệt hại tài sản bên thứ ba đến 50 triệu đồng',
      'Khai báo tai nạn trực tuyến 24/7 không cần chờ giấy tờ',
      'Hỗ trợ tra cứu tức thì trên CSDL Quốc gia'
    ],
    recommendedFor: 'Tất cả các chủ phương tiện xe máy 2 bánh đang lưu thông.'
  },
  {
    id: 'COMPREHENSIVE',
    name: 'Bảo hiểm Toàn diện Vật chất Xe máy (2 Chiều)',
    tagline: 'Bảo vệ xe trước va chạm, cháy nổ, trộm cắp & ngập nước',
    highlightBadge: 'Bảo vệ tài sản tối đa',
    basePrice: 280000,
    period: '1 năm',
    coveragePeople: 'Bảo lãnh gara 100%',
    coverageProperty: 'Tối đa 100% giá trị xe thực tế',
    features: [
      'Bồi thường chi phí sửa chữa khi va chạm, té ngã, chìm ngập nước',
      'Bồi thường toàn bộ khi bị trộm cướp hoặc cháy nổ mất hoàn toàn',
      'Bảo lãnh sửa chữa tại hơn 350 gara chính hãng (Honda, Yamaha, Piaggio)',
      'Thay thế phụ tùng mới chính hãng 100% không trừ khấu hao',
      'Ứng tiền sửa chữa trực tiếp, khách hàng không cần ứng trước'
    ],
    recommendedFor: 'Xe tay ga cao cấp, xe mới mua, xe có giá trị trên 25 triệu đồng.'
  },
  {
    id: 'RIDER_ACCIDENT',
    name: 'Bảo hiểm Tai nạn Người ngồi trên xe',
    tagline: 'Bảo vệ tài chính cho người điều khiển và người ngồi sau',
    highlightBadge: 'An tâm con người',
    basePrice: 40000,
    period: '1 năm',
    coveragePeople: 'Đến 100.000.000 đ/người',
    coverageProperty: 'Hỗ trợ viện phí',
    features: [
      'Hỗ trợ chi phí cấp cứu và điều trị y tế sau tai nạn',
      'Chi trả thương tật toàn bộ hoặc bộ phận vĩnh viễn',
      'Áp dụng đồng thời cho cả người điều khiển xe và người ngồi sau',
      'Thủ tục hồ sơ y tế tinh gọn, nhận tiền bồi hoàn sau 48h',
      'Hỗ trợ chuyển viện và cứu thương khẩn cấp'
    ],
    recommendedFor: 'Người thường xuyên chở người thân, bạn bè, đối tác hoặc chạy xe công nghệ.'
  },
  {
    id: 'DIAMOND_ALL_IN_ONE',
    name: 'Gói Kim Cương 4-Trong-1 (Toàn diện + Cứu hộ 24/7)',
    tagline: 'Giải pháp bảo vệ vượt trội nhất — Tặng cứu hộ giao thông toàn quốc',
    highlightBadge: 'Lựa chọn phổ biến nhất',
    basePrice: 380000,
    period: '1 năm',
    coveragePeople: 'Bảo vệ toàn diện 360°',
    coverageProperty: 'TNDS + Vật chất + Con người',
    features: [
      'Gồm trọn vẹn 3 gói: TNDS Bắt buộc + Vật chất xe máy + Tai nạn người ngồi',
      'Tặng gói Cứu hộ khẩn cấp 24/7 toàn quốc không giới hạn số lần',
      'Cứu hộ vá vỏ tại chỗ, tiếp xăng khẩn cấp, kích bình ắc quy khi chết máy',
      'Xe cứu hộ chuyên dụng vận chuyển xe về trung tâm bảo hành khi tai nạn nặng',
      'Chuyên viên giám định bồi thường riêng hỗ trợ hồ sơ từ A đến Z'
    ],
    recommendedFor: 'Chủ xe mong muốn an tâm tuyệt đối trên mọi cung đường xuyên Việt.'
  }
];

export const INITIAL_POLICIES: InsurancePolicy[] = [
  {
    id: 'pol_001',
    cardNumber: 'IC-2026-88901',
    contractNumber: 'HD-2026-09812',
    holderName: 'Nguyễn Văn An',
    holderPhone: '0918 456 789',
    plateNumber: '29E2-456.78',
    vehicleModel: 'AirBlade 160 ABS',
    vehicleBrand: 'Honda',
    chassisNumber: 'RLHJF6320NZ109283',
    engineNumber: 'JF63E-1092831',
    packageType: 'DIAMOND_ALL_IN_ONE',
    packageName: 'Gói Kim Cương 4-Trong-1 (Toàn diện + Cứu hộ 24/7)',
    coverageAmount: '150.000.000 đ TNDS + 55.000.000 đ Vật chất xe',
    premiumPaid: 380000,
    effectiveFrom: '15/10/2026',
    effectiveTo: '14/10/2027',
    status: 'ACTIVE',
    statusLabel: 'Đang có hiệu lực',
    issuedAt: '15/10/2026 09:30',
    autoRenew: true
  },
  {
    id: 'pol_002',
    cardNumber: 'IC-2026-33019',
    contractNumber: 'HD-2026-03310',
    holderName: 'Nguyễn Văn An',
    holderPhone: '0918 456 789',
    plateNumber: '29B1-892.44',
    vehicleModel: 'SH 150i ABS Thể Thao',
    vehicleBrand: 'Honda',
    chassisNumber: 'RLHKF4910NZ882910',
    engineNumber: 'KF49E-8829103',
    packageType: 'COMPREHENSIVE',
    packageName: 'Bảo hiểm Toàn diện Vật chất Xe máy (2 Chiều)',
    coverageAmount: '110.000.000 đ Vật chất xe chính hãng',
    premiumPaid: 850000,
    effectiveFrom: '01/01/2026',
    effectiveTo: '31/12/2026',
    status: 'ACTIVE',
    statusLabel: 'Đang có hiệu lực',
    issuedAt: '01/01/2026 14:15',
    autoRenew: false
  },
  {
    id: 'pol_003',
    cardNumber: 'IC-2025-10234',
    contractNumber: 'HD-2025-01120',
    holderName: 'Nguyễn Văn An',
    holderPhone: '0918 456 789',
    plateNumber: '29X5-102.88',
    vehicleModel: 'Wave Alpha 110',
    vehicleBrand: 'Honda',
    chassisNumber: 'RLHJC4310MZ551029',
    engineNumber: 'JC43E-5510291',
    packageType: 'COMPULSORY',
    packageName: 'Bảo hiểm TNDS Bắt buộc Xe máy',
    coverageAmount: '150.000.000 đ/người/vụ',
    premiumPaid: 66000,
    effectiveFrom: '01/01/2025',
    effectiveTo: '31/12/2025',
    status: 'EXPIRED',
    statusLabel: 'Đã hết hạn',
    issuedAt: '01/01/2025 08:20',
    autoRenew: false
  }
];

export const INITIAL_CLAIMS: CompensationClaim[] = [
  {
    id: 'clm_101',
    claimCode: 'BT-2026-0042',
    policyCardNumber: 'IC-2026-88901',
    plateNumber: '29E2-456.78',
    incidentDate: '28/10/2026 17:45',
    incidentLocation: 'Ngã tư Nguyễn Trãi - Khuất Duy Tiến, Thanh Xuân, Hà Nội',
    incidentType: 'COLLISION',
    description: 'Va chạm với xe ô tô rẽ phải bất ngờ. Xe máy bị trầy xước dàn áo trước bên phải, vỡ gương chiếu hậu và cong gác chân.',
    estimatedDamage: 4500000,
    approvedAmount: 4500000,
    status: 'PAID',
    statusLabel: 'Đã chi trả bồi thường',
    bankName: 'Vietcombank',
    bankAccount: '0011002233445',
    bankOwner: 'NGUYEN VAN AN',
    submittedAt: '28/10/2026 18:30',
    handledByStaff: 'Trần Quốc Bảo',
    notes: 'Giám định viên đã đối chiếu hiện trường và hóa đơn gara Honda Thắng Lợi. Chi trả 100% bồi hoàn theo điều khoản gói Kim Cương.',
    payoutDate: '30/10/2026 10:15'
  },
  {
    id: 'clm_102',
    claimCode: 'BT-2026-0089',
    policyCardNumber: 'IC-2026-33019',
    plateNumber: '29B1-892.44',
    incidentDate: '04/11/2026 08:20',
    incidentLocation: 'Tuyến đường ngập sâu Phố Thái Hà, Đống Đa, Hà Nội',
    incidentType: 'FLOOD',
    description: 'Xe bị ngập nước thủy kích khi triều cường dâng cao do mưa lớn. Động cơ bị chết máy, dầu nhớt vào buồng đốt cần đại tu.',
    estimatedDamage: 3200000,
    approvedAmount: 3200000,
    status: 'INSPECTION',
    statusLabel: 'Đang bảo lãnh sửa chữa tại Gara',
    bankName: 'Vietcombank',
    bankAccount: '0011002233445',
    bankOwner: 'NGUYEN VAN AN',
    submittedAt: '04/11/2026 09:10',
    handledByStaff: 'Lê Hoàng Nam',
    notes: 'Đã phát lệnh bảo lãnh trực tiếp tại Head Honda Kường Ngân. Khách hàng không cần thanh toán tiền mặt tại xưởng.'
  }
];

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: 'inc_01',
    date: '04/11/2026',
    plateNumber: '29B1-892.44',
    title: 'Sự cố ngập nước chết máy cục bộ',
    location: 'Thái Hà, Đống Đa, Hà Nội',
    severity: 'MODERATE',
    rescueDispatched: true,
    rescueDetails: 'Xe cẩu cứu hộ MotoInsure có mặt sau 25 phút, chuyển xe về Head Honda an toàn.',
    settlementStatus: 'PENDING'
  },
  {
    id: 'inc_02',
    date: '28/10/2026',
    plateNumber: '29E2-456.78',
    title: 'Va chạm giao thông ngã tư giờ cao điểm',
    location: 'Khuất Duy Tiến, Thanh Xuân, Hà Nội',
    severity: 'LIGHT',
    rescueDispatched: false,
    rescueDetails: 'Xe tự lăn bánh được, giám định viên hướng dẫn chụp ảnh hiện trường qua app.',
    settlementStatus: 'COMPLETED'
  },
  {
    id: 'inc_03',
    date: '12/08/2026',
    plateNumber: '29E2-456.78',
    title: 'Thủng lốp trên đường cao tốc Láng Hòa Lạc',
    location: 'Km 14 Đại lộ Thăng Long, Hà Nội',
    severity: 'LIGHT',
    rescueDispatched: true,
    rescueDetails: 'Đội cứu hộ vá lốp và bơm khí lưu động tại chỗ miễn phí theo gói Kim Cương.',
    settlementStatus: 'COMPLETED'
  }
];

export const INITIAL_INVOICES: PaymentInvoice[] = [
  {
    id: 'inv_01',
    invoiceCode: 'HD-2026-9812-EINV',
    contractNumber: 'HD-2026-09812',
    packageName: 'Gói Kim Cương 4-Trong-1 (Toàn diện + Cứu hộ 24/7)',
    plateNumber: '29E2-456.78',
    amount: 380000,
    paymentDate: '15/10/2026 09:32',
    paymentMethod: 'VNPAY',
    status: 'PAID'
  },
  {
    id: 'inv_02',
    invoiceCode: 'HD-2026-3310-EINV',
    contractNumber: 'HD-2026-03310',
    packageName: 'Bảo hiểm Toàn diện Vật chất Xe máy (2 Chiều)',
    plateNumber: '29B1-892.44',
    amount: 850000,
    paymentDate: '01/01/2026 14:18',
    paymentMethod: 'BANK_TRANSFER',
    status: 'PAID'
  }
];

export const USER_VEHICLES: VehicleItem[] = [
  {
    id: 'veh_01',
    plateNumber: '29E2-456.78',
    brand: 'Honda',
    model: 'AirBlade 160 ABS',
    engineCapacity: '156.9 cc',
    manufactureYear: 2023,
    chassisNumber: 'RLHJF6320NZ109283',
    engineNumber: 'JF63E-1092831',
    hasActiveInsurance: true,
    activeCardNumber: 'IC-2026-88901'
  },
  {
    id: 'veh_02',
    plateNumber: '29B1-892.44',
    brand: 'Honda',
    model: 'SH 150i ABS Thể Thao',
    engineCapacity: '156.9 cc',
    manufactureYear: 2024,
    chassisNumber: 'RLHKF4910NZ882910',
    engineNumber: 'KF49E-8829103',
    hasActiveInsurance: true,
    activeCardNumber: 'IC-2026-33019'
  },
  {
    id: 'veh_03',
    plateNumber: '29X5-102.88',
    brand: 'Honda',
    model: 'Wave Alpha 110',
    engineCapacity: '109.1 cc',
    manufactureYear: 2021,
    chassisNumber: 'RLHJC4310MZ551029',
    engineNumber: 'JC43E-5510291',
    hasActiveInsurance: false
  }
];

export const CASE_STUDIES = [
  {
    id: 'cs-1',
    title: 'Va chạm giao thông giờ tan tầm tại Ngã tư Hàng Xanh',
    rider: 'Anh Nguyễn Minh Tuấn',
    vehicle: 'Honda SH 150i ABS',
    plate: '59F2-348.91',
    incident: 'Xe ô tô tải quẹt vào sườn xe khi chuyển làn, làm vỡ yếm và gãy phuộc trước.',
    solution: 'Khai báo online tại hiện trường trong 10 phút. MotoInsure liên hệ điều xe cẩu cứu hộ về Head Honda Phát Tiến.',
    payout: '18.450.000 đ',
    timeframe: 'Chi trả trong 36 giờ',
    quote: 'Tôi rất bất ngờ vì không phải ứng tiền trước cho gara. Giám định viên làm việc trực tiếp với xưởng và xe được giao về tận nhà sau khi hoàn thiện.'
  },
  {
    id: 'cs-2',
    title: 'Ngập nước thủy kích nặng trong đêm mưa triều cường',
    rider: 'Chị Đặng Thị Mai Anh',
    vehicle: 'Yamaha Grande Hybrid',
    plate: '29C1-772.18',
    incident: 'Đường ngập sâu 60cm, xe chết máy giữa đường và không thể khởi động lại.',
    solution: 'Đội cứu hộ 24/7 đến đón khách và đưa xe về trung tâm kỹ thuật kiểm tra xả nước, thay dầu hộp số và đại tu lốc máy.',
    payout: '6.800.000 đ',
    timeframe: 'Bồi thường 100% trong 24 giờ',
    quote: 'Là phụ nữ đi làm về khuya gặp mưa ngập tôi rất hoang mang. Nhờ gói cứu hộ MotoInsure, đội kỹ thuật có mặt rất nhanh và bồi thường sòng phẳng.'
  },
  {
    id: 'cs-3',
    title: 'Tai nạn trượt ngã trên đèo Hải Vân khi đi phượt',
    rider: 'Anh Hoàng Đức Nam',
    vehicle: 'Yamaha Exciter 155',
    plate: '43D1-662.90',
    incident: 'Đường trơn trượt mưa phùn, người lái ngã dẫn đến chấn thương gãy xương cổ tay.',
    solution: 'Kích hoạt đồng thời bảo hiểm vật chất xe máy và bảo hiểm tai nạn con người. Chi trả toàn bộ viện phí tại BV Đa khoa Đà Nẵng.',
    payout: '38.200.000 đ',
    timeframe: 'Bảo lãnh viện phí trực tiếp',
    quote: 'Điều tuyệt vời nhất là gia đình tôi không phải lo chi phí cấp cứu. Mọi thủ tục đều được nhân viên bảo hiểm hướng dẫn từ xa qua Zalo chu đáo.'
  }
];

export const GUARANTEE_POINTS = [
  {
    number: '01',
    title: 'Cam Kết Bồi Thường 100% Khi Gặp Tai Nạn Hợp Lệ',
    description: 'Chỉ cần tai nạn xảy ra trong thời hạn bảo hiểm còn hiệu lực và không vi phạm điều khoản cấm, chúng tôi cam kết chi trả đầy đủ, minh bạch và chính xác theo mức bảo vệ đã thỏa thuận.'
  },
  {
    number: '02',
    title: 'Thẩm Định Hiện Trường Siêu Tốc 24/7',
    description: 'Không cần giữ nguyên hiện trường hàng giờ gây ách tắc giao thông. Chủ xe chỉ cần chụp ảnh hiện trường qua ứng dụng web, giám định viên sẽ kết nối và xử lý ngay.'
  },
  {
    number: '03',
    title: 'Bảo Lãnh Sửa Chữa Tại 350+ Gara Chính Hãng',
    description: 'Liên kết trực tiếp với hệ thống Head Honda, Yamaha Town, Piaggio Topcom và các xưởng sửa chữa uy tín trên 63 tỉnh thành. Khách hàng không cần bỏ tiền túi ứng trước.'
  },
  {
    number: '04',
    title: 'Chi Trả Chuyển Khoản Tức Thì Trong 48 Giờ',
    description: 'Ngay khi hồ sơ bồi thường được ký duyệt, tiền bảo hiểm sẽ được chuyển thẳng về tài khoản ngân hàng của chủ xe mà không phải đến quầy làm thủ tục giấy tờ.'
  }
];
