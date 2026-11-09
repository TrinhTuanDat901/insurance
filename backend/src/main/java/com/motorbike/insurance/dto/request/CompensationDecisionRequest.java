package com.motorbike.insurance.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompensationDecisionRequest {
    Integer userId;
    Integer contractId;
    Integer accidentId;
    BigDecimal requestedAmount;
    BigDecimal approvedAmount;
    String status; // "APPROVED" hoặc "REJECTED"
    String description;
}