package com.motorbike.insurance.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompensationResponse {
    Integer compensationId;
    String claimCode;
    Integer contractId;
    String contractCode;
    Integer accidentId;
    Integer userId;
    String customerFullName;
    String customerPhone;
    String plateNumber;
    LocalDateTime requestDate;
    BigDecimal requestedAmount;
    BigDecimal approvedAmount;
    String description;
    String status;
    Integer resolvedByStaffId;
    LocalDateTime resolvedAt;
}