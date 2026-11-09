package com.motorbike.insurance.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractResponse {
    Integer contractId;
    String contractCode;
    Integer userId;
    String customerFullName;
    String customerPhone;
    Integer vehicleId;
    String vehicleName;
    String plateNumber;
    Integer packageId;
    String packageName;
    LocalDate startDate;
    LocalDate endDate;
    BigDecimal premiumAmount;
    String status;
    LocalDateTime createdAt;
    LocalDateTime approvedAt;
    LocalDateTime cancelledAt;
    String cancelReason;
    String cardNumber;
    String qrCodeData;
}