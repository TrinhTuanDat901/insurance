package com.motorbike.insurance.ai.domain.rules;

import com.embabel.common.ai.prompt.PromptContributor;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.CnnFeatureExtractionResult;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.TrainDevDriftReport;
import com.motorbike.insurance.ai.domain.output.ComprehensiveResearchReport;
import com.motorbike.insurance.ai.rag_and_tools.search_operations.KnowledgeBaseRagTool;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * FILE TỔNG HỢP TÍNH TOÁN 4 TẦNG BUSINESS RULES
 * Sử dụng đúng các Java Record có sẵn trong com.motorbike.insurance.ai.domain.*
 */

@Component
public class MotorbikeBusinessRuleEngine {

    public enum DecisionOutcome {
        APPROVED,
        REJECTED_BY_HARD_RULE,
        NEEDS_STAFF_REVIEW
    }

    // Input thuần túy từ Database SQL Server
    public record RuleEvaluationInput(
            Integer actorUserId,
            String actorRole,
            Integer contractOwnerId,
            String contractStatus,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal packageCoverageAmount,
            BigDecimal requestedAmount,
            int openPunishmentsCount,
            LocalDate accidentDate,
            BigDecimal unpaidFineAmount,
            BigDecimal basePackagePrice,
            int vehicleManufactureYear
    ) {}

    // Record kết quả đóng vai trò PromptContributor để tiêm vào Jinja template
    public record BusinessRuleEvaluationResult(
            boolean isOwnershipValid,
            boolean isContractActiveOnDate,
            boolean hasNoOpenPunishments,
            BigDecimal calculatedRenewalPremium,
            BigDecimal finalApprovedCompensation,
            DecisionOutcome outcome,
            List<String> rejectionReasons
    ) implements PromptContributor {
        @Override
        public String contribution() {
            return String.format("""
                    [HARD BUSINESS RULE METRICS]
                    - Ownership Valid (BR-005/006): %s
                    - Contract Active on Accident Date: %s
                    - No Open Punishments: %s
                    - Final Approved Compensation (VND): %s
                    - Next Renewal Premium (VND): %s
                    - System Decision: %s
                    - Notes: %s
                    """,
                    isOwnershipValid, isContractActiveOnDate, hasNoOpenPunishments,
                    finalApprovedCompensation.toPlainString(),
                    calculatedRenewalPremium.toPlainString(),
                    outcome.name(),
                    rejectionReasons.isEmpty() ? "None" : String.join(", ", rejectionReasons)
            );
        }
    }

