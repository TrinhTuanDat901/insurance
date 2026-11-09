package com.motorbike.insurance.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractCreateRequest {
    Integer userId;
    Integer vehicleId;
    Integer packageId;
    LocalDate startDate;
    LocalDate endDate;
    String status; // "PENDING" hoặc "ACTIVE"
}