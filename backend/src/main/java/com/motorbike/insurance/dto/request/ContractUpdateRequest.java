package com.motorbike.insurance.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractUpdateRequest {
    Integer packageId;
    LocalDate startDate;
    LocalDate endDate;
    BigDecimal premiumAmount;
    String status;
    String cancelReason;
}