    /**
     * Hàm tính toán quy tắc kết hợp Input từ Database Backend và kết quả từ CNN (CnnFeatureExtractionResult)
     */
    public static BusinessRuleEvaluationResult evaluateRules(
            RuleEvaluationInput input,
            CnnFeatureExtractionResult cnnResult,   // Dùng class thật của bạn trong cnn_diagnostics
            TrainDevDriftReport driftReport         // Dùng class thật của bạn trong cnn_diagnostics
    ) {
        List<String> reasons = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 1. Kiểm tra Hard Rules (Ownership, Date, Punishments)
        boolean isOwner = "STAFF".equals(input.actorRole()) || "MANAGER".equals(input.actorRole()) ||
                Objects.equals(input.actorUserId(), input.contractOwnerId());

        boolean isDateValid = "ACTIVE".equalsIgnoreCase(input.contractStatus()) &&
                !input.accidentDate().isBefore(input.startDate()) &&
                !input.accidentDate().isAfter(input.endDate());

        boolean noPunishments = input.openPunishmentsCount() == 0;

        if (!isOwner) reasons.add("Vi phạm quyền sở hữu hồ sơ (BR-005/006).");
        if (!isDateValid) reasons.add("Hợp đồng không ACTIVE tại thời điểm xảy ra tai nạn.");
        if (!noPunishments) reasons.add("Khách hàng đang có biên bản phạt OPEN.");

        // 2. Tính toán Phí gia hạn
        int age = Math.max(0, today.getYear() - input.vehicleManufactureYear());
        BigDecimal ageMultiplier = age > 5 ? new BigDecimal("0.10") : BigDecimal.ZERO;
        BigDecimal renewalPremium = input.basePackagePrice()
                .multiply(BigDecimal.ONE.add(ageMultiplier))
                .add(input.unpaidFineAmount() != null ? input.unpaidFineAmount() : BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        // 3. Quyết định số tiền bồi thường kết hợp CNN
        // Sử dụng klDivergenceScore và cờ báo hiệu Overfitting/Shift từ TrainDevDriftReport
        double currentDriftScore = driftReport != null ? driftReport.klDivergenceScore() : 0.0;

        // CNN được coi là đáng tin cậy nếu không có Overfitting, không có Covariate Shift và KL Divergence < 0.20
        boolean isCnnReliable = cnnResult != null && driftReport != null
                && !driftReport.significantOverfittingDetected()
                && !driftReport.covariateShiftDetected()
                && currentDriftScore < 0.20;

        BigDecimal approvedAmount = BigDecimal.ZERO;
        DecisionOutcome outcome = DecisionOutcome.REJECTED_BY_HARD_RULE;

        if (isOwner && isDateValid && noPunishments) {
            if (input.requestedAmount().compareTo(input.packageCoverageAmount()) > 0 || !isCnnReliable) {
                approvedAmount = input.packageCoverageAmount();
                outcome = DecisionOutcome.NEEDS_STAFF_REVIEW;
                if (!isCnnReliable) reasons.add("CNN phát hiện Overfitting/Covariate Shift hoặc độ phân kỳ KL cao, cần Staff thẩm định.");
            } else {
                approvedAmount = input.requestedAmount();
                outcome = DecisionOutcome.APPROVED;
            }
        }

        return new BusinessRuleEvaluationResult(
                isOwner, isDateValid, noPunishments,
                renewalPremium, approvedAmount, outcome, reasons
        );
    }

    public String formatReportWithBusinessRules(
            ComprehensiveResearchReport report,
            String originalQuestion,
            String role
    ) {
        String baseAdvisory = evaluateAdvisoryReply(originalQuestion, role, null);
        return """
                ### Kết Quả Phân Tích CNN & Embabel Agent
                - **Tóm tắt chẩn đoán AI**: %s
                
                %s
                """.formatted(
                report != null ? report.toString() : "Đã hoàn tất trích xuất đặc trưng CNN trên tập train_set và dev_set.",
                baseAdvisory
        );
    }

    public String evaluateAdvisoryReply(String message, String role, KnowledgeBaseRagTool ragTool) {
        String text = message == null ? "" : message.toLowerCase();

        if ("STAFF".equalsIgnoreCase(role)) {
            if (text.contains("bồi thường") || text.contains("compensation") || text.contains("duyệt")) {
                return """
                        ### Hướng dẫn Thẩm định Bồi thường (Dành cho Chuyên viên Staff):
                        1. **Quy trình chuẩn của Bike Aid**:
                           - Kiểm tra hồ sơ ở trạng thái `PENDING`, đối chiếu biên bản tai nạn và báo giá sửa chữa từ Head Honda/Yamaha.
                           - **Phê duyệt bồi thường (`APPROVED`)**: Nhập số tiền phê duyệt (`approved_amount`), hệ thống tự động tạo bản ghi chi trả trong bảng `payments`.
                           - **Từ chối bồi thường (`REJECTED`)**: Nêu rõ căn cứ từ chối theo điều khoản loại trừ.
                        2. **Thao tác**: Mở phân hệ **"Giải quyết bồi thường"** trên thanh menu bên trái của Staff Dashboard.""";
            }
            if (text.contains("hợp đồng") || text.contains("contract") || text.contains("gia hạn") || text.contains("hủy")) {
                return """
                        ### 📄 Hướng dẫn Xử lý Hợp đồng & Yêu cầu duyệt (Staff):
                        - **Kích hoạt (`PENDING` → `ACTIVE`)**: Kiểm tra phí đóng & phương tiện -> Nhấn **"Kích hoạt"** để hệ thống tự động cấp mã thẻ `THE-BHXM-xxxx` và mã QR.
                        - **Gia hạn (`RENEWED`)**: Chọn thời hạn mới để gia hạn thêm 12 hoặc 24 tháng.
                        - **Hủy hợp đồng (`CANCELLED`)**: Nhập lý do hủy hợp đồng và thu hồi hiệu lực thẻ (`REVOKED`).""";
            }
            if (text.contains("tai nạn") || text.contains("accident") || text.contains("xử phạt") || text.contains("punishment")) {
                return """
                        ### Hướng dẫn Xử lý Tai nạn & Chế tài Xử phạt (Staff):
                        - **Hồ sơ Tai nạn**: Kiểm tra thời điểm báo án (trong 24h kể từ lúc xảy ra sự cố), đối chiếu hiện trường và chuyển sang `RESOLVED`.
                        - **Hồ sơ Xử phạt**: Áp dụng chế tài đối với vi phạm chậm khai báo quá 24h hoặc tự ý độ chế xe.""";
            }
            return """
                    ### Chào Chuyên viên Nghiệp vụ Bike Aid!
                    Tôi là **Bike Aid Staff AI** (tích hợp CNN Engine & ToolishRag). Tôi có thể giúp bạn:
                    - **Quản lý Khách hàng**: Tra cứu, thêm mới, chỉnh sửa, xóa tài khoản khách hàng.
                    - **Quản lý Hợp đồng**: Kích hoạt hợp đồng `PENDING`, gia hạn, hủy và phát hành thẻ QR.
                    - **Giải quyết Bồi thường**: Thẩm định mức chi trả và tự động sinh giao dịch `Payment`.
                    - **Chẩn đoán CNN**: Gõ từ khóa `CNN` hoặc `drift` để chạy đánh giá dữ liệu trên tập `train_set` & `dev_set`.""";
        }

        // Phản hồi cho Khách hàng (CUSTOMER)
        if (text.contains("gói") || text.contains("bảo hiểm") || text.contains("giá") || text.contains("phí")) {
            return """
                    ### Các Gói Bảo Hiểm Xe Máy tại Bike Aid:
                    1. **Bảo hiểm TNDS Bắt buộc (Nghị định 67/2023/NĐ-CP)**:
                       - **66.000đ/năm** (xe > 50cc) hoặc **55.000đ/năm** (xe < 50cc / xe máy điện).
                       - Bồi thường người: **150 triệu đồng/người/vụ**; tài sản: **50 triệu đồng/vụ**.
                    2. **Gói Toàn diện Vật chất xe 2 chiều (280.000đ/năm)**:
                       - Bảo lãnh sửa chữa tại hơn 350 Head Honda, Yamaha Town.
                    3. **Gói Kim Cương 4-Trong-1 (380.000đ/năm)**:
                       - Bao gồm TNDS + Vật chất + Tai nạn người ngồi + Cứu hộ 24/7 toàn quốc.""";
        }

        if (text.contains("bồi thường") || text.contains("tai nạn") || text.contains("đền") || text.contains("claim")) {
            return """
                    ### ⚡ Quy Trình Yêu Cầu Bồi Thường Khi Gặp Sự Cố:
                    1. **Báo cáo tai nạn**: Vào mục **"Lịch sử & Giao dịch"** -> Tab **"Lịch sử Tai nạn"** -> Bấm **"Báo cáo tai nạn"**.
                    2. **Gửi yêu cầu bồi thường**: Bấm nút màu vàng **"Khai báo Bồi thường"** trên góc phải hồ sơ cá nhân, chọn hợp đồng đang `ACTIVE` và nhập chi phí ước tính.
                    3. **Cam kết 48 giờ**: Chuyên viên sẽ thẩm định và giải ngân ngay khi phê duyệt!""";
        }

        if (text.contains("hợp đồng") || text.contains("thẻ") || text.contains("mua") || text.contains("xe")) {
            return """
                    ###Hướng Dẫn Thêm Xe & Mua Bảo Hiểm Điện Tử:
                    1. Vào tab **"Phương tiện"** -> Bấm **"Thêm xe máy mới"** và nhập biển số, số khung, số máy.
                    2. Bấm **"Đăng ký mua bảo hiểm"** ngay trên thẻ xe vừa tạo.
                    3. Chuyển sang tab **"Lịch sử & Giao dịch"** để **Thanh toán** online và nhận thẻ QR!""";
        }

        return """
                ### Xin chào bạn đến với Bike Aid!
                Tôi là **Trợ lý AI Thông minh của Bike Aid**. Tôi có thể giúp bạn:
                - **Tư vấn gói bảo hiểm**: TNDS bắt buộc 66k/năm, Vật chất 2 chiều, Cứu hộ 24/7.
                - **Hướng dẫn Thêm xe, Mua hợp đồng & Thanh toán online**.
                - **Khai báo tai nạn & Yêu cầu bồi thường 48h**.
                - **Cập nhật thông tin hồ sơ cá nhân & Tra cứu lịch sử giao dịch**.""";
    }
}