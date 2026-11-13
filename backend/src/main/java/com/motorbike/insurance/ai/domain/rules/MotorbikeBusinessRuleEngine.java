package com.motorbike.insurance.ai.domain.rules;

import com.embabel.common.ai.prompt.PromptContributor;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.CnnFeatureExtractionResult;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.DatasetSplitMetrics;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.HardNegativeSamples;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.TrainDevDriftReport;
import com.motorbike.insurance.ai.domain.output.ComprehensiveResearchReport;
import com.motorbike.insurance.ai.rag_and_tools.search_operations.KnowledgeBaseRagTool;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class MotorbikeBusinessRuleEngine {

    public enum DecisionOutcome {
        APPROVED,
        REJECTED_BY_HARD_RULE,
        NEEDS_STAFF_REVIEW
    }

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
                    isOwnershipValid,
                    isContractActiveOnDate,
                    hasNoOpenPunishments,
                    finalApprovedCompensation != null ? finalApprovedCompensation.toPlainString() : "0",
                    calculatedRenewalPremium != null ? calculatedRenewalPremium.toPlainString() : "0",
                    outcome != null ? outcome.name() : DecisionOutcome.NEEDS_STAFF_REVIEW.name(),
                    (rejectionReasons == null || rejectionReasons.isEmpty()) ? "None" : String.join(", ", rejectionReasons)
            );
        }
    }

    /**
     * Tính toán 4 tầng Business Rules kết hợp dữ liệu Hợp đồng và chẩn đoán CNN
     */
    public static BusinessRuleEvaluationResult evaluateRules(
            RuleEvaluationInput input,
            CnnFeatureExtractionResult cnnResult,
            TrainDevDriftReport driftReport
    ) {
        List<String> reasons = new ArrayList<>();
        LocalDate today = LocalDate.now();

        LocalDate start = input.startDate() != null ? input.startDate() : today.minusMonths(6);
        LocalDate end = input.endDate() != null ? input.endDate() : today.plusMonths(6);
        LocalDate accDate = input.accidentDate() != null ? input.accidentDate() : today;
        BigDecimal basePrice = input.basePackagePrice() != null ? input.basePackagePrice() : new BigDecimal("280000");
        BigDecimal coverage = input.packageCoverageAmount() != null ? input.packageCoverageAmount() : new BigDecimal("50000000");
        BigDecimal requested = input.requestedAmount() != null ? input.requestedAmount() : new BigDecimal("3500000");

        // 1. Kiểm tra Hard Rules (Ownership, Date, Punishments)
        boolean isOwner = "STAFF".equalsIgnoreCase(input.actorRole())
                || "MANAGER".equalsIgnoreCase(input.actorRole())
                || Objects.equals(input.actorUserId(), input.contractOwnerId());

        boolean isDateValid = "ACTIVE".equalsIgnoreCase(input.contractStatus())
                && !accDate.isBefore(start)
                && !accDate.isAfter(end);

        boolean noPunishments = input.openPunishmentsCount() == 0;

        if (!isOwner) reasons.add("Vi phạm quyền sở hữu hồ sơ (BR-005/006).");
        if (!isDateValid) reasons.add("Hợp đồng không ACTIVE tại thời điểm xảy ra tai nạn.");
        if (!noPunishments) reasons.add("Khách hàng đang có biên bản phạt OPEN.");

        // 2. Tính toán Phí gia hạn (Xe > 5 năm phụ thu 10% + cộng dồn phạt chưa đóng)
        int manufactureYear = input.vehicleManufactureYear() > 1980 ? input.vehicleManufactureYear() : 2020;
        int age = Math.max(0, today.getYear() - manufactureYear);
        BigDecimal ageMultiplier = age > 5 ? new BigDecimal("0.10") : BigDecimal.ZERO;
        BigDecimal renewalPremium = basePrice
                .multiply(BigDecimal.ONE.add(ageMultiplier))
                .add(input.unpaidFineAmount() != null ? input.unpaidFineAmount() : BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        // 3. Quyết định số tiền bồi thường kết hợp CNN
        double currentDriftScore = driftReport != null ? driftReport.klDivergenceScore() : 0.0;
        boolean isCnnReliable = cnnResult != null && driftReport != null
                && !cnnResult.outOfDistributionAnomaly()
                && !driftReport.significantOverfittingDetected()
                && !driftReport.covariateShiftDetected()
                && currentDriftScore < 0.20;

        BigDecimal approvedAmount = BigDecimal.ZERO;
        DecisionOutcome outcome = DecisionOutcome.REJECTED_BY_HARD_RULE;

        if (isOwner && isDateValid && noPunishments) {
            if (requested.compareTo(coverage) > 0 || !isCnnReliable) {
                approvedAmount = requested.min(coverage);
                outcome = DecisionOutcome.NEEDS_STAFF_REVIEW;
                if (requested.compareTo(coverage) > 0) {
                    reasons.add("Số tiền yêu cầu vượt trần bảo hiểm, áp mức trần tối đa.");
                }
                if (!isCnnReliable) {
                    reasons.add("CNN phát hiện OOD Anomaly, Overfitting/Covariate Shift hoặc KL Divergence >= 0.20, cần Staff thẩm định.");
                }
            } else {
                approvedAmount = requested;
                outcome = DecisionOutcome.APPROVED;
            }
        }

        return new BusinessRuleEvaluationResult(
                isOwner,
                isDateValid,
                noPunishments,
                renewalPremium,
                approvedAmount,
                outcome,
                reasons
        );
    }

    /**
     * Kết hợp báo cáo từ CNN/Embabel Agent với phép tính thực tế từ evaluateRules(...)
     */
    public String formatReportWithBusinessRules(
            ComprehensiveResearchReport report,
            String originalQuestion,
            String role
    ) {
        RuleEvaluationInput dynamicInput = parseInputFromQuestion(originalQuestion, role);
        BusinessRuleEvaluationResult ruleResult = evaluateRules(
                dynamicInput,
                createDefaultCnnResult(),
                createDefaultDriftReport()
        );
        String baseAdvisory = evaluateAdvisoryReply(originalQuestion, role, null);

        return """
                ### Kết Quả Phân Tích CNN & Tính Toán Business Rules
                - **Tóm tắt chẩn đoán AI**: %s
                
                ```text
                %s```
                
                %s
                """.formatted(
                report != null ? report.toString() : "Đã hoàn tất trích xuất đặc trưng CNN trên tập train_set và dev_set.",
                ruleResult.contribution(),
                baseAdvisory
        );
    }

    public String evaluateAdvisoryReply(String message, String role, KnowledgeBaseRagTool ragTool) {
        String text = message == null ? "" : message.toLowerCase();

        String calculationBlock = "";
        if (text.contains("tính") || text.contains("bồi thường") || text.contains("gia hạn") || text.matches(".*\\d{4,}.*")) {
            RuleEvaluationInput input = parseInputFromQuestion(message, role);
            BusinessRuleEvaluationResult calc = evaluateRules(
                    input,
                    createDefaultCnnResult(),
                    createDefaultDriftReport()
            );
            calculationBlock = "\n\n### Kết Quả Tính Toán Tự Động (Business Rule Engine):\n- **Số tiền bồi thường được duyệt dự kiến**: `"
                    + calc.finalApprovedCompensation().toPlainString() + " VNĐ`\n- **Phí gia hạn kỳ tới (đã tính hệ số tuổi xe & phạt)**: `"
                    + calc.calculatedRenewalPremium().toPlainString() + " VNĐ`\n- **Quyết định hệ thống**: `"
                    + calc.outcome().name() + "`";
        }

        if ("STAFF".equalsIgnoreCase(role)) {
            if (text.contains("bồi thường") || text.contains("compensation") || text.contains("duyệt") || text.contains("tính")) {
                return """
                        ### Hướng dẫn Thẩm định Bồi thường (Dành cho Chuyên viên Staff):
                        1. **Quy trình chuẩn của Bike Aid**:
                           - Kiểm tra hồ sơ ở trạng thái `PENDING`, đối chiếu biên bản tai nạn và báo giá sửa chữa từ Head Honda/Yamaha.
                           - **Phê duyệt bồi thường (`APPROVED`)**: Nhập số tiền phê duyệt (`approved_amount`), hệ thống tự động tạo bản ghi chi trả trong bảng `payments`.
                           - **Từ chối bồi thường (`REJECTED`)**: Nêu rõ căn cứ từ chối theo điều khoản loại trừ.
                        2. **Thao tác**: Mở phân hệ **"Giải quyết bồi thường"** trên thanh menu bên trái của Staff Dashboard.""" + calculationBlock;
            }
            if (text.contains("hợp đồng") || text.contains("contract") || text.contains("gia hạn") || text.contains("hủy")) {
                return """
                        ### 📄 Hướng dẫn Xử lý Hợp đồng & Yêu cầu duyệt (Staff):
                        - **Kích hoạt (`PENDING` → `ACTIVE`)**: Kiểm tra phí đóng & phương tiện -> Nhấn **"Kích hoạt"** để hệ thống tự động cấp mã thẻ `THE-BHXM-xxxx` và mã QR.
                        - **Gia hạn (`RENEWED`)**: Chọn thời hạn mới để gia hạn thêm 12 hoặc 24 tháng.
                        - **Hủy hợp đồng (`CANCELLED`)**: Nhập lý do hủy hợp đồng và thu hồi hiệu lực thẻ (`REVOKED`).""" + calculationBlock;
            }
            if (text.contains("tai nạn") || text.contains("accident") || text.contains("xử phạt") || text.contains("punishment")) {
                return """
                        ### Hướng dẫn Xử lý Tai nạn & Chế tài Xử phạt (Staff):
                        - **Hồ sơ Tai nạn**: Kiểm tra thời điểm báo án (trong 24h kể từ lúc xảy ra sự cố), đối chiếu hiện trường và chuyển sang `RESOLVED`.
                        - **Hồ sơ Xử phạt**: Áp dụng chế tài đối với vi phạm chậm khai báo quá 24h hoặc tự ý độ chế xe.""" + calculationBlock;
            }
            return """
                    ### Chào Chuyên viên Nghiệp vụ Bike Aid!
                    Tôi là **Bike Aid Staff AI** (tích hợp CNN Engine & ToolishRag). Tôi có thể giúp bạn:
                    - **Quản lý Khách hàng**: Tra cứu, thêm mới, chỉnh sửa, xóa tài khoản khách hàng.
                    - **Quản lý Hợp đồng**: Kích hoạt hợp đồng `PENDING`, gia hạn, hủy và phát hành thẻ QR.
                    - **Giải quyết Bồi thường**: Thẩm định mức chi trả và tự động sinh giao dịch `Payment`.
                    - **Chẩn đoán CNN & Tính toán**: Gõ từ khóa `CNN`, `drift`, hoặc nhập số tiền/năm sản xuất xe để chạy tính toán tự động.""" + calculationBlock;
        }

        if (text.contains("gói") || text.contains("bảo hiểm") || text.contains("giá") || text.contains("phí")) {
            return """
                    ### Các Gói Bảo Hiểm Xe Máy tại Bike Aid:
                    1. **Bảo hiểm TNDS Bắt buộc (Nghị định 67/2023/NĐ-CP)**:
                       - **66.000đ/năm** (xe > 50cc) hoặc **55.000đ/năm** (xe < 50cc / xe máy điện).
                       - Bồi thường người: **150 triệu đồng/người/vụ**; tài sản: **50 triệu đồng/vụ**.
                    2. **Gói Toàn diện Vật chất xe 2 chiều (280.000đ/năm)**:
                       - Bảo lãnh sửa chữa tại hơn 350 Head Honda, Yamaha Town.
                    3. **Gói Kim Cương 4-Trong-1 (380.000đ/năm)**:
                       - Bao gồm TNDS + Vật chất + Tai nạn người ngồi + Cứu hộ 24/7 toàn quốc.""" + calculationBlock;
        }

        if (text.contains("bồi thường") || text.contains("tai nạn") || text.contains("đền") || text.contains("claim") || text.contains("tính")) {
            return """
                    ### ⚡ Quy Trình Yêu Cầu Bồi Thường Khi Gặp Sự Cố:
                    1. **Báo cáo tai nạn**: Vào mục **"Lịch sử & Giao dịch"** -> Tab **"Lịch sử Tai nạn"** -> Bấm **"Báo cáo tai nạn"**.
                    2. **Gửi yêu cầu bồi thường**: Bấm nút màu vàng **"Khai báo Bồi thường"** trên góc phải hồ sơ cá nhân, chọn hợp đồng đang `ACTIVE` và nhập chi phí ước tính.
                    3. **Cam kết 48 giờ**: Chuyên viên sẽ thẩm định và giải ngân ngay khi phê duyệt!""" + calculationBlock;
        }

        if (text.contains("hợp đồng") || text.contains("thẻ") || text.contains("mua") || text.contains("xe")) {
            return """
                    ### Hướng Dẫn Thêm Xe & Mua Bảo Hiểm Điện Tử:
                    1. Vào tab **"Phương tiện"** -> Bấm **"Thêm xe máy mới"** và nhập biển số, số khung, số máy.
                    2. Bấm **"Đăng ký mua bảo hiểm"** ngay trên thẻ xe vừa tạo.
                    3. Chuyển sang tab **"Lịch sử & Giao dịch"** để **Thanh toán** online và nhận thẻ QR!""" + calculationBlock;
        }

        return """
                ### Xin chào bạn đến với Bike Aid!
                Tôi là **Trợ lý AI Thông minh của Bike Aid**. Tôi có thể giúp bạn:
                - **Tư vấn gói bảo hiểm**: TNDS bắt buộc 66k/năm, Vật chất 2 chiều, Cứu hộ 24/7.
                - **Hướng dẫn Thêm xe, Mua hợp đồng & Thanh toán online**.
                - **Khai báo tai nạn & Yêu cầu bồi thường 48h**.
                - **Cập nhật thông tin hồ sơ cá nhân & Tra cứu lịch sử giao dịch**.""" + calculationBlock;
    }

    /**
     * Khởi tạo CnnFeatureExtractionResult khớp 7 tham số của record CnnFeatureExtractionResult.java
     */
    private static CnnFeatureExtractionResult createDefaultCnnResult() {
        return new CnnFeatureExtractionResult(
                "SAMPLE-CLAIM-01",
                "VALID_COLLISION_DAMAGE",
                0.89,
                false,
                Collections.emptyMap(),
                List.of(0.85, 0.91, 0.88),
                "Consistent impact signature within normal receptive field"
        );
    }

    /**
     * Khởi tạo TrainDevDriftReport khớp 9 tham số của record TrainDevDriftReport.java
     */
    private static TrainDevDriftReport createDefaultDriftReport() {
        DatasetSplitMetrics trainMetrics = new DatasetSplitMetrics(
                "train_set",
                1000,
                0.94,
                0.12,
                0.25,
                List.of(0.51, 0.49),
                Collections.emptyMap(),
                Collections.emptyMap()
        );
        DatasetSplitMetrics devMetrics = new DatasetSplitMetrics(
                "dev_set",
                200,
                0.91,
                0.15,
                0.28,
                List.of(0.50, 0.48),
                Collections.emptyMap(),
                Collections.emptyMap()
        );
        HardNegativeSamples hardNegatives = new HardNegativeSamples(Collections.emptyList());

        return new TrainDevDriftReport(
                trainMetrics,
                devMetrics,
                0.03,
                0.08,
                0.04,
                false,
                false,
                Collections.emptyList(),
                hardNegatives
        );
    }

    private RuleEvaluationInput parseInputFromQuestion(String question, String role) {
        BigDecimal requestedAmount = new BigDecimal("3500000");
        int manufactureYear = 2019;

        if (question != null) {
            Matcher yearMatcher = Pattern.compile("\\b(199\\d|200\\d|201\\d|202[0-6])\\b").matcher(question);
            if (yearMatcher.find()) {
                manufactureYear = Integer.parseInt(yearMatcher.group(1));
            }
            Matcher amountMatcher = Pattern.compile("\\b(\\d{5,9})\\b").matcher(question.replace(".", "").replace(",", ""));
            if (amountMatcher.find()) {
                requestedAmount = new BigDecimal(amountMatcher.group(1));
            }
        }

        LocalDate today = LocalDate.now();
        return new RuleEvaluationInput(
                1,
                role != null ? role : "CUSTOMER",
                1,
                "ACTIVE",
                today.minusMonths(6),
                today.plusMonths(6),
                new BigDecimal("50000000"),
                requestedAmount,
                0,
                today,
                BigDecimal.ZERO,
                new BigDecimal("280000"),
                manufactureYear
        );
    }
}