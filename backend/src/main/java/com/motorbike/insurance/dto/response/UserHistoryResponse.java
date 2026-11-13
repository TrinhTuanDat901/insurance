// File: src/main/java/com/motorbike/insurance/dto/response/UserHistoryResponse.java
package com.motorbike.insurance.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserHistoryResponse {
    List<ContractHistoryItem> contracts;
    List<PaymentHistoryItem> payments;
    List<AccidentHistoryItem> accidents;
    List<PunishmentHistoryItem> punishments;
    List<CompensationHistoryItem> compensations;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ContractHistoryItem {
        Integer contractId;
        String contractCode;
        String plateNumber;
        String vehicleName;
        String packageName;
        LocalDate startDate;
        LocalDate endDate;
        BigDecimal premiumAmount;
        String status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentHistoryItem {
        Integer paymentId;
        String contractCode;
        BigDecimal amount;
        LocalDateTime paymentDate;
        String paymentMethod;
        String status;
        String transactionRef;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AccidentHistoryItem {
        Integer accidentId;
        String contractCode;
        String plateNumber;
        LocalDateTime accidentDate;
        String location;
        String description;
        String status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PunishmentHistoryItem {
        Integer punishmentId;
        String contractCode;
        LocalDate punishmentDate;
        String reason;
        BigDecimal fineAmount;
        String status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CompensationHistoryItem {
        Integer compensationId;
        String contractCode;
        LocalDateTime requestDate;
        BigDecimal requestedAmount;
        BigDecimal approvedAmount;
        String description;
        String status;
    }
